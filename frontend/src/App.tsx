import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';
import PublicFormPage from './pages/PublicFormPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import CallsPage from './pages/dashboard/CallsPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import RobotsPage from './pages/dashboard/RobotsPage';
import { Toaster } from './components/ui/toaster';
import { testApiEndpoints } from './utils/apiTester';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./auth/sso";
import TestePage from './pages/teste-page';

function App() {
  if (import.meta.env.DEV) {
    (window as any).testAPI = async () => {
      console.log('🔧 Testing API endpoints...');
      const results = await testApiEndpoints();
      console.table(results);
      return results;
    };
  }

  return (
    <Router>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/form" replace />} />
            <Route path="/form" element={<PublicFormPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path='/teste' element={<TestePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="calls" element={<CallsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="robots" element={<RobotsPage />} />
              <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">Usuários</h1><p>Página em desenvolvimento...</p></div>} />
              <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1><p>Página em desenvolvimento...</p></div>} />
              <Route
              path="robots"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </MsalProvider>
    </Router>
  );
}

export default App;