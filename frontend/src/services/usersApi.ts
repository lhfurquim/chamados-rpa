import { api } from './api';
import type { 
  FormRespondent, 
  UserStats, 
  RequestSubmission
} from '../types';

export const getFormRespondents = async (): Promise<FormRespondent[]> => {
  try {
    const response = await api.get<FormRespondent[]>('/users/respondents');
    return response.data;
  } catch (error) {
    console.error('Error getting form respondents:', error);
    throw error;
  }
};

export const getFormRespondentById = async (id: string): Promise<FormRespondent> => {
  try {
    const response = await api.get<FormRespondent>(`/users/respondents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting form respondent by ID:', error);
    throw error;
  }
};

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await api.get<UserStats>('/users/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

export interface UserFilters {
  search?: string;
  department?: string;
  company?: string;
  isActive?: boolean;
  preferredServiceType?: FormRespondent['preferredServiceType'] | 'all';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface UserSearchResponse {
  users: FormRespondent[];
  total: number;
  page: number;
  totalPages: number;
}

export const searchFormRespondents = async (filters: UserFilters): Promise<UserSearchResponse> => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<UserSearchResponse>(`/users/respondents/search?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error searching form respondents:', error);
    throw error;
  }
};

export const getUserSubmissionHistory = async (userId: string): Promise<RequestSubmission[]> => {
  try {
    const response = await api.get<RequestSubmission[]>(`/users/respondents/${userId}/submissions`);
    return response.data;
  } catch (error) {
    console.error('Error getting user submission history:', error);
    throw error;
  }
};

export const updateUserActiveStatus = async (userId: string, isActive: boolean): Promise<FormRespondent> => {
  try {
    const response = await api.put<FormRespondent>(`/users/respondents/${userId}/status`, {
      isActive
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user active status:', error);
    throw error;
  }
};

export interface DepartmentAnalytics {
  department: string;
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  avgRequestsPerUser: number;
  topServiceType: FormRespondent['preferredServiceType'];
  recentActivity: Date;
}

export const getDepartmentAnalytics = async (): Promise<DepartmentAnalytics[]> => {
  try {
    const response = await api.get<DepartmentAnalytics[]>('/users/analytics/departments');
    return response.data;
  } catch (error) {
    console.error('Error getting department analytics:', error);
    throw error;
  }
};

export interface ActivityTrend {
  period: string; // e.g., "2025-01", "2025-W01"
  newUsers: number;
  totalSubmissions: number;
  activeUsers: number;
}

export const getUserActivityTrends = async (
  period: 'monthly' | 'weekly' = 'monthly',
  limit: number = 12
): Promise<ActivityTrend[]> => {
  try {
    const response = await api.get<ActivityTrend[]>(`/users/analytics/trends`, {
      params: { period, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user activity trends:', error);
    throw error;
  }
};

export const exportUsers = async (
  filters: UserFilters,
  format: 'xlsx' | 'csv' = 'xlsx'
): Promise<Blob> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'all') {
      params.append(key, String(value));
    }
  });

  params.append('format', format);

  const response = await api.get(`/users/respondents/export?${params}`, {
    responseType: 'blob',
  });
  
  return response.data;
};

export interface UserEngagement {
  userId: string;
  name: string;
  email: string;
  department: string;
  engagementScore: number; // 0-100
  lastSubmission: Date;
  totalSubmissions: number;
  avgTimeBetweenSubmissions: number; 
  preferredPriority: FormRespondent['avgRequestPriority'];
  riskLevel: 'low' | 'medium' | 'high';
}

export const getUserEngagementMetrics = async (): Promise<UserEngagement[]> => {
  try {
    const response = await api.get<UserEngagement[]>('/users/analytics/engagement');
    return response.data;
  } catch (error) {
    console.error('Error getting user engagement metrics:', error);
    throw error;
  }
};

export const bulkUpdateUserStatus = async (
  userIds: string[], 
  isActive: boolean
): Promise<FormRespondent[]> => {
  try {
    const response = await api.put<FormRespondent[]>('/users/respondents/bulk/status', {
      userIds,
      isActive,
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating user status:', error);
    throw error;
  }
};

export interface NotificationData {
  userIds: string[];
  subject: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export const sendUserNotification = async (notification: NotificationData): Promise<void> => {
  try {
    await api.post('/users/notifications', notification);
  } catch (error) {
    console.error('Error sending user notification:', error);
    throw error;
  }
};