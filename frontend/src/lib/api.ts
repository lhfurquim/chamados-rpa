import axios, { type AxiosInstance, AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';
import { getTokenManager } from './tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1/api/';
const REQUEST_TIMEOUT = 30000; // 30 seconds

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
});

// Request queue for handling token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get token from TokenManager
      const tokenManager = getTokenManager();
      const token = await tokenManager.getValidToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }

      return config;
    } catch (error) {
      // If TokenManager fails, try fallback to localStorage
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.warn('TokenManager failed, using localStorage token:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokenManager = getTokenManager();
        const newToken = await tokenManager.refreshToken();

        if (newToken) {
          // Update the authorization header and retry
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          processQueue(null, newToken);
          isRefreshing = false;

          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Clear tokens and redirect to login
        try {
          const tokenManager = getTokenManager();
          tokenManager.clearToken();
        } catch (e) {
          // TokenManager might not be initialized
          localStorage.removeItem('auth_token');
          localStorage.removeItem('rpa_user');
        }

        processQueue(refreshError, null);
        isRefreshing = false;

        // Dispatch custom event for login redirect
        window.dispatchEvent(new CustomEvent('auth:session-expired', {
          detail: { reason: 'token_refresh_failed' }
        }));

        const apiError: ApiError = {
          message: 'Sessão expirada. Redirecionando para login...',
          code: 'SESSION_EXPIRED'
        };

        return Promise.reject(apiError);
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      message: 'Ocorreu um erro inesperado',
      code: 'UNKNOWN_ERROR'
    };

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          apiError.message = data?.message || 'Dados inválidos enviados';
          apiError.code = 'BAD_REQUEST';
          apiError.details = data?.details || [];
          break;
        case 401:
          // This case should be handled above, but keep as fallback
          apiError.message = 'Token expirado ou inválido. Faça login novamente.';
          apiError.code = 'UNAUTHORIZED';
          break;
        case 403:
          apiError.message = 'Acesso negado. Você não tem permissão para esta ação.';
          apiError.code = 'FORBIDDEN';
          break;
        case 404:
          apiError.message = 'Recurso não encontrado';
          apiError.code = 'NOT_FOUND';
          break;
        case 422:
          apiError.message = 'Dados de entrada inválidos';
          apiError.code = 'VALIDATION_ERROR';
          apiError.details = data?.details || [];
          break;
        case 429:
          apiError.message = 'Muitas tentativas. Tente novamente em alguns minutos.';
          apiError.code = 'TOO_MANY_REQUESTS';
          break;
        case 500:
          apiError.message = 'Erro interno do servidor. Tente novamente mais tarde.';
          apiError.code = 'INTERNAL_SERVER_ERROR';
          break;
        default:
          apiError.message = data?.message || `Erro ${status}`;
          apiError.code = `HTTP_${status}`;
      }
    } else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        apiError.message = 'Tempo limite da requisição excedido. Tente novamente.';
        apiError.code = 'TIMEOUT';
      } else if (error.message.includes('Network Error')) {
        apiError.message = 'Erro de rede. Verifique sua conexão com a internet.';
        apiError.code = 'NETWORK_ERROR';
      } else {
        apiError.message = 'Não foi possível conectar ao servidor';
        apiError.code = 'CONNECTION_ERROR';
      }
    }

    console.error('API Error:', apiError);
    return Promise.reject(apiError);
  }
);
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        if (value.length > 0 && value[0] instanceof File) {
          value.forEach((file: File) => {
            formData.append(key, file);
          });
        } else if (value.length > 0) {
          value.forEach((item: string) => {
            formData.append(key, item);
          });
        }
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};

export const retryRequest = async <T>(
  requestFn: () => Promise<T>, 
  retries: number = 3, 
  delay: number = 1000
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && error instanceof Error) {
      const apiError = error as ApiError;
      const shouldRetry = ['NETWORK_ERROR', 'CONNECTION_ERROR', 'TIMEOUT', 'INTERNAL_SERVER_ERROR']
        .includes(apiError.code || '');
      
      if (shouldRetry) {
        console.warn(`Request failed, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryRequest(requestFn, retries - 1, delay * 2);
      }
    }
    throw error;
  }
};

export default api;