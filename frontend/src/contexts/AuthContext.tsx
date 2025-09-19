import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useMsalAuth } from '../hooks/useMsalAuth';
import { handleTokenExpiry, ensureValidSession } from '../services/authService';
import type { FormRespondent, UserRole } from '../types';

interface AuthContextType {
  user: FormRespondent | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<FormRespondent>) => void;
  error: string | null;
  isAuthenticated: boolean;
  isRegistered: boolean | null;
  registrationError: string | null;
  isAdmin: boolean;
  userRole: UserRole | null;
  hasPermission: (permission: string) => boolean;
  isRefreshingToken: boolean;
  handleSessionExpiry: () => Promise<boolean>;
  checkSessionValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const msalAuth = useMsalAuth();
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  const isAdmin = msalAuth.user?.isAdmin ?? false;
  const userRole = msalAuth.user?.userRole ?? (isAdmin ? 'admin' : 'user');

  const hasPermission = (permission: string): boolean => {
    switch (permission) {
      case 'dashboard:access':
        return isAdmin;
      case 'calls:view':
        return isAdmin;
      case 'analytics:view':
        return isAdmin;
      case 'users:view':
        return isAdmin;
      case 'settings:access':
        return isAdmin;
      default:
        return false;
    }
  };

  // Handle session expiry with token refresh
  const handleSessionExpiry = async (): Promise<boolean> => {
    if (isRefreshingToken) {
      return false; // Already refreshing
    }

    setIsRefreshingToken(true);

    try {
      const msalFallback = msalAuth.acquireAccessToken;
      const result = await handleTokenExpiry(msalFallback);

      if (result.success) {
        console.log('Session refreshed successfully');
        return true;
      } else if (result.redirectToLogin) {
        console.log('Session expired, redirecting to login');
        await msalAuth.logout();
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error handling session expiry:', error);
      await msalAuth.logout();
      return false;
    } finally {
      setIsRefreshingToken(false);
    }
  };

  // Check if current session is valid
  const checkSessionValidity = async (): Promise<boolean> => {
    try {
      const msalFallback = msalAuth.acquireAccessToken;
      return await ensureValidSession(msalFallback);
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  };

  // Listen for session expiry events from API interceptor
  useEffect(() => {
    const handleSessionExpiredEvent = async (event: CustomEvent) => {
      const { reason } = event.detail || {};
      console.log('Session expired event received:', reason);

      const refreshSuccess = await handleSessionExpiry();
      if (!refreshSuccess) {
        console.log('Failed to refresh session, logging out');
      }
    };

    window.addEventListener('auth:session-expired', handleSessionExpiredEvent as EventListener);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpiredEvent as EventListener);
    };
  }, [isRefreshingToken]);

  // Periodic session validation (every 10 minutes)
  useEffect(() => {
    if (!msalAuth.isAuthenticated) return;

    const interval = setInterval(async () => {
      const isValid = await checkSessionValidity();
      if (!isValid) {
        console.log('Session validation failed during periodic check');
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [msalAuth.isAuthenticated]);

  const value: AuthContextType = {
    user: msalAuth.user,
    isLoading: msalAuth.isLoading,
    login: msalAuth.login,
    logout: msalAuth.logout,
    updateUser: msalAuth.updateUser,
    error: msalAuth.error,
    isAuthenticated: msalAuth.isAuthenticated,
    isRegistered: msalAuth.isRegistered,
    registrationError: msalAuth.registrationError,
    isAdmin,
    userRole,
    hasPermission,
    isRefreshingToken,
    handleSessionExpiry,
    checkSessionValidity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}