import type {
  Demand,
  CreateDemandRequest,
  UpdateDemandRequest,
  DemandFilters,
  GetAllDemandsResponse,
  DemandStatus,
  ServiceType
} from '../types';
import { api, retryRequest } from '../lib/api';

// Transform backend data to frontend format
const transformDemandFromAPI = (apiDemand: any): Demand => {
  return {
    id: apiDemand.id,
    name: apiDemand.name || '',
    docHours: apiDemand.docHours || 0,
    devHours: apiDemand.devHours || 0,
    type: apiDemand.type || 'MELHORIA',
    description: apiDemand.description || '',
    focalPoint: {
      id: apiDemand.focalPoint?.id || '',
      name: apiDemand.focalPoint?.name || '',
      email: apiDemand.focalPoint?.email || '',
      phone: apiDemand.focalPoint?.phone,
      department: apiDemand.focalPoint?.department || '',
      company: apiDemand.focalPoint?.company || '',
      role: apiDemand.focalPoint?.role,
      isActive: apiDemand.focalPoint?.isActive ?? true,
      requestsSubmitted: apiDemand.focalPoint?.requestsSubmitted,
      lastActivity: apiDemand.focalPoint?.lastActivity,
      joinedAt: apiDemand.focalPoint?.joinedAt
    },
    analyst: {
      id: apiDemand.analyst?.id || '',
      name: apiDemand.analyst?.name || '',
      email: apiDemand.analyst?.email || '',
      phone: apiDemand.analyst?.phone,
      department: apiDemand.analyst?.department || '',
      company: apiDemand.analyst?.company || '',
      role: apiDemand.analyst?.role,
      isActive: apiDemand.analyst?.isActive ?? true,
      requestsSubmitted: apiDemand.analyst?.requestsSubmitted,
      lastActivity: apiDemand.analyst?.lastActivity,
      joinedAt: apiDemand.analyst?.joinedAt
    },
    project: {
      id: apiDemand.project?.id || 0,
      name: apiDemand.project?.name || '',
      description: apiDemand.project?.description || '',
      area: apiDemand.project?.area || 'INTERN',
      client: {
        id: apiDemand.project?.client?.id || 0,
        name: apiDemand.project?.client?.name || '',
        createdAt: apiDemand.project?.client?.createdAt || new Date().toISOString()
      }
    },
    status: apiDemand.status || 'BACKLOG',
    robot: {
      id: apiDemand.robot?.id || 0,
      name: apiDemand.robot?.name || '',
      cell: apiDemand.robot?.cell || '',
      technology: apiDemand.robot?.technology || '',
      executionType: apiDemand.robot?.executionType || 'ATTENDED',
      client: apiDemand.robot?.client || 'STEFANINI',
      status: apiDemand.robot?.status || 'ACTIVE'
    },
    client: apiDemand.client || 0,
    service: apiDemand.service || 0,
    openedAt: apiDemand.openedAt,
    startAt: apiDemand.startAt,
    endsAt: apiDemand.endsAt,
    endedAt: apiDemand.endedAt,
    createdAt: apiDemand.createdAt || new Date().toISOString(),
    roi: apiDemand.roi
  };
};

export const getDemands = async (): Promise<Demand[]> => {
  return retryRequest(async () => {
    console.log('📊 Fetching demands from API...');
    const response = await api.get<GetAllDemandsResponse>('/demands');
    console.log('📊 Raw API Response:', response.data);

    const demandsArray = response.data?.demands || [];
    console.log('📊 Number of demands received:', demandsArray.length);

    if (demandsArray.length > 0) {
      console.log('📊 First demand structure:', demandsArray[0]);
    }

    // Transform and validate data
    const transformedDemands = demandsArray.map(transformDemandFromAPI);
    console.log('📊 Transformed demands:', transformedDemands);

    return transformedDemands;
  });
};

export const getDemandById = async (id: number): Promise<Demand> => {
  return retryRequest(async () => {
    const response = await api.get<any>(`/demands/${id}`);
    return transformDemandFromAPI(response.data);
  });
};

export const createDemand = async (demandData: CreateDemandRequest): Promise<Demand> => {
  return retryRequest(async () => {
    const response = await api.post<any>('/demands', demandData);
    return transformDemandFromAPI(response.data);
  });
};

export const updateDemand = async (demandData: UpdateDemandRequest): Promise<Demand> => {
  return retryRequest(async () => {
    const response = await api.put<any>('/demands', demandData);
    return transformDemandFromAPI(response.data);
  });
};

export const deleteDemand = async (id: number): Promise<void> => {
  return retryRequest(async () => {
    await api.delete(`/demands/${id}`);
  });
};

// Filter by status
export const getDemandsByStatus = async (status: DemandStatus): Promise<Demand[]> => {
  return retryRequest(async () => {
    const response = await api.get<Demand[]>(`/demands/status/${status}`);
    return response.data?.map(transformDemandFromAPI) || [];
  });
};

// Filter by project
export const getDemandsByProject = async (projectId: number): Promise<Demand[]> => {
  return retryRequest(async () => {
    const response = await api.get<Demand[]>(`/demands/project/${projectId}`);
    return response.data?.map(transformDemandFromAPI) || [];
  });
};

// Filter by robot
export const getDemandsByRobot = async (robotId: number): Promise<Demand[]> => {
  return retryRequest(async () => {
    const response = await api.get<Demand[]>(`/demands/robot/${robotId}`);
    return response.data?.map(transformDemandFromAPI) || [];
  });
};

// Filter by type
export const getDemandsByType = async (type: ServiceType): Promise<Demand[]> => {
  return retryRequest(async () => {
    const response = await api.get<Demand[]>(`/demands/type/${type}`);
    return response.data?.map(transformDemandFromAPI) || [];
  });
};

export const searchDemands = async (filters: DemandFilters): Promise<Demand[]> => {
  return retryRequest(async () => {
    let demands: Demand[] = [];

    // Use specific API endpoints when available
    if (filters.status) {
      demands = await getDemandsByStatus(filters.status);
    } else if (filters.projectId) {
      demands = await getDemandsByProject(filters.projectId);
    } else if (filters.robotId) {
      demands = await getDemandsByRobot(filters.robotId);
    } else if (filters.type) {
      demands = await getDemandsByType(filters.type);
    } else {
      demands = await getDemands();
    }

    // Apply local filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      demands = demands.filter(demand =>
        demand.name.toLowerCase().includes(searchTerm) ||
        demand.description.toLowerCase().includes(searchTerm) ||
        demand.focalPoint.name.toLowerCase().includes(searchTerm) ||
        demand.analyst.name.toLowerCase().includes(searchTerm) ||
        demand.project.name.toLowerCase().includes(searchTerm) ||
        demand.robot.name.toLowerCase().includes(searchTerm)
      );
    }

    return demands;
  });
};

// Helper functions for UI
export const getDemandStatusLabel = (status: DemandStatus): string => {
  switch (status) {
    case 'BACKLOG':
      return 'Backlog';
    case 'ASSESSMENT':
      return 'Avaliação';
    case 'COST_APPROVAL':
      return 'Aprovação de Custo';
    case 'DEVELOPING':
      return 'Desenvolvimento';
    case 'DEPLOYING':
      return 'Implantação';
    case 'CLIENT_APPROVAL':
      return 'Aprovação do Cliente';
    case 'COMPLETED':
      return 'Concluído';
    case 'BLOCKED':
      return 'Bloqueado';
    case 'CANCELED':
      return 'Cancelado';
    default:
      return status;
  }
};

export const getDemandStatusColor = (status: DemandStatus): string => {
  switch (status) {
    case 'BACKLOG':
      return 'bg-gray-100 text-gray-800';
    case 'ASSESSMENT':
      return 'bg-blue-100 text-blue-800';
    case 'COST_APPROVAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'DEVELOPING':
      return 'bg-purple-100 text-purple-800';
    case 'DEPLOYING':
      return 'bg-indigo-100 text-indigo-800';
    case 'CLIENT_APPROVAL':
      return 'bg-orange-100 text-orange-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'BLOCKED':
      return 'bg-red-100 text-red-800';
    case 'CANCELED':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getServiceTypeLabel = (type: ServiceType): string => {
  switch (type) {
    case 'MELHORIA':
      return 'Melhoria';
    case 'SUSTENTACAO':
      return 'Sustentação';
    case 'NOVO_PROJETO':
      return 'Novo Projeto';
    default:
      return type;
  }
};

export const getServiceTypeColor = (type: ServiceType): string => {
  switch (type) {
    case 'MELHORIA':
      return 'bg-amber-100 text-amber-800';
    case 'SUSTENTACAO':
      return 'bg-green-100 text-green-800';
    case 'NOVO_PROJETO':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};