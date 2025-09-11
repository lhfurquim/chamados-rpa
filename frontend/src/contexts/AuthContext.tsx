import { createContext, useContext, type ReactNode } from 'react';
import { useMsalAuth } from '../hooks/useMsalAuth';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const msalAuth = useMsalAuth();

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