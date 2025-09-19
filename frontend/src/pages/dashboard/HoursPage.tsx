import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Clock, Users, FolderOpen, Briefcase } from 'lucide-react';
import { useEffect } from 'react';

// Import das páginas das abas
import ClientsPage from './hours/ClientsPage';
import ProjectsPage from './hours/ProjectsPage';
import DemandsPage from './hours/DemandsPage';

const LevantamentoPage = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Levantamento</h2>
    <p className="text-gray-600">Página em desenvolvimento...</p>
  </div>
);

export default function HoursPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determinar a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/hours/clients')) return 'clients';
    if (path.includes('/hours/projects')) return 'projects';
    if (path.includes('/hours/demands')) return 'demands';
    if (path.includes('/hours/levantamento')) return 'levantamento';
    return 'clients'; // Tab padrão
  };

  const activeTab = getActiveTab();

  // Navegar para a tab selecionada
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'clients':
        navigate('/dashboard/hours/clients');
        break;
      case 'projects':
        navigate('/dashboard/hours/projects');
        break;
      case 'demands':
        navigate('/dashboard/hours/demands');
        break;
      case 'levantamento':
        navigate('/dashboard/hours/levantamento');
        break;
    }
  };

  // Redirecionar para clientes por padrão se estiver na rota base
  useEffect(() => {
    if (location.pathname === '/dashboard/hours' || location.pathname === '/dashboard/hours/') {
      navigate('/dashboard/hours/clients', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-600" />
            Gestão de Horas
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Gerencie horas de trabalho, clientes, projetos e demandas</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Navegação</CardTitle>
          <CardDescription>
            Selecione a seção que deseja gerenciar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="levantamento" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Levantamento
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projetos
              </TabsTrigger>
              <TabsTrigger value="demands" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Demandas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="levantamento" className="mt-6">
              <Routes>
                <Route path="/levantamento" element={<LevantamentoPage />} />
                <Route path="/*" element={<LevantamentoPage />} />
              </Routes>
            </TabsContent>

            <TabsContent value="clients" className="mt-6">
              <Routes>
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/*" element={<ClientsPage />} />
              </Routes>
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <Routes>
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/*" element={<ProjectsPage />} />
              </Routes>
            </TabsContent>

            <TabsContent value="demands" className="mt-6">
              <Routes>
                <Route path="/demands" element={<DemandsPage />} />
                <Route path="/*" element={<DemandsPage />} />
              </Routes>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}