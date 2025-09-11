import { api } from '../services/api';

export interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export const testApiEndpoints = async (): Promise<ApiTestResult[]> => {
  const endpoints = [
    { name: '/calls', description: 'Get all calls' },
    { name: '/calls/stats', description: 'Get call statistics' },
    { name: '/calls/stats/departments', description: 'Get department stats' },
    { name: '/calls/stats/technologies', description: 'Get technology stats' }
  ];

  const results: ApiTestResult[] = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint.name}`);
      const response = await api.get(endpoint.name);
      
      results.push({
        endpoint: endpoint.name,
        status: 'success',
        message: `✅ ${endpoint.description} - OK (${response.status})`,
        data: response.data
      });
      
      console.log(`✅ ${endpoint.name} - OK`, response.data);
    } catch (error: any) {
      const errorMessage = error.response 
        ? `HTTP ${error.response.status}: ${error.response.statusText}`
        : error.message || 'Unknown error';
        
      results.push({
        endpoint: endpoint.name,
        status: 'error',
        message: `❌ ${endpoint.description} - ${errorMessage}`,
        data: error
      });
      
      console.error(`❌ ${endpoint.name} - ${errorMessage}`, error);
    }
  }

  return results;
};

export const testApiConnection = async (): Promise<boolean> => {
  try {
    // Try to get basic stats endpoint
    await api.get('/calls/stats');
    console.log('✅ API connection successful');
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};