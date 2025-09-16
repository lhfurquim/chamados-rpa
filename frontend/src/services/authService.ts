import { api } from '../lib/api';
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