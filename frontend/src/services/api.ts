import axios, { type AxiosInstance, AxiosError, type AxiosResponse } from 'axios';
import type { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1/api/';
const REQUEST_TIMEOUT = 30000; // 30 seconds

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
});

api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
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
  (error: AxiosError<ApiError>) => {
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
          apiError.message = 'Token expirado ou inválido. Faça login novamente.';
          apiError.code = 'UNAUTHORIZED';
          
          // window.location.reload();
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