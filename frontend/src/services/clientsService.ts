import type { Client, CreateClientRequest, UpdateClientRequest, ClientFilters } from '../types';
import { api, retryRequest } from '../lib/api';

// Transform backend data to frontend format
const transformClientFromAPI = (apiClient: any): Client => {
  return {
    id: apiClient.id,
    name: apiClient.name || '',
    createdAt: apiClient.createdAt || new Date().toISOString()
  };
};

export const getClients = async (): Promise<Client[]> => {
  return retryRequest(async () => {
    console.log('🏢 Fetching clients from API...');
    const response = await api.get<any[]>('/clients');
    console.log('🏢 Raw API Response:', response.data);
    console.log('🏢 Number of clients received:', response.data?.length || 0);

    if (response.data?.length > 0) {
      console.log('🏢 First client structure:', response.data[0]);
    }

    // Transform and validate data
    const transformedClients = response.data?.map(transformClientFromAPI) || [];
    console.log('🏢 Transformed clients:', transformedClients);

    return transformedClients;
  });
};

export const getClientById = async (id: number): Promise<Client> => {
  return retryRequest(async () => {
    const response = await api.get<any>(`/clients/${id}`);
    return transformClientFromAPI(response.data);
  });
};

export const searchClientsByName = async (name: string): Promise<Client[]> => {
  return retryRequest(async () => {
    const response = await api.get<any[]>(`/clients/search/${encodeURIComponent(name)}`);
    return response.data?.map(transformClientFromAPI) || [];
  });
};

export const createClient = async (clientData: CreateClientRequest): Promise<Client> => {
  return retryRequest(async () => {
    const response = await api.post<any>('/clients', clientData);
    return transformClientFromAPI(response.data);
  });
};

export const updateClient = async (clientData: UpdateClientRequest): Promise<Client> => {
  return retryRequest(async () => {
    const response = await api.put<any>('/clients', clientData);
    return transformClientFromAPI(response.data);
  });
};

export const deleteClient = async (id: number): Promise<void> => {
  return retryRequest(async () => {
    await api.delete(`/clients/${id}`);
  });
};

export const searchClients = async (filters: ClientFilters): Promise<Client[]> => {
  return retryRequest(async () => {
    if (filters.search) {
      return await searchClientsByName(filters.search);
    }

    return await getClients();
  });
};