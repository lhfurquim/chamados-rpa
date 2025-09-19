import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
  GetAllProjectsResponse,
  Area
} from '../types';
import { api, retryRequest } from '../lib/api';

// Transform backend data to frontend format
const transformProjectFromAPI = (apiProject: any): Project => {
  return {
    id: apiProject.id,
    name: apiProject.name || '',
    description: apiProject.description || '',
    area: apiProject.area || 'INTERN',
    client: {
      id: apiProject.client?.id || 0,
      name: apiProject.client?.name || '',
      createdAt: apiProject.client?.createdAt || new Date().toISOString()
    }
  };
};

export const getProjects = async (): Promise<Project[]> => {
  return retryRequest(async () => {
    console.log('📋 Fetching projects from API...');
    const response = await api.get<GetAllProjectsResponse>('/projects');
    console.log('📋 Raw API Response:', response.data);

    const projectsArray = response.data?.projects || [];
    console.log('📋 Number of projects received:', projectsArray.length);

    if (projectsArray.length > 0) {
      console.log('📋 First project structure:', projectsArray[0]);
    }

    // Transform and validate data
    const transformedProjects = projectsArray.map(transformProjectFromAPI);
    console.log('📋 Transformed projects:', transformedProjects);

    return transformedProjects;
  });
};

export const getProjectById = async (id: number): Promise<Project> => {
  return retryRequest(async () => {
    const response = await api.get<any>(`/projects/${id}`);
    return transformProjectFromAPI(response.data);
  });
};

export const createProject = async (projectData: CreateProjectRequest): Promise<Project> => {
  return retryRequest(async () => {
    const response = await api.post<any>('/projects', projectData);
    return transformProjectFromAPI(response.data);
  });
};

export const updateProject = async (projectData: UpdateProjectRequest): Promise<Project> => {
  return retryRequest(async () => {
    const response = await api.put<any>('/projects', projectData);
    return transformProjectFromAPI(response.data);
  });
};

export const deleteProject = async (id: number): Promise<void> => {
  return retryRequest(async () => {
    await api.delete(`/projects/${id}`);
  });
};

export const searchProjects = async (filters: ProjectFilters): Promise<Project[]> => {
  return retryRequest(async () => {
    let projects = await getProjects();

    // Filter by search term (name or description)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      projects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.client.name.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by area
    if (filters.area) {
      projects = projects.filter(project => project.area === filters.area);
    }

    // Filter by client
    if (filters.clientId) {
      projects = projects.filter(project => project.client.id === filters.clientId);
    }

    return projects;
  });
};

// Helper function to get area label
export const getAreaLabel = (area: Area): string => {
  switch (area) {
    case 'INTERN':
      return 'Interno';
    case 'EXTERNAL':
      return 'Externo';
    default:
      return area;
  }
};

// Helper function to get area color for badges
export const getAreaColor = (area: Area): string => {
  switch (area) {
    case 'INTERN':
      return 'bg-blue-100 text-blue-800';
    case 'EXTERNAL':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};