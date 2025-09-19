import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
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
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
  getAreaLabel,
  getAreaColor
} from '../../../services/projectsService';
import { getClients } from '../../../services/clientsService';
import {
  type Project,
  type CreateProjectRequest,
  type UpdateProjectRequest,
  type Area,
  type Client
} from '../../../types';
import { Search, Plus, Edit, Trash2, FolderOpen, Loader2, Building2 } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useForm } from 'react-hook-form';

interface ProjectFormData {
  name: string;
  description: string;
  area: Area;
  clientId: string; // string for form handling, converted to number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const createForm = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      area: 'INTERN',
      clientId: ''
    }
  });

  const editForm = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      area: 'INTERN',
      clientId: ''
    }
  });

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadProjects();
    }
  }, [searchTerm, areaFilter]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (err) {
      console.error('Error loading clients:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes.",
        variant: "destructive"
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      let projectsData: Project[];
      if (searchTerm.trim() || areaFilter !== 'all') {
        projectsData = await searchProjects({
          search: searchTerm.trim() || undefined,
          area: areaFilter !== 'all' ? (areaFilter as Area) : undefined
        });
      } else {
        projectsData = await getProjects();
      }

      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Erro ao carregar projetos. Tente novamente.');
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    createForm.reset({
      name: '',
      description: '',
      area: 'INTERN',
      clientId: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    editForm.reset({
      name: project.name,
      description: project.description,
      area: project.area,
      clientId: project.client.id.toString()
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const onCreateSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      const projectData: CreateProjectRequest = {
        name: data.name.trim(),
        description: data.description.trim(),
        area: data.area,
        clientId: parseInt(data.clientId)
      };

      const newProject = await createProject(projectData);

      setProjects(prev => [...prev, newProject]);
      setIsCreateModalOpen(false);
      createForm.reset();

      toast({
        title: "Sucesso",
        description: "Projeto criado com sucesso.",
      });
    } catch (err) {
      console.error('Error creating project:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar projeto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (data: ProjectFormData) => {
    if (!selectedProject) return;

    try {
      setIsSubmitting(true);
      const projectData: UpdateProjectRequest = {
        id: selectedProject.id,
        name: data.name.trim(),
        description: data.description.trim(),
        area: data.area,
        clientId: parseInt(data.clientId)
      };

      const updatedProject = await updateProject(projectData);

      setProjects(prev => prev.map(project =>
        project.id === updatedProject.id ? updatedProject : project
      ));
      setIsEditModalOpen(false);
      setSelectedProject(null);
      editForm.reset();

      toast({
        title: "Sucesso",
        description: "Projeto atualizado com sucesso.",
      });
    } catch (err) {
      console.error('Error updating project:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar projeto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;

    try {
      setIsSubmitting(true);
      await deleteProject(selectedProject.id);

      setProjects(prev => prev.filter(project => project.id !== selectedProject.id));
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);

      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso.",
      });
    } catch (err) {
      console.error('Error deleting project:', err);
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAreaFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-blue-600" />
            Gerenciamento de Projetos
          </h2>
          <p className="text-gray-600">Gerencie todos os projetos do sistema</p>
        </div>
        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros e Pesquisa
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar projetos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, descrição ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                <SelectItem value="INTERN">Interno</SelectItem>
                <SelectItem value="EXTERNAL">Externo</SelectItem>
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
            <FolderOpen className="h-5 w-5" />
            Projetos ({projects.length})
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadProjects} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
              Carregando projetos...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || areaFilter !== 'all' ?
                'Nenhum projeto encontrado com os filtros selecionados.' :
                'Nenhum projeto cadastrado no sistema.'
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">#{project.id}</TableCell>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="max-w-xs truncate" title={project.description}>
                      {project.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={getAreaColor(project.area)}>
                        {getAreaLabel(project.area)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{project.client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProject(project)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Project Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
            <DialogDescription>
              Adicione um novo projeto ao sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Nome do Projeto</Label>
                <Input
                  id="create-name"
                  {...createForm.register('name', {
                    required: 'Nome é obrigatório',
                    minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                  })}
                  placeholder="Digite o nome do projeto"
                />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-description">Descrição</Label>
                <Textarea
                  id="create-description"
                  {...createForm.register('description', {
                    required: 'Descrição é obrigatória',
                    minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' }
                  })}
                  placeholder="Digite a descrição do projeto"
                  rows={3}
                />
                {createForm.formState.errors.description && (
                  <p className="text-sm text-red-600">
                    {createForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-area">Área</Label>
                  <Select
                    value={createForm.watch('area')}
                    onValueChange={(value) => createForm.setValue('area', value as Area)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERN">Interno</SelectItem>
                      <SelectItem value="EXTERNAL">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-client">Cliente</Label>
                  <Select
                    value={createForm.watch('clientId')}
                    onValueChange={(value) => createForm.setValue('clientId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingClients ? (
                        <SelectItem value="" disabled>
                          Carregando clientes...
                        </SelectItem>
                      ) : clients.length === 0 ? (
                        <SelectItem value="" disabled>
                          Nenhum cliente disponível
                        </SelectItem>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {createForm.formState.errors.clientId && (
                    <p className="text-sm text-red-600">
                      Cliente é obrigatório
                    </p>
                  )}
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
                  'Criar Projeto'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Altere as informações do projeto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome do Projeto</Label>
                <Input
                  id="edit-name"
                  {...editForm.register('name', {
                    required: 'Nome é obrigatório',
                    minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                  })}
                  placeholder="Digite o nome do projeto"
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  {...editForm.register('description', {
                    required: 'Descrição é obrigatória',
                    minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' }
                  })}
                  placeholder="Digite a descrição do projeto"
                  rows={3}
                />
                {editForm.formState.errors.description && (
                  <p className="text-sm text-red-600">
                    {editForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-area">Área</Label>
                  <Select
                    value={editForm.watch('area')}
                    onValueChange={(value) => editForm.setValue('area', value as Area)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERN">Interno</SelectItem>
                      <SelectItem value="EXTERNAL">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-client">Cliente</Label>
                  <Select
                    value={editForm.watch('clientId')}
                    onValueChange={(value) => editForm.setValue('clientId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingClients ? (
                        <SelectItem value="" disabled>
                          Carregando clientes...
                        </SelectItem>
                      ) : clients.length === 0 ? (
                        <SelectItem value="" disabled>
                          Nenhum cliente disponível
                        </SelectItem>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {editForm.formState.errors.clientId && (
                    <p className="text-sm text-red-600">
                      Cliente é obrigatório
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedProject(null);
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
              Tem certeza que deseja excluir o projeto "{selectedProject?.name}"?
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