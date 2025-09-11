import { api } from './api';
import type { DpCell, DpClient, DpService } from '../types';

class DpApiService {
  private cellsCache: DpCell[] | null = null;
  private clientsCache: Map<number, DpClient[]> = new Map();
  private servicesCache: Map<string, DpService[]> = new Map();

  async getCells(): Promise<DpCell[]> {
    if (this.cellsCache) {
      return this.cellsCache;
    }

    try {
      const response = await api.get<DpCell[]>('/dp/cell');
      this.cellsCache = response.data;
      return response.data;
    } catch (error) {
      console.error('Error fetching cells:', error);
      throw new Error('Erro ao carregar células. Tente novamente.');
    }
  }

  async getClientsByCell(cellId: number): Promise<DpClient[]> {
    const cacheKey = cellId;
    
    if (this.clientsCache.has(cacheKey)) {
      return this.clientsCache.get(cacheKey)!;
    }

    try {
      const response = await api.get<DpClient[]>(`/dp/client/${cellId}`);
      console.log(response.data);
      this.clientsCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching clients for cell:', cellId, error);
      throw new Error('Erro ao carregar clientes. Tente novamente.');
    }
  }

  async getServicesByCellAndClient(cellId: number, clientId: number): Promise<DpService[]> {
    const cacheKey = `${cellId}-${clientId}`;
    
    if (this.servicesCache.has(cacheKey)) {
      return this.servicesCache.get(cacheKey)!;
    }

    try {
      const response = await api.get<DpService[]>(`/dp/service/${cellId}/${clientId}`);
      this.servicesCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching services for cell and client:', cellId, clientId, error);
      throw new Error('Erro ao carregar serviços. Tente novamente.');
    }
  }

  clearCache(): void {
    this.cellsCache = null;
    this.clientsCache.clear();
    this.servicesCache.clear();
  }

  clearClientCache(): void {
    this.clientsCache.clear();
  }

  clearServiceCache(): void {
    this.servicesCache.clear();
  }
}

export const dpApiService = new DpApiService();