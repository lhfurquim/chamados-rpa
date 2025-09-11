import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function LoginPage() {
  const { user, login, isLoading, error } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleMicrosoftLogin = async () => {
    try {
      await login();

      console.log("User authenticated: " + user);
    } catch (err) {
      console.error('Microsoft login failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stefanini-50 to-stefanini-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stefanini-700">RPA Torre CRM</h1>
          <p className="text-stefanini-600 mt-2">Sistema de Gerenciamento de Chamados</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com sua conta Microsoft para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button 
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center gap-2" 
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
              </svg>
              {isLoading ? 'Entrando...' : 'Entrar com Microsoft'}
            </Button>

            <div className="mt-6 p-3 bg-stefanini-50 rounded-md text-sm text-center">
              <p className="text-stefanini-600">
                Use sua conta corporativa Microsoft para acessar o sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}