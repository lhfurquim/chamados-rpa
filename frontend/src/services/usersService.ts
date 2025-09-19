import type { SubmitterInfo } from '../types';
import { api, retryRequest } from '../lib/api';

// Transform backend data to frontend format
const transformSubmitterInfoFromAPI = (apiUser: any): SubmitterInfo => {
  return {
    id: apiUser.id || '',
    name: apiUser.name || '',
    email: apiUser.email || '',
    phone: apiUser.phone,
    department: apiUser.department || '',
    company: apiUser.company || '',
    role: apiUser.role,
    isActive: apiUser.isActive ?? true,
    requestsSubmitted: apiUser.requestsSubmitted,
    lastActivity: apiUser.lastActivity,
    joinedAt: apiUser.joinedAt
  };
};

export const getUsers = async (): Promise<SubmitterInfo[]> => {
  return retryRequest(async () => {
    console.log('👥 Fetching users from API...');
    const response = await api.get<SubmitterInfo[]>('/users/respondents');
    console.log('👥 Raw API Response:', response.data);
    console.log('👥 Number of users received:', response.data?.length || 0);

    if (response.data?.length > 0) {
      console.log('👥 First user structure:', response.data[0]);
    }

    // Transform and validate data
    const transformedUsers = response.data?.map(transformSubmitterInfoFromAPI) || [];
    console.log('👥 Transformed users:', transformedUsers);

    return transformedUsers;
  });
};

export const getUserById = async (id: string): Promise<SubmitterInfo> => {
  return retryRequest(async () => {
    const response = await api.get<any>(`/users/respondents/${id}`);
    return transformSubmitterInfoFromAPI(response.data);
  });
};

export const getUserByEmail = async (email: string): Promise<SubmitterInfo> => {
  return retryRequest(async () => {
    const response = await api.get<any>(`/users/respondents/by-email/${encodeURIComponent(email)}`);
    return transformSubmitterInfoFromAPI(response.data);
  });
};

export const searchUsers = async (searchTerm?: string, department?: string, company?: string, isActive?: boolean): Promise<SubmitterInfo[]> => {
  return retryRequest(async () => {
    const params = new URLSearchParams();

    if (searchTerm) params.append('search', searchTerm);
    if (department) params.append('department', department);
    if (company) params.append('company', company);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    params.append('limit', '100'); // Large limit to get most users

    const queryString = params.toString();
    const url = `/users/respondents/search${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<{
      users: SubmitterInfo[];
      total: number;
      page: number;
      totalPages: number;
    }>(url);

    return response.data.users?.map(transformSubmitterInfoFromAPI) || [];
  });
};

export const createUser = async (userData: Omit<SubmitterInfo, 'id' | 'requestsSubmitted' | 'lastActivity' | 'joinedAt'>): Promise<SubmitterInfo> => {
  return retryRequest(async () => {
    const response = await api.post<any>('/users/respondents', userData);
    return transformSubmitterInfoFromAPI(response.data);
  });
};

export const updateUserActiveStatus = async (id: string, isActive: boolean): Promise<SubmitterInfo> => {
  return retryRequest(async () => {
    const response = await api.put<any>(`/users/respondents/${id}/status`, { isActive });
    return transformSubmitterInfoFromAPI(response.data);
  });
};

export const getCurrentUser = async (): Promise<SubmitterInfo> => {
  return retryRequest(async () => {
    const response = await api.get<any>('/users/me');
    return transformSubmitterInfoFromAPI(response.data);
  });
};

// Helper function for SearchableSelect options
export const getUsersAsSelectOptions = async (searchTerm?: string) => {
  const users = searchTerm ? await searchUsers(searchTerm) : await getUsers();

  return users
    .filter(user => user.isActive)
    .map(user => ({
      value: user.id,
      label: `${user.name} (${user.email}) - ${user.department}`
    }));
};

// Get department analytics
export const getDepartmentAnalytics = async () => {
  return retryRequest(async () => {
    const response = await api.get<Array<{ department: string; userCount: number; requestCount: number }>>('/users/analytics/departments');
    return response.data;
  });
};

// Get user stats
export const getUserStats = async () => {
  return retryRequest(async () => {
    const response = await api.get<{
      totalUsers: number;
      activeUsers: number;
      newUsersThisMonth: number;
      topDepartments: Array<{ department: string; userCount: number; requestCount: number }>;
    }>('/users/stats');
    return response.data;
  });
};