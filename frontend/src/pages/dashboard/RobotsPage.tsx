import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { getRobots, searchRobots, deleteRobot, getUniqueValues } from '../../services/robotsService';
import { type Robot, type ClientType, type ExecutionType, type RobotStatus, type RobotFilters } from '../../types';
import { Search, Filter, Bot, Plus, Edit, Trash2, Server, Building2, Loader2, Eye } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import RobotCreateModal from '../../components/RobotCreateModal';
import RobotEditModal from '../../components/RobotEditModal';
import RobotViewModal from '../../components/RobotViewModal';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../../components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';

export default function RobotsPage() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cellFilter, setCellFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [executionTypeFilter, setExecutionTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [technologyFilter, setTechnologyFilter] = useState<string>('all');
  const [uniqueValues, setUniqueValues] = useState({ 
    cells: [], 
    technologies: [], 
    clients: [], 
    executionTypes: [], 
    statuses: [] 
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  
  const [deleteRobotId, setDeleteRobotId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadRobots();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadRobots();
    }
  }, [searchTerm, cellFilter, clientFilter, executionTypeFilter, statusFilter, technologyFilter]);

  const loadRobots = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: RobotFilters = {
        search: searchTerm || undefined,
        cell: cellFilter !== 'all' ? cellFilter : undefined,
        client: clientFilter !== 'all' ? (clientFilter as ClientType) : undefined,
        executionType: executionTypeFilter !== 'all' ? (executionTypeFilter as ExecutionType) : undefined,
        status: statusFilter !== 'all' ? (statusFilter as RobotStatus) : undefined,
        technology: technologyFilter !== 'all' ? technologyFilter : undefined,
      };

      console.log('🎯 Applied filters:', filters);
      const hasFilters = Object.values(filters).some(value => value !== undefined);
      console.log('🎯 Has filters?', hasFilters);
      
      let robotsData: Robot[];
      if (!hasFilters) {
        console.log('🎯 Loading all robots...');
        robotsData = await getRobots();
      } else {
        console.log('🎯 Searching with filters...');
        robotsData = await searchRobots(filters);
      }

      console.log('🎯 Final robots data:', robotsData);
      console.log('🎯 Number of robots to display:', robotsData?.length || 0);
      
      setRobots(robotsData);
      setUniqueValues(getUniqueValues(robotsData));
    } catch (err) {
      console.error('Error loading robots:', err);
      setError('Erro ao carregar robôs. Tente novamente.');
      toast({
        title: "Erro",
        description: "Erro ao carregar robôs. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: RobotStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: RobotStatus) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'INACTIVE': return 'Inativo';
      default: return status;
    }
  };

  const getExecutionTypeLabel = (type: ExecutionType) => {
    switch (type) {
      case 'ATTENDED': return 'Assistido';
      case 'UNATTENDED': return 'Não Assistido';
      default: return type;
    }
  };

  const getExecutionTypeColor = (type: ExecutionType) => {
    switch (type) {
      case 'ATTENDED': return 'bg-blue-100 text-blue-800';
      case 'UNATTENDED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientColor = (client: ClientType) => {
    switch (client) {
      case 'NECXT': return 'bg-orange-100 text-orange-800';
      case 'STEFANINI': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateRobot = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditRobot = (robot: Robot) => {
    setSelectedRobot(robot);
    setIsEditModalOpen(true);
  };

  const handleViewRobot = (robot: Robot) => {
    setSelectedRobot(robot);
    setIsViewModalOpen(true);
  };

  const handleDeleteRobot = (robotId: number) => {
    setDeleteRobotId(robotId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteRobotId) return;
    
    try {
      setIsDeleting(true);
      await deleteRobot(deleteRobotId);
      
      toast({
        title: "Sucesso",
        description: "Robô excluído com sucesso.",
      });
      
      await loadRobots();
    } catch (err) {
      console.error('Error deleting robot:', err);
      toast({
        title: "Erro",
        description: "Erro ao excluir robô. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteRobotId(null);
    }
  };

  const handleRobotCreated = (newRobot: Robot) => {
    setRobots(prev => [...prev, newRobot]);
    toast({
      title: "Sucesso",
      description: "Robô criado com sucesso.",
    });
  };

  const handleRobotUpdated = (updatedRobot: Robot) => {
    setRobots(prev => prev.map(robot => 
      robot.id === updatedRobot.id ? updatedRobot : robot
    ));
    toast({
      title: "Sucesso", 
      description: "Robô atualizado com sucesso.",
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCellFilter('all');
    setClientFilter('all');
    setExecutionTypeFilter('all');
    setStatusFilter('all');
    setTechnologyFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Robôs</h1>
          <p className="text-gray-600">Gerencie todos os robôs RPA da organização</p>
        </div>
        <Button onClick={handleCreateRobot} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Robô
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Pesquisa
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar robôs específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar robôs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={cellFilter} onValueChange={setCellFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as células" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as células</SelectItem>
                {uniqueValues.cells.filter(cell => cell && cell.trim() !== '').map((cell) => (
                  <SelectItem key={cell} value={cell}>{cell}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                <SelectItem value="NECXT">NECXT</SelectItem>
                <SelectItem value="STEFANINI">STEFANINI</SelectItem>
              </SelectContent>
            </Select>

            <Select value={executionTypeFilter} onValueChange={setExecutionTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="ATTENDED">Assistido</SelectItem>
                <SelectItem value="UNATTENDED">Não Assistido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={clearFilters} 
              disabled={loading}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Robôs RPA ({robots.length})
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadRobots} variant="outline">
                  Tentar Novamente
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
                Carregando robôs...
              </div>
            ) : robots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum robô encontrado com os filtros selecionados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {robots.map((robot) => (
                  <Card key={robot.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CardTitle className="text-lg flex items-center  gap-2">
                              <Bot className="h-5 w-5 text-blue-600" />
                              <span className='max-w-52 truncate'>
                                {robot.name}
                              </span>
                            </CardTitle>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{robot.name}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Badge className={getStatusColor(robot.status)}>
                          {getStatusLabel(robot.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{robot.cell}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Server className="h-4 w-4" />
                        <span>{robot.technology}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Badge className={getExecutionTypeColor(robot.executionType)}>
                          {getExecutionTypeLabel(robot.executionType)}
                        </Badge>
                        <Badge className={getClientColor(robot.client)}>
                          {robot.client}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                      </div>

                      <div className="flex justify-between gap-2 pt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewRobot(robot)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditRobot(robot)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteRobot(robot.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <RobotCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRobotCreated={handleRobotCreated}
      />

      <RobotEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRobot(null);
        }}
        robot={selectedRobot}
        onRobotUpdated={handleRobotUpdated}
      />

      <RobotViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRobot(null);
        }}
        robot={selectedRobot}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este robô? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}