import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { DatePicker } from '../../../components/ui/date-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { Label } from '../../../components/ui/label';
import {
  getDemands,
  createDemand,
  updateDemand,
  deleteDemand,
  searchDemands,
  getDemandStatusLabel,
  getDemandStatusColor,
  getServiceTypeLabel,
  getServiceTypeColor
} from '../../../services/demandsService';
import { getUsers } from '../../../services/usersService';
import { getProjects } from '../../../services/projectsService';
import { getRobots } from '../../../services/robotsService';
import {
  type Demand,
  type CreateDemandRequest,
  type UpdateDemandRequest,
  type DemandStatus,
  type ServiceType,
  type SubmitterInfo,
  type Project,
  type Robot
} from '../../../types';
import { Search, Plus, Edit, Trash2, Briefcase, Loader2, Building2 } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';

interface DemandFormData {
  name: string;
  docHours: number;
  devHours: number;
  type: ServiceType;
  description: string;
  focalPointId: string;
  analystId: string;
  projectId: string;
  status: DemandStatus;
  robotId: string;
  client?: number;
  service?: number;
  openedAt?: Date;
  startAt?: Date;
  endsAt?: Date;
  endedAt?: Date;
  roi?: string;
}

export default function DemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [users, setUsers] = useState<SubmitterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected robot state for auto-filling cell
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);

  const { toast } = useToast();

  const createForm = useForm<DemandFormData>({
    defaultValues: {
      name: '',
      docHours: 0,
      devHours: 0,
      type: 'MELHORIA',
      description: '',
      focalPointId: '',
      analystId: '',
      projectId: '',
      status: 'BACKLOG',
      robotId: '',
      client: 0,
      service: 0,
      roi: ''
    }
  });

  const editForm = useForm<DemandFormData>({
    defaultValues: {
      name: '',
      docHours: 0,
      devHours: 0,
      type: 'MELHORIA',
      description: '',
      focalPointId: '',
      analystId: '',
      projectId: '',
      status: 'BACKLOG',
      robotId: '',
      client: 0,
      service: 0,
      roi: ''
    }
  });

  useEffect(() => {
    loadDemands();
    loadSupportingData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadDemands();
    }
  }, [searchTerm, statusFilter, typeFilter]);

  const loadSupportingData = async () => {
    try {
      setLoadingData(true);
      const [projectsData, robotsData, usersData] = await Promise.all([
        getProjects(),
        getRobots(),
        getUsers()
      ]);

      setProjects(projectsData);
      setRobots(robotsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading supporting data:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de apoio.",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadDemands = async () => {
    try {
      setLoading(true);
      setError(null);

      let demandsData: Demand[];
      if (searchTerm.trim() || statusFilter !== 'all' || typeFilter !== 'all') {
        demandsData = await searchDemands({
          search: searchTerm.trim() || undefined,
          status: statusFilter !== 'all' ? (statusFilter as DemandStatus) : undefined,
          type: typeFilter !== 'all' ? (typeFilter as ServiceType) : undefined
        });
      } else {
        demandsData = await getDemands();
      }

      setDemands(demandsData);
    } catch (err) {
      console.error('Error loading demands:', err);
      setError('Erro ao carregar demandas. Tente novamente.');
      toast({
        title: "Erro",
        description: "Erro ao carregar demandas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemand = () => {
    createForm.reset({
      name: '',
      docHours: 0,
      devHours: 0,
      type: 'MELHORIA',
      description: '',
      focalPointId: '',
      analystId: '',
      projectId: '',
      status: 'BACKLOG',
      robotId: '',
      client: 0,
      service: 0,
      roi: ''
    });
    setSelectedRobot(null);
    setIsCreateModalOpen(true);
  };

  const handleEditDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    editForm.reset({
      name: demand.name,
      docHours: demand.docHours,
      devHours: demand.devHours,
      type: demand.type,
      description: demand.description,
      focalPointId: demand.focalPoint.id,
      analystId: demand.analyst.id,
      projectId: demand.project.id.toString(),
      status: demand.status,
      robotId: demand.robot.id?.toString() || '',
      client: demand.client,
      service: demand.service,
      openedAt: demand.openedAt ? new Date(demand.openedAt) : undefined,
      startAt: demand.startAt ? new Date(demand.startAt) : undefined,
      endsAt: demand.endsAt ? new Date(demand.endsAt) : undefined,
      endedAt: demand.endedAt ? new Date(demand.endedAt) : undefined,
      roi: demand.roi
    });
    setSelectedRobot(demand.robot);
    setIsEditModalOpen(true);
  };

  const handleDeleteDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setIsDeleteDialogOpen(true);
  };

  const handleRobotSelect = (robotId: string, form: any) => {
    const robot = robots.find(r => r.id?.toString() === robotId);
    setSelectedRobot(robot || null);
    form.setValue('robotId', robotId);
  };

  const onCreateSubmit = async (data: DemandFormData) => {
    try {
      setIsSubmitting(true);
      const demandData: CreateDemandRequest = {
        name: data.name.trim(),
        docHours: data.docHours,
        devHours: data.devHours,
        type: data.type,
        description: data.description.trim(),
        focalPointId: data.focalPointId,
        analystId: data.analystId,
        projectId: parseInt(data.projectId),
        status: data.status,
        robotId: parseInt(data.robotId),
        client: data.client || undefined,
        service: data.service || undefined,
        openedAt: data.openedAt ? data.openedAt.toISOString().split('T')[0] : undefined,
        startAt: data.startAt ? data.startAt.toISOString().split('T')[0] : undefined,
        endsAt: data.endsAt ? data.endsAt.toISOString().split('T')[0] : undefined,
        roi: data.roi?.trim() || undefined
      };

      const newDemand = await createDemand(demandData);

      setDemands(prev => [...prev, newDemand]);
      setIsCreateModalOpen(false);
      createForm.reset();
      setSelectedRobot(null);

      toast({
        title: "Sucesso",
        description: "Demanda criada com sucesso.",
      });
    } catch (err) {
      console.error('Error creating demand:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar demanda. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (data: DemandFormData) => {
    if (!selectedDemand) return;

    try {
      setIsSubmitting(true);
      const demandData: UpdateDemandRequest = {
        id: selectedDemand.id,
        name: data.name.trim(),
        docHours: data.docHours,
        devHours: data.devHours,
        type: data.type,
        description: data.description.trim(),
        focalPointId: data.focalPointId,
        analystId: data.analystId,
        projectId: parseInt(data.projectId),
        status: data.status,
        robotId: parseInt(data.robotId),
        client: data.client || undefined,
        service: data.service || undefined,
        openedAt: data.openedAt ? data.openedAt.toISOString().split('T')[0] : undefined,
        startAt: data.startAt ? data.startAt.toISOString().split('T')[0] : undefined,
        endsAt: data.endsAt ? data.endsAt.toISOString().split('T')[0] : undefined,
        endedAt: data.endedAt ? data.endedAt.toISOString().split('T')[0] : undefined,
        roi: data.roi?.trim() || undefined
      };

      const updatedDemand = await updateDemand(demandData);

      setDemands(prev => prev.map(demand =>
        demand.id === updatedDemand.id ? updatedDemand : demand
      ));
      setIsEditModalOpen(false);
      setSelectedDemand(null);
      editForm.reset();
      setSelectedRobot(null);

      toast({
        title: "Sucesso",
        description: "Demanda atualizada com sucesso.",
      });
    } catch (err) {
      console.error('Error updating demand:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar demanda. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedDemand) return;

    try {
      setIsSubmitting(true);
      await deleteDemand(selectedDemand.id);

      setDemands(prev => prev.filter(demand => demand.id !== selectedDemand.id));
      setIsDeleteDialogOpen(false);
      setSelectedDemand(null);

      toast({
        title: "Sucesso",
        description: "Demanda excluída com sucesso.",
      });
    } catch (err) {
      console.error('Error deleting demand:', err);
      toast({
        title: "Erro",
        description: "Erro ao excluir demanda. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Options for selects
  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email}) - ${user.department}`
  }));

  const projectOptions = projects.map(project => ({
    value: project.id.toString(),
    label: `${project.name} - ${project.client.name}`
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            Gerenciamento de Demandas
          </h2>
          <p className="text-gray-600">Gerencie todas as demandas do sistema</p>
        </div>
        <Button onClick={handleCreateDemand} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Demanda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros e Pesquisa
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar demandas específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, descrição, projeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="BACKLOG">Backlog</SelectItem>
                <SelectItem value="ASSESSMENT">Avaliação</SelectItem>
                <SelectItem value="COST_APPROVAL">Aprovação de Custo</SelectItem>
                <SelectItem value="DEVELOPING">Desenvolvimento</SelectItem>
                <SelectItem value="DEPLOYING">Implantação</SelectItem>
                <SelectItem value="CLIENT_APPROVAL">Aprovação do Cliente</SelectItem>
                <SelectItem value="COMPLETED">Concluído</SelectItem>
                <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                <SelectItem value="CANCELED">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="MELHORIA">Melhoria</SelectItem>
                <SelectItem value="SUSTENTACAO">Sustentação</SelectItem>
                <SelectItem value="NOVO_PROJETO">Novo Projeto</SelectItem>
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
            <Briefcase className="h-5 w-5" />
            Demandas ({demands.length})
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadDemands} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
              Carregando demandas...
            </div>
          ) : demands.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ?
                'Nenhuma demanda encontrada com os filtros selecionados.' :
                'Nenhuma demanda cadastrada no sistema.'
              }
            </div>
          ) : (
            <div className="w-full min-w-0">
              <div className="max-h-[600px] overflow-x-auto overflow-y-auto border rounded-md">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-background border-b w-16">ID</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b min-w-[120px] max-w-[150px]">Nome</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b min-w-[150px] max-w-[200px]">Descrição</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b w-20">Tipo</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b w-24">Status</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b min-w-[120px] max-w-[150px]">Projeto</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b min-w-[100px] max-w-[120px]">Robô</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b min-w-[100px] max-w-[120px]">Ponto Focal</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b min-w-[100px] max-w-[120px]">Analista</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b w-16">H. Doc</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b w-16">H. Dev</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b w-24">Dt. Abertura</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b w-24">Dt. Início</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b w-24">Dt. Fim</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b w-24">Dt. Conclusão</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b w-24">Dt. Criação</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b min-w-[100px] max-w-[120px]">ROI</TableHead>
                      <TableHead className="sticky top-0 bg-background border-b text-right w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demands.map((demand) => (
                      <TableRow key={demand.id}>
                        <TableCell className="font-medium w-16">#{demand.id}</TableCell>
                        <TableCell className="min-w-[120px] max-w-[150px]">
                          <div className="truncate" title={demand.name}>
                            {demand.name}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[150px] max-w-[200px]">
                          <div className="truncate" title={demand.description}>
                            {truncateText(demand.description, 40)}
                          </div>
                        </TableCell>
                        <TableCell className="w-20">
                          <Badge className={`${getServiceTypeColor(demand.type)} text-xs`}>
                            {getServiceTypeLabel(demand.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-24">
                          <Badge className={`${getDemandStatusColor(demand.status)} text-xs`}>
                            {getDemandStatusLabel(demand.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-[120px] max-w-[150px]">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <span className="truncate text-sm" title={demand.project.name}>
                              {demand.project.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px] max-w-[120px]">
                          <div className="min-w-0">
                            <div className="font-medium truncate text-sm" title={demand.robot.name}>
                              {demand.robot.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {demand.robot.cell}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px] max-w-[120px]">
                          <div className="truncate text-sm" title={demand.focalPoint.name}>
                            {demand.focalPoint.name}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px] max-w-[120px]">
                          <div className="truncate text-sm" title={demand.analyst.name}>
                            {demand.analyst.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center w-16">
                          <span className="font-medium text-sm">{demand.docHours}h</span>
                        </TableCell>
                        <TableCell className="text-center w-16">
                          <span className="font-medium text-sm">{demand.devHours}h</span>
                        </TableCell>
                        <TableCell className="text-center w-24 text-xs">
                          {formatDate(demand.openedAt)}
                        </TableCell>
                        <TableCell className="text-center w-24 text-xs">
                          {formatDate(demand.startAt)}
                        </TableCell>
                        <TableCell className="text-center w-24 text-xs">
                          {formatDate(demand.endsAt)}
                        </TableCell>
                        <TableCell className="text-center w-24 text-xs">
                          {formatDate(demand.endedAt)}
                        </TableCell>
                        <TableCell className="text-center w-24 text-xs">
                          {formatDate(demand.createdAt)}
                        </TableCell>
                        <TableCell className="min-w-[100px] max-w-[120px]">
                          <div className="truncate text-sm" title={demand.roi || ''}>
                            {truncateText(demand.roi || '', 20)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right w-32">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDemand(demand)}
                              className="h-8 px-2"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDemand(demand)}
                              className="text-red-600 hover:text-red-700 h-8 px-2"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Demand Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Demanda</DialogTitle>
            <DialogDescription>
              Adicione uma nova demanda ao sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-name">Nome da Demanda</Label>
                  <Input
                    id="create-name"
                    {...createForm.register('name', {
                      required: 'Nome é obrigatório',
                      minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                    })}
                    placeholder="Digite o nome da demanda"
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {createForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-type">Tipo de Serviço</Label>
                  <Select
                    value={createForm.watch('type')}
                    onValueChange={(value) => createForm.setValue('type', value as ServiceType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MELHORIA">Melhoria</SelectItem>
                      <SelectItem value="SUSTENTACAO">Sustentação</SelectItem>
                      <SelectItem value="NOVO_PROJETO">Novo Projeto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-docHours">Horas de Documentação</Label>
                  <Input
                    id="create-docHours"
                    type="number"
                    min="0"
                    step="0.5"
                    {...createForm.register('docHours', {
                      required: 'Horas de documentação são obrigatórias',
                      min: { value: 0, message: 'Valor deve ser positivo' }
                    })}
                    placeholder="0"
                  />
                  {createForm.formState.errors.docHours && (
                    <p className="text-sm text-red-600">
                      {createForm.formState.errors.docHours.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-devHours">Horas de Desenvolvimento</Label>
                  <Input
                    id="create-devHours"
                    type="number"
                    min="0"
                    step="0.5"
                    {...createForm.register('devHours', {
                      required: 'Horas de desenvolvimento são obrigatórias',
                      min: { value: 0, message: 'Valor deve ser positivo' }
                    })}
                    placeholder="0"
                  />
                  {createForm.formState.errors.devHours && (
                    <p className="text-sm text-red-600">
                      {createForm.formState.errors.devHours.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="create-description">Descrição</Label>
                <Textarea
                  id="create-description"
                  {...createForm.register('description', {
                    required: 'Descrição é obrigatória',
                    minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' }
                  })}
                  placeholder="Digite a descrição da demanda"
                  rows={3}
                />
                {createForm.formState.errors.description && (
                  <p className="text-sm text-red-600">
                    {createForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* People */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ponto Focal</Label>
                  <SearchableSelect
                    options={userOptions}
                    value={createForm.watch('focalPointId')}
                    onValueChange={(value) => createForm.setValue('focalPointId', value)}
                    placeholder="Selecione o ponto focal"
                    emptyMessage="Nenhum usuário encontrado"
                    disabled={loadingData}
                  />
                  {createForm.formState.errors.focalPointId && (
                    <p className="text-sm text-red-600">
                      Ponto focal é obrigatório
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Analista</Label>
                  <SearchableSelect
                    options={userOptions}
                    value={createForm.watch('analystId')}
                    onValueChange={(value) => createForm.setValue('analystId', value)}
                    placeholder="Selecione o analista"
                    emptyMessage="Nenhum usuário encontrado"
                    disabled={loadingData}
                  />
                  {createForm.formState.errors.analystId && (
                    <p className="text-sm text-red-600">
                      Analista é obrigatório
                    </p>
                  )}
                </div>
              </div>

              {/* Project and Robot */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Projeto</Label>
                  <SearchableSelect
                    options={projectOptions}
                    value={createForm.watch('projectId')}
                    onValueChange={(value) => createForm.setValue('projectId', value)}
                    placeholder="Selecione o projeto"
                    emptyMessage="Nenhum projeto encontrado"
                    disabled={loadingData}
                  />
                  {createForm.formState.errors.projectId && (
                    <p className="text-sm text-red-600">
                      Projeto é obrigatório
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-robot">Robô</Label>
                  <Select
                    value={createForm.watch('robotId')}
                    onValueChange={(value) => handleRobotSelect(value, createForm)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o robô" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingData ? (
                        <SelectItem value="" disabled>
                          Carregando robôs...
                        </SelectItem>
                      ) : robots.length === 0 ? (
                        <SelectItem value="" disabled>
                          Nenhum robô disponível
                        </SelectItem>
                      ) : (
                        robots.map((robot) => (
                          <SelectItem key={robot.id} value={robot.id?.toString() || ''}>
                            {robot.name} - {robot.cell}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedRobot && (
                    <div className="text-sm text-gray-600">
                      <strong>Célula:</strong> {selectedRobot.cell}
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-status">Status</Label>
                  <Select
                    value={createForm.watch('status')}
                    onValueChange={(value) => createForm.setValue('status', value as DemandStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACKLOG">Backlog</SelectItem>
                      <SelectItem value="ASSESSMENT">Avaliação</SelectItem>
                      <SelectItem value="COST_APPROVAL">Aprovação de Custo</SelectItem>
                      <SelectItem value="DEVELOPING">Desenvolvimento</SelectItem>
                      <SelectItem value="DEPLOYING">Implantação</SelectItem>
                      <SelectItem value="CLIENT_APPROVAL">Aprovação do Cliente</SelectItem>
                      <SelectItem value="COMPLETED">Concluído</SelectItem>
                      <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                      <SelectItem value="CANCELED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Data de Abertura</Label>
                  <Controller
                    name="openedAt"
                    control={createForm.control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecione a data de abertura"
                      />
                    )}
                  />
                </div>
              </div>

              {/* More Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data de Início</Label>
                  <Controller
                    name="startAt"
                    control={createForm.control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecione a data de início"
                      />
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Data de Fim Prevista</Label>
                  <Controller
                    name="endsAt"
                    control={createForm.control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecione a data de fim"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-client">Cliente (ID)</Label>
                  <Input
                    id="create-client"
                    type="number"
                    min="0"
                    {...createForm.register('client')}
                    placeholder="ID do cliente"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-service">Serviço (ID)</Label>
                  <Input
                    id="create-service"
                    type="number"
                    min="0"
                    {...createForm.register('service')}
                    placeholder="ID do serviço"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-roi">ROI</Label>
                  <Textarea
                    id="create-roi"
                    {...createForm.register('roi')}
                    placeholder="Descreva o ROI esperado"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Demanda'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Demand Modal - Similar structure to Create Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Demanda</DialogTitle>
            <DialogDescription>
              Altere as informações da demanda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <div className="grid gap-6 py-4">
              {/* Copy the same structure as create modal but using editForm */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome da Demanda</Label>
                  <Input
                    id="edit-name"
                    {...editForm.register('name', {
                      required: 'Nome é obrigatório',
                      minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                    })}
                    placeholder="Digite o nome da demanda"
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {editForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Tipo de Serviço</Label>
                  <Select
                    value={editForm.watch('type')}
                    onValueChange={(value) => editForm.setValue('type', value as ServiceType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MELHORIA">Melhoria</SelectItem>
                      <SelectItem value="SUSTENTACAO">Sustentação</SelectItem>
                      <SelectItem value="NOVO_PROJETO">Novo Projeto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-docHours">Horas de Documentação</Label>
                  <Input
                    id="edit-docHours"
                    type="number"
                    min="0"
                    step="0.5"
                    {...editForm.register('docHours', {
                      required: 'Horas de documentação são obrigatórias',
                      min: { value: 0, message: 'Valor deve ser positivo' }
                    })}
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-devHours">Horas de Desenvolvimento</Label>
                  <Input
                    id="edit-devHours"
                    type="number"
                    min="0"
                    step="0.5"
                    {...editForm.register('devHours', {
                      required: 'Horas de desenvolvimento são obrigatórias',
                      min: { value: 0, message: 'Valor deve ser positivo' }
                    })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  {...editForm.register('description', {
                    required: 'Descrição é obrigatória',
                    minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' }
                  })}
                  placeholder="Digite a descrição da demanda"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ponto Focal</Label>
                  <SearchableSelect
                    options={userOptions}
                    value={editForm.watch('focalPointId')}
                    onValueChange={(value) => editForm.setValue('focalPointId', value)}
                    placeholder="Selecione o ponto focal"
                    emptyMessage="Nenhum usuário encontrado"
                    disabled={loadingData}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Analista</Label>
                  <SearchableSelect
                    options={userOptions}
                    value={editForm.watch('analystId')}
                    onValueChange={(value) => editForm.setValue('analystId', value)}
                    placeholder="Selecione o analista"
                    emptyMessage="Nenhum usuário encontrado"
                    disabled={loadingData}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Projeto</Label>
                  <SearchableSelect
                    options={projectOptions}
                    value={editForm.watch('projectId')}
                    onValueChange={(value) => editForm.setValue('projectId', value)}
                    placeholder="Selecione o projeto"
                    emptyMessage="Nenhum projeto encontrado"
                    disabled={loadingData}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-robot">Robô</Label>
                  <Select
                    value={editForm.watch('robotId')}
                    onValueChange={(value) => handleRobotSelect(value, editForm)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o robô" />
                    </SelectTrigger>
                    <SelectContent>
                      {robots.map((robot) => (
                        <SelectItem key={robot.id} value={robot.id?.toString() || ''}>
                          {robot.name} - {robot.cell}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRobot && (
                    <div className="text-sm text-gray-600">
                      <strong>Célula:</strong> {selectedRobot.cell}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm.watch('status')}
                    onValueChange={(value) => editForm.setValue('status', value as DemandStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACKLOG">Backlog</SelectItem>
                      <SelectItem value="ASSESSMENT">Avaliação</SelectItem>
                      <SelectItem value="COST_APPROVAL">Aprovação de Custo</SelectItem>
                      <SelectItem value="DEVELOPING">Desenvolvimento</SelectItem>
                      <SelectItem value="DEPLOYING">Implantação</SelectItem>
                      <SelectItem value="CLIENT_APPROVAL">Aprovação do Cliente</SelectItem>
                      <SelectItem value="COMPLETED">Concluído</SelectItem>
                      <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                      <SelectItem value="CANCELED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Data de Abertura</Label>
                  <Controller
                    name="openedAt"
                    control={editForm.control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecione a data de abertura"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Data de Início</Label>
                  <Controller
                    name="startAt"
                    control={editForm.control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecione a data de início"
                      />
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Data de Fim Prevista</Label>
                  <Controller
                    name="endsAt"
                    control={editForm.control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecione a data de fim"
                      />
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Data de Término</Label>
                  <Controller
                    name="endedAt"
                    control={editForm.control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecione a data de término"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-client">Cliente (ID)</Label>
                  <Input
                    id="edit-client"
                    type="number"
                    min="0"
                    {...editForm.register('client')}
                    placeholder="ID do cliente"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-service">Serviço (ID)</Label>
                  <Input
                    id="edit-service"
                    type="number"
                    min="0"
                    {...editForm.register('service')}
                    placeholder="ID do serviço"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-roi">ROI</Label>
                  <Textarea
                    id="edit-roi"
                    {...editForm.register('roi')}
                    placeholder="Descreva o ROI esperado"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedDemand(null);
                  setSelectedRobot(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a demanda "{selectedDemand?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
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