import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError, InteractionStatus, type AccountInfo } from '@azure/msal-browser';
import { loginRequest } from '../auth/sso';
import { createUserFromSSO, initializeTokenManager } from '../services/authService';
import { isAdminUser } from '../config/adminUsers';
import type { FormRespondent } from '../types';
import { getUserProfile, type GraphUserProfile } from '../lib/graph-api';

interface MsalAuthState {
  user: FormRespondent | null;
  isLoading: boolean;
  error: string | null;
  isRegistered: boolean | null;
  registrationError: string | null;
  accessToken: string | null;
}

const mapGraphDataToUserInfo = (graphData: GraphUserProfile, msalAccount: AccountInfo) => {
  const getDepartment = () => {
    if (graphData.department) return graphData.department;
    return 'Não informado';
  };

  const getCompany = () => {
    if (graphData.companyName) return graphData.companyName;
    return 'Torre RPA';
  };

  return {
    email: msalAccount.username,
    name: msalAccount.name || graphData.displayName || msalAccount.username,
    phone: graphData.mobilePhone || '',
    department: getDepartment(),
    company: getCompany(),
    role: graphData.jobTitle || ''
  };
};

export function useMsalAuth() {
  const { instance, accounts, inProgress } = useMsal();
  const [authState, setAuthState] = useState<MsalAuthState>({
    user: null,
    isLoading: true,
    error: null,
    isRegistered: null,
    registrationError: null,
    accessToken: null,
  });

  const isAuthenticated = accounts.length > 0;
  const account = accounts[0] || null;

  // Initialize TokenManager with MSAL fallback
  useEffect(() => {
    if (account) {
      const msalFallback = async () => {
        return await acquireAccessToken(account);
      };

      try {
        initializeTokenManager(msalFallback);
      } catch (error) {
        console.error('Failed to initialize TokenManager:', error);
      }
    }
  }, [account]);

  const acquireAccessToken = async (account: AccountInfo): Promise<string | null> => {
    const request = {
      ...loginRequest,
      account: account,
    };

    try {
      const response = await instance.acquireTokenSilent(
        request
      );

      console.log('Access token acquired successfully');
      return response.accessToken;
    } catch (error: any) {
      console.warn('Silent token acquisition failed:', error);

      if (error instanceof InteractionRequiredAuthError) {
        try {
          const response = await instance.acquireTokenPopup(
            request
          );
          console.log('Access token after popup:', response.accessToken);
          return response.accessToken;
        } catch (popupError: any) {
          console.error('Interactive token acquisition failed:', popupError);
        };
      };
      return null;
    }
  };

  const checkRegistrationAndGetProfile = async (msalAccount: AccountInfo) => {
    console.log(msalAccount);

    try {
      const userEmail = msalAccount.username;
      const adminStatus = isAdminUser(userEmail);

      const accessToken = await acquireAccessToken(msalAccount);
      if (!accessToken) {
        throw new Error('Failed to acquire access token');
      }

      // Store token in TokenManager
      try {
        const { getTokenManager } = await import('../lib/tokenManager');
        const tokenManager = getTokenManager();
        tokenManager.setToken(accessToken, {
          tokenType: 'msal',
          expiresIn: 3600 // Default 1 hour for MSAL tokens
        });
      } catch (error) {
        console.warn('TokenManager not available, using localStorage fallback');
        localStorage.setItem('auth_token', accessToken);
      }

      let graphData: GraphUserProfile;

      try {
        graphData = await getUserProfile(accessToken);
        console.log('Graph API data:', graphData);
      } catch (e) {
        console.log(`Error while fetching the graph api`);

        setAuthState(prev => ({
          ...prev,
          user: null,
          isLoading: false,
          error: null,
          isRegistered: false,
          registrationError: "Error while fetching the graph api",
        }));
        return null;
      }

      const userInfo = mapGraphDataToUserInfo(graphData, msalAccount);
      
      const registeredUser = await createUserFromSSO({
        email: userInfo.email,
        name: userInfo.name,
        department: userInfo.department,
        company: userInfo.company,
        role: userInfo.role,
        phone: userInfo.phone
      });

      if (registeredUser) {
        const enhancedUser: FormRespondent = {
          ...registeredUser,
          userRole: adminStatus ? 'admin' : 'user',
          isAdmin: adminStatus,
        };

        localStorage.setItem('rpa_user', JSON.stringify(enhancedUser));

        setAuthState(prev => ({
          ...prev,
          user: enhancedUser,
          isLoading: false,
          error: null,
          isRegistered: true,
          registrationError: null,
          accessToken: accessToken,
        }));
        return enhancedUser;
      } else {
        if (adminStatus) {
          const adminUser: FormRespondent = {
            id: msalAccount.localAccountId,
            email: userEmail,
            name: msalAccount.name || userEmail,
            phone: '',
            department: 'Administração',
            role: 'Administrador do Sistema',
            company: 'Torre RPA',
            requestsSubmitted: 0,
            lastActivity: new Date(),
            joinedAt: new Date(),
            preferredServiceType: 'MELHORIA',
            submissionHistory: [],
            isActive: true,
            userRole: 'admin',
            isAdmin: true,
          };

          localStorage.setItem('rpa_user', JSON.stringify(adminUser));

          setAuthState(prev => ({
            ...prev,
            user: adminUser,
            isLoading: false,
            error: null,
            isRegistered: true,
            registrationError: null,
            accessToken: accessToken,
          }));
          return adminUser;
        } else {
          try {
            const newUser = await createUserFromSSO({
              email: userInfo.email,
              name: userInfo.name,
              department: userInfo.department,
              company: userInfo.company,
              role: userInfo.role,
              phone: userInfo.phone
            });

            const enhancedNewUser: FormRespondent = {
              ...newUser,
              userRole: 'user',
              isAdmin: false,
            };

            localStorage.setItem('rpa_user', JSON.stringify(enhancedNewUser));

            setAuthState(prev => ({
              ...prev,
              user: enhancedNewUser,
              isLoading: false,
              error: null,
              isRegistered: true,
              registrationError: null,
              accessToken: accessToken,
            }));
            return enhancedNewUser;
          } catch (createError: any) {
            console.error('Failed to create user:', createError);

            let createErrorMessage = 'Não foi possível criar sua conta automaticamente. Entre em contato com o administrador do sistema.';

            if (createError?.response?.status === 409) {
              createErrorMessage = 'Uma conta com este email já existe, mas não foi possível recuperá-la. Tente fazer login novamente.';
            } else if (createError?.response?.status === 400) {
              createErrorMessage = 'Dados de usuário inválidos. Verifique suas informações no Azure AD.';
            } else if (createError?.response?.status === 500) {
              createErrorMessage = 'Erro interno do servidor ao criar conta. Tente novamente em alguns minutos.';
            } else if (!navigator.onLine) {
              createErrorMessage = 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
            }

            setAuthState(prev => ({
              ...prev,
              user: null,
              isLoading: false,
              error: null,
              isRegistered: false,
              registrationError: createErrorMessage,
            }));
            return null;
          }
        }
      }
    } catch (error: any) {
      console.error('Error checking user registration:', error);

      let errorMessage = 'Erro ao verificar registro do usuário';
      let registrationErrorMessage = 'Erro ao conectar com o servidor. Tente novamente.';

      if (error?.response?.status === 500) {
        errorMessage = 'Erro interno do servidor';
        registrationErrorMessage = 'O servidor está temporariamente indisponível. Tente novamente em alguns minutos.';
      } else if (error?.response?.status === 403) {
        errorMessage = 'Acesso negado';
        registrationErrorMessage = 'Você não tem permissão para acessar este sistema.';
      } else if (!navigator.onLine) {
        errorMessage = 'Sem conexão com a internet';
        registrationErrorMessage = 'Verifique sua conexão com a internet e tente novamente.';
      }

      setAuthState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
        error: error.message || errorMessage,
        isRegistered: null,
        registrationError: registrationErrorMessage,
      }));
      return null;
    }
  };


  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await instance.loginPopup(loginRequest);
    } catch (error: any) {
      console.error('Login failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await instance.logoutPopup();

      // Clear TokenManager
      try {
        const { getTokenManager } = await import('../lib/tokenManager');
        const tokenManager = getTokenManager();
        tokenManager.clearToken();
      } catch (error) {
        console.warn('TokenManager not available, clearing localStorage directly');
        localStorage.removeItem('rpa_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('rpa_token_info');
      }

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
        isRegistered: null,
        registrationError: null,
        accessToken: null,
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Logout failed',
      }));
    }
  };

  useEffect(() => {
    const handleAuthState = async () => {
      if (inProgress !== InteractionStatus.None) {
        return;
      }

      if (isAuthenticated && account) {
        await checkRegistrationAndGetProfile(account);
      } else {
        // Clear TokenManager when not authenticated
        try {
          const { getTokenManager } = await import('../lib/tokenManager');
          const tokenManager = getTokenManager();
          tokenManager.clearToken();
        } catch (error) {
          localStorage.removeItem('rpa_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('rpa_token_info');
        }

        setAuthState({
          user: null,
          isLoading: false,
          error: null,
          isRegistered: null,
          registrationError: null,
          accessToken: null,
        });
      }
    };

    handleAuthState();
  }, [isAuthenticated, account, inProgress, instance]);

  const updateUser = (userData: Partial<FormRespondent>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };

      localStorage.setItem('rpa_user', JSON.stringify(updatedUser));

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    isAuthenticated,
    isRegistered: authState.isRegistered,
    registrationError: authState.registrationError,
    accessToken: authState.accessToken,
    login,
    logout,
    updateUser,
    acquireAccessToken: () => account ? acquireAccessToken(account) : Promise.resolve(null),
  };
}