import type { Robot, CreateRobotRequest, UpdateRobotRequest, RobotFilters, ClientType, ExecutionType, RobotStatus } from '../types';
import { api, retryRequest } from '../lib/api';

// Transform backend data to frontend format
const transformRobotFromAPI = (apiRobot: any): Robot => {
  return {
    id: apiRobot.id,
    name: apiRobot.name || '',
    cell: apiRobot.cell || '',
    technology: apiRobot.technology || '',
    executionType: apiRobot.executionType || apiRobot.execution_type || 'ATTENDED',
    client: apiRobot.client || 'STEFANINI',
    status: apiRobot.status || 'ACTIVE'
  };
};

export const getRobots = async (): Promise<Robot[]> => {
  return retryRequest(async () => {
    console.log('🤖 Fetching robots from API...');
    const response = await api.get<any[]>('/robots');
    console.log('🤖 Raw API Response:', response.data);
    console.log('🤖 Number of robots received:', response.data?.length || 0);
    if (response.data?.length > 0) {
      console.log('🤖 First robot structure:', response.data[0]);
    }
    
    // Transform and validate data
    const transformedRobots = response.data?.map(transformRobotFromAPI) || [];
    console.log('🤖 Transformed robots:', transformedRobots);
    
    return transformedRobots;
  });
};

export const createRobot = async (robotData: CreateRobotRequest): Promise<Robot> => {
  return retryRequest(async () => {
    const response = await api.post<Robot>('/robots', robotData);
    return response.data;
  });
};

export const updateRobot = async (robotData: UpdateRobotRequest): Promise<Robot> => {
  return retryRequest(async () => {
    const response = await api.put<Robot>('/robots', robotData);
    return response.data;
  });
};

export const deleteRobot = async (id: number): Promise<void> => {
  return retryRequest(async () => {
    await api.delete(`/robots/${id}`);
  });
};

export const getRobotsByCell = async (cell: string): Promise<Robot[]> => {
  return retryRequest(async () => {
    const response = await api.get<Robot[]>(`/robots/cell/${cell}`);
    return response.data;
  });
};

export const getRobotsByClient = async (client: ClientType): Promise<Robot[]> => {
  return retryRequest(async () => {
    const response = await api.get<Robot[]>(`/robots/client/${client}`);
    return response.data;
  });
};

export const getRobotsByExecutionType = async (executionType: ExecutionType): Promise<Robot[]> => {
  return retryRequest(async () => {
    const response = await api.get<Robot[]>(`/robots/execution/${executionType}`);
    return response.data;
  });
};

export const getRobotsByStatus = async (status: RobotStatus): Promise<Robot[]> => {
  return retryRequest(async () => {
    const response = await api.get<Robot[]>(`/robots/status/${status}`);
    return response.data;
  });
};

export const searchRobots = async (filters: RobotFilters): Promise<Robot[]> => {
  return retryRequest(async () => {
    let robots = await getRobots();

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      robots = robots.filter(robot =>
        robot.name.toLowerCase().includes(searchTerm) ||
        robot.cell.toLowerCase().includes(searchTerm) ||
        robot.technology.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.cell) {
      robots = robots.filter(robot => robot.cell === filters.cell);
    }

    if (filters.client) {
      robots = robots.filter(robot => robot.client === filters.client);
    }

    if (filters.executionType) {
      robots = robots.filter(robot => robot.executionType === filters.executionType);
    }

    if (filters.status) {
      robots = robots.filter(robot => robot.status === filters.status);
    }

    if (filters.technology) {
      robots = robots.filter(robot => 
        robot.technology.toLowerCase().includes(filters.technology!.toLowerCase())
      );
    }

    return robots;
  });
};

export const getUniqueValues = (robots: Robot[]) => {
  const uniqueCells = Array.from(new Set(robots.map(robot => robot.cell)))
    .filter(cell => cell && cell.trim() !== '')
    .sort();
  const uniqueTechnologies = Array.from(new Set(robots.map(robot => robot.technology)))
    .filter(tech => tech && tech.trim() !== '')
    .sort();
  
  return {
    cells: uniqueCells,
    technologies: uniqueTechnologies,
    clients: ['NECXT', 'STEFANINI'] as ClientType[],
    executionTypes: ['ATTENDED', 'UNATTENDED'] as ExecutionType[],
    statuses: ['ACTIVE', 'INACTIVE'] as RobotStatus[]
  };
};