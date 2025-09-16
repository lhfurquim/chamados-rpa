import { type AxiosResponse } from 'axios';
import { api, retryRequest } from '../lib/api';
import { 
  transformMelhoriaForSubmission,
  transformSustentacaoForSubmission,
  transformNovoProjetoForSubmission 
} from '../utils/dataMappers';
import { transformCallsFromAPI, transformCallFromAPI, transformStatsFromAPI } from '../lib/apiTransformers';
import type {  
  Call, 
  CallStats, 
  SubmissionResponse,
  TimelineStats
} from '../types';

export const submitCall = async (formData: any): Promise<SubmissionResponse> => {
  const submitRequest = async () => {
    try {
      const serviceType = formData.serviceType;
      let transformedData: any;
      let endpoint: string;
      let needsMultipart = false;
      
      switch (serviceType) {
        case 'MELHORIA':
          transformedData = transformMelhoriaForSubmission(formData);
          endpoint = 'calls/melhoria';
          needsMultipart = true;
          break;
        case 'SUSTENTACAO':
          transformedData = transformSustentacaoForSubmission(formData);
          endpoint = 'calls/sustentacao';
          needsMultipart = true;
          break;
        case 'NOVO_PROJETO':
          transformedData = transformNovoProjetoForSubmission(formData);
          endpoint = 'calls/novo-projeto';
          needsMultipart = true;
          break;
        default:
          throw new Error(`Tipo de serviço inválido: ${serviceType}`);
      }

      let response: AxiosResponse<SubmissionResponse>;

      if (needsMultipart) {
        const formDataObj = new FormData();
        
        const requestBlob = new Blob([JSON.stringify(transformedData)], { type: 'application/json' });
        formDataObj.append('request', requestBlob);
        
        if (formData.documentacaoFiles && formData.documentacaoFiles.length > 0) {
          formData.documentacaoFiles.forEach((file: File) => {
            formDataObj.append('documentacaoFiles', file);
          });
        }
        
        if (formData.evidenciasFiles && formData.evidenciasFiles.length > 0) {
          formData.evidenciasFiles.forEach((file: File) => {
            formDataObj.append('evidenciasFiles', file);
          });
        }
        
        console.log(`Submitting to ${endpoint} with multipart data`);

        response = await api.post<SubmissionResponse>(endpoint, formDataObj, {
          timeout: 60000
        });
      } else {
        console.log(`Submitting to ${endpoint} with JSON data`);
        response = await api.post<SubmissionResponse>(endpoint, transformedData, {
          timeout: 60000
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error submitting call:', error);
      throw error;
    }
  };

  return retryRequest(submitRequest, 2, 2000);
};

export const getCalls = async (): Promise<Call[]> => {
  try {
    const response = await api.get<any[]>('calls');
    return transformCallsFromAPI(response.data);
  } catch (error) {
    console.error('Error getting calls:', error);
    throw error;
  }
};

export const getCallById = async (id: string): Promise<Call> => {
  try {
    const response = await api.get<any>(`calls/${id}`);
    return transformCallFromAPI(response.data);
  } catch (error) {
    console.error('Error getting call by ID:', error);
    throw error;
  }
};


export const getCallStats = async (): Promise<CallStats> => {
  try {
    const response = await api.get<any>('calls/stats');
    return transformStatsFromAPI(response.data);
  } catch (error) {
    console.error('Error getting call stats:', error);
    throw error;
  }
};

export interface CallFilters {
  search?: string;
  serviceType?: Call['serviceType'] | 'all';
  celula?: string;
  submittedBy?: string; // User ID filter
  department?: string; // User department filter
  company?: string; // User company filter
  technology?: string; // Technology filter
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CallSearchResponse {
  calls: Call[];
  total: number;
  page: number;
  totalPages: number;
}

export const searchCalls = async (filters: CallFilters): Promise<CallSearchResponse> => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<any>(`calls/search?${params}`);
    const apiResponse = response.data;
    
    return {
      calls: transformCallsFromAPI(apiResponse.calls || []),
      total: apiResponse.total || 0,
      page: apiResponse.page || 0,
      totalPages: apiResponse.totalPages || 0
    };
  } catch (error) {
    console.error('Error searching calls:', error);
    throw error;
  }
};

export const updateCall = async (id: string, updateData: Partial<Call>): Promise<Call> => {
  try { 
    const response = await api.put<any>(`calls/${id}`, updateData);
    return transformCallFromAPI(response.data);
  } catch (error) {
    console.error('Error updating call:', error);
    throw error;
  }
};

export const deleteCall = async (id: string): Promise<void> => {
  try {
    await api.delete(`calls/${id}`);
  } catch (error) {
    console.error('Error deleting call:', error);
    throw error;
  }
};

export const downloadAttachment = async (callId: string, filename: string): Promise<Blob> => {
  const response = await api.get(`calls/${callId}/attachments/${filename}`, {
    responseType: 'blob',
  });
  
  return response.data;
};

export const bulkUpdateCalls = async (
  callIds: string[],
  updates: Partial<Call>
): Promise<Call[]> => {
  try {
    const response = await api.put<Call[]>('calls/bulk', {
      callIds,
      updates,
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating calls:', error);
    throw error;
  }
};

export const exportCalls = async (
  filters: CallFilters,
  format: 'xlsx' | 'csv' = 'xlsx'
): Promise<Blob> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.append(key, String(value));
    }
  });

  params.append('format', format);

  const response = await api.get(`calls/export?${params}`, {
    responseType: 'blob',
  });
  
  return response.data;
};

export const getCallsByUser = async (userId: string): Promise<Call[]> => {
  try {
    const response = await api.get<any[]>(`calls/user/${userId}`);
    return transformCallsFromAPI(response.data);
  } catch (error) {
    console.error('Error getting calls by user:', error);
    throw error;
  }
};

export const getDepartmentStats = async (): Promise<Record<string, number>> => {
  try {
    const response = await api.get<Record<string, number>>('calls/stats/departments');
    return response.data;
  } catch (error) {
    console.error('Error getting department stats:', error);
    throw error;
  }
};

export const getTechnologyStats = async (): Promise<Record<string, number>> => {
  try {
    const response = await api.get<Record<string, number>>('calls/stats/technologies');
    return response.data;
  } catch (error) {
    console.error('Error getting technology stats:', error);
    throw error;
  }
};

export interface UserTicketMetrics {
  userId: string;
  userName: string;
  department: string;
  totalTickets: number;
  ticketsByServiceType: Record<string, number>;
  lastSubmission: Date;
  avgResponseTime: number;
}

export const getUserTicketMetrics = async (): Promise<UserTicketMetrics[]> => {
  try {
    const response = await api.get<any[]>('calls/stats/users');
    return response.data.map((item: any) => ({
      userId: item.userId,
      userName: item.userName,
      department: item.department,
      totalTickets: Number(item.totalTickets),
      ticketsByServiceType: item.ticketsByServiceType || {},
      lastSubmission: new Date(item.lastSubmission),
      avgResponseTime: Number(item.avgResponseTime)
    }));
  } catch (error) {
    console.error('Error getting user ticket metrics:', error);
    throw error;
  }
};

export const getTimelineStats = async (weeks: number = 8): Promise<TimelineStats[]> => {
  try {
    const response = await api.get<TimelineStats[]>(`calls/stats/timeline?weeks=${weeks}`);
    return response.data;
  } catch (error) {
    console.error('Error getting timeline stats:', error);
    throw error;
  }
};