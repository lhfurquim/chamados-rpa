import { api } from '../lib/api';
import type { 
  Call, 
  CallStats, 
  UserTicketMetrics,
  DepartmentStat
} from '../types';

export interface DashboardData {
  callStats: CallStats;
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  topDepartments: DepartmentStat[];
  departmentStats: Record<string, number>;
  technologyStats: Record<string, number>;
  topUsersByTickets: UserTicketMetrics[];
  recentCalls: Call[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await api.get<DashboardData>('calls/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw error;
  }
};