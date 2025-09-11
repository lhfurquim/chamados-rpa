import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredPermission?: string;
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requiredPermission,
  fallbackPath = "/login" 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isAdmin, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stefanini-50 to-stefanini-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stefanini-600"></div>
          <div className="text-lg text-stefanini-700">Verificando permissões...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stefanini-50 to-stefanini-100 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta área. Esta seção é restrita apenas para administradores.
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-stefanini-600 text-white rounded-md hover:bg-stefanini-700 transition-colors"
              >
                Voltar
              </button>
              <p className="text-xs text-gray-500">
                Usuário atual: {user.name} ({user.email})
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stefanini-50 to-stefanini-100 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-9V6m0 0v2m0-2h2m-2 0H8" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Permissão Insuficiente</h2>
            <p className="text-gray-600 mb-4">
              Você não possui as permissões necessárias para acessar esta funcionalidade.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-stefanini-600 text-white rounded-md hover:bg-stefanini-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}