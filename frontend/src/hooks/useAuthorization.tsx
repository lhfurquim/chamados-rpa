import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export interface UseAuthorizationResult {
  isAdmin: boolean;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  requireAdmin: () => boolean;
  requireAuth: () => boolean;
}

export function useAuthorization(): UseAuthorizationResult {
  const { 
    isAdmin, 
    userRole, 
    isAuthenticated, 
    isLoading, 
    hasPermission 
  } = useAuth();

  const requireAdmin = (): boolean => {
    return isAuthenticated && isAdmin;
  };

  const requireAuth = (): boolean => {
    return isAuthenticated;
  };

  return {
    isAdmin,
    userRole,
    isAuthenticated,
    isLoading,
    hasPermission,
    requireAdmin,
    requireAuth,
  };
}

export default useAuthorization;