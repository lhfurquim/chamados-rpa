import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './use-toast';

interface UseTokenRefreshOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
  autoRefresh?: boolean;
}

export function useTokenRefresh(options: UseTokenRefreshOptions = {}) {
  const {
    showToast = true,
    onSuccess,
    onError,
    autoRefresh = false
  } = options;

  const { handleSessionExpiry, checkSessionValidity, isRefreshingToken, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState<number>(0);

  // Manual refresh function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      if (showToast) {
        toast({
          title: "Erro de Autenticação",
          description: "Usuário não está autenticado.",
          variant: "destructive"
        });
      }
      onError?.();
      return false;
    }

    if (isRefreshingToken) {
      if (showToast) {
        toast({
          title: "Aguarde",
          description: "Token já está sendo atualizado...",
        });
      }
      return false;
    }

    try {
      setLastRefreshAttempt(Date.now());

      if (showToast) {
        toast({
          title: "Atualizando Sessão",
          description: "Renovando token de acesso...",
        });
      }

      const success = await handleSessionExpiry();

      if (success) {
        if (showToast) {
          toast({
            title: "Sessão Atualizada",
            description: "Token renovado com sucesso.",
          });
        }
        onSuccess?.();
        return true;
      } else {
        if (showToast) {
          toast({
            title: "Sessão Expirada",
            description: "Redirecionando para login...",
            variant: "destructive"
          });
        }
        onError?.();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);

      if (showToast) {
        toast({
          title: "Erro de Sessão",
          description: "Não foi possível renovar o token. Faça login novamente.",
          variant: "destructive"
        });
      }

      onError?.();
      return false;
    }
  }, [isAuthenticated, isRefreshingToken, handleSessionExpiry, showToast, toast, onSuccess, onError]);

  // Check session validity
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      return await checkSessionValidity();
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }, [isAuthenticated, checkSessionValidity]);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const scheduleRefresh = () => {
      // Check session every 5 minutes and refresh if needed
      timeoutId = setTimeout(async () => {
        const isValid = await validateSession();

        if (!isValid) {
          console.log('Session invalid, attempting refresh...');
          await refreshToken();
        }

        scheduleRefresh(); // Schedule next check
      }, 5 * 60 * 1000); // 5 minutes
    };

    scheduleRefresh();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [autoRefresh, isAuthenticated, validateSession, refreshToken]);

  // Listen for manual refresh requests
  useEffect(() => {
    const handleManualRefresh = () => {
      refreshToken();
    };

    window.addEventListener('auth:manual-refresh', handleManualRefresh);

    return () => {
      window.removeEventListener('auth:manual-refresh', handleManualRefresh);
    };
  }, [refreshToken]);

  return {
    refreshToken,
    validateSession,
    isRefreshingToken,
    lastRefreshAttempt,
    canRefresh: isAuthenticated && !isRefreshingToken
  };
}

// Helper function to trigger manual refresh from anywhere in the app
export const triggerTokenRefresh = () => {
  window.dispatchEvent(new CustomEvent('auth:manual-refresh'));
};

export default useTokenRefresh;