import type { Robot, CreateRobotRequest, UpdateRobotRequest, RobotFilters, ClientType, ExecutionType, RobotStatus } from '../types';
import { api, retryRequest } from './api';

export const getRobots = async (): Promise<Robot[]> => {
  return retryRequest(async () => {
    const response = await api.get<Robot[]>('/robots');
    return response.data;
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
  const uniqueCells = Array.from(new Set(robots.map(robot => robot.cell))).sort();
  const uniqueTechnologies = Array.from(new Set(robots.map(robot => robot.technology))).sort();
  
  return {
    cells: uniqueCells,
    technologies: uniqueTechnologies,
    clients: ['NECXT', 'STEFANINI'] as ClientType[],
    executionTypes: ['ATTENDED', 'UNATTENDED'] as ExecutionType[],
    statuses: ['ACTIVE', 'INACTIVE'] as RobotStatus[]
  };
};