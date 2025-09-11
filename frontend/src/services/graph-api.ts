import axios from "axios";

export const graphApi = axios.create({
  baseURL: 'https://graph.microsoft.com/v1.0/me'
});

export interface GraphUserProfile {
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  mobilePhone?: string;
  department?: string;
  companyName?: string;
}

export const getUserProfile = async (accessToken: string): Promise<GraphUserProfile> => {
  const fields = [
    'displayName',
    'mail', 
    'userPrincipalName',
    'jobTitle',
    'mobilePhone',
    'department',
    'companyName'
  ];
  
  const response = await graphApi.get(`?$select=${fields.join(',')}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  
  return response.data;
};