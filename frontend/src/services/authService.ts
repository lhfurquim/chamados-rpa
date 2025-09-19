import { api } from '../lib/api';
import { getTokenManager } from '../lib/tokenManager';
import type { FormRespondent, LoginCredentials } from '../types';

export const login = async (credentials: LoginCredentials): Promise<{ user: FormRespondent; token: string }> => {
  try {
    const response = await api.post<{ user: FormRespondent; token: string }>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<FormRespondent> => {
  try {
    const response = await api.get<FormRespondent>('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<{ token: string }> => {
  try {
    const response = await api.post<{ token: string }>('/auth/refresh');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

export const checkUserRegistration = async (email: string): Promise<FormRespondent | null> => {
  try {
    const response = await api.get<FormRespondent>(`/users/respondents/by-email/${encodeURIComponent(email)}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    console.error('Error checking user registration:', error);
    throw error;
  }
};

export const createUserFromSSO = async (ssoUserData: {
  email: string;
  name: string;
  phone?: string;
  department?: string;
  company?: string;
  role?: string
}): Promise<FormRespondent> => {
  try {
    const userData = {
      email: ssoUserData.email,
      name: ssoUserData.name,
      phone: ssoUserData.phone || '',
      department: ssoUserData.department || 'Não informado',
      role: ssoUserData.role,
      company: ssoUserData.company || 'Torre RPA',
      isActive: true,
    };

    const response = await api.post<FormRespondent>('/users/respondents', userData);

    return response.data;
  } catch (error: any) {
    console.error('Error creating user from SSO:', error);

    if (error?.response?.status === 409 || error?.response?.status === 400) {
      const existingUser = await checkUserRegistration(ssoUserData.email);
      if (existingUser) {
        return existingUser;
      }
    }

    throw error;
  }
};

// Enhanced token refresh with fallback mechanisms
export const refreshTokenWithFallback = async (msalFallback?: () => Promise<string | null>): Promise<string | null> => {
  try {
    const tokenManager = getTokenManager();
    return await tokenManager.refreshToken();
  } catch (error) {
    console.error('Token refresh failed:', error);

    // Try MSAL fallback if provided
    if (msalFallback) {
      try {
        console.log('Attempting MSAL fallback...');
        const msalToken = await msalFallback();
        if (msalToken) {
          // Store the new token in TokenManager
          const tokenManager = getTokenManager();
          tokenManager.setToken(msalToken, {
            tokenType: 'msal',
            expiresIn: 3600 // Default 1 hour
          });
          return msalToken;
        }
      } catch (msalError) {
        console.error('MSAL fallback failed:', msalError);
      }
    }

    return null;
  }
};

// Validate if current token is still valid
export const validateTokenExpiry = (): boolean => {
  try {
    const tokenManager = getTokenManager();
    return tokenManager.isAuthenticated();
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Handle complete token expiry flow
export const handleTokenExpiry = async (msalFallback?: () => Promise<string | null>): Promise<{
  success: boolean;
  token?: string;
  redirectToLogin: boolean;
}> => {
  try {
    console.log('Handling token expiry...');

    // Attempt to refresh token
    const newToken = await refreshTokenWithFallback(msalFallback);

    if (newToken) {
      console.log('Token refreshed successfully');
      return {
        success: true,
        token: newToken,
        redirectToLogin: false
      };
    }

    // If refresh failed, clear tokens and redirect to login
    console.log('Token refresh failed, clearing session...');

    try {
      const tokenManager = getTokenManager();
      tokenManager.clearToken();
    } catch (e) {
      // Fallback token clearing
      localStorage.removeItem('auth_token');
      localStorage.removeItem('rpa_user');
    }

    return {
      success: false,
      redirectToLogin: true
    };

  } catch (error) {
    console.error('Error handling token expiry:', error);

    // Clear tokens on any error
    try {
      const tokenManager = getTokenManager();
      tokenManager.clearToken();
    } catch (e) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('rpa_user');
    }

    return {
      success: false,
      redirectToLogin: true
    };
  }
};

// Initialize TokenManager with proper configuration
export const initializeTokenManager = (msalFallback: () => Promise<string | null>) => {
  const { initializeTokenManager } = require('../lib/tokenManager');

  return initializeTokenManager({
    refreshThreshold: 5, // 5 minutes before expiry
    maxRetries: 3,
    storageKey: 'rpa_token_info',
    msalFallback
  });
};

// Check if user session is valid and refresh if needed
export const ensureValidSession = async (msalFallback?: () => Promise<string | null>): Promise<boolean> => {
  try {
    const tokenManager = getTokenManager();
    const token = await tokenManager.getValidToken();
    return !!token;
  } catch (error) {
    console.error('Session validation failed:', error);

    if (msalFallback) {
      const result = await handleTokenExpiry(msalFallback);
      return result.success;
    }

    return false;
  }
};