import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
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
import { getClients, createClient, updateClient, deleteClient, searchClients } from '../../../services/clientsService';
import { type Client, type CreateClientRequest, type UpdateClientRequest } from '../../../types';
import { Search, Plus, Edit, Trash2, Users, Loader2 } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useForm } from 'react-hook-form';

interface ClientFormData {
  name: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const createForm = useForm<ClientFormData>({
    defaultValues: { name: '' }
  });

  const editForm = useForm<ClientFormData>({
    defaultValues: { name: '' }
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadClients();
    }
  }, [searchTerm]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);

      let clientsData: Client[];
      if (searchTerm.trim()) {
        clientsData = await searchClients({ search: searchTerm.trim() });
      } else {
        clientsData = await getClients();
      }

      setClients(clientsData);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Erro ao carregar clientes. Tente novamente.');
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = () => {
    createForm.reset({ name: '' });
    setIsCreateModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    editForm.reset({ name: client.name });
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const onCreateSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      const newClient = await createClient({ name: data.name.trim() });

      setClients(prev => [...prev, newClient]);
      setIsCreateModalOpen(false);
      createForm.reset();

      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso.",
      });
    } catch (err) {
      console.error('Error creating client:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar cliente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (data: ClientFormData) => {
    if (!selectedClient) return;

    try {
      setIsSubmitting(true);
      const updatedClient = await updateClient({
        id: selectedClient.id,
        name: data.name.trim()
      });

      setClients(prev => prev.map(client =>
        client.id === updatedClient.id ? updatedClient : client
      ));
      setIsEditModalOpen(false);
      setSelectedClient(null);
      editForm.reset();

      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso.",
      });
    } catch (err) {
      console.error('Error updating client:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;

    try {
      setIsSubmitting(true);
      await deleteClient(selectedClient.id);

      setClients(prev => prev.filter(client => client.id !== selectedClient.id));
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);

      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso.",
      });
    } catch (err) {
      console.error('Error deleting client:', err);
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Gerenciamento de Clientes
          </h2>
          <p className="text-gray-600">Gerencie todos os clientes do sistema</p>
        </div>
        <Button onClick={handleCreateClient} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pesquisa
          </CardTitle>
          <CardDescription>
            Digite o nome do cliente para pesquisar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome do cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              disabled={loading}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes ({clients.length})
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadClients} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
              Carregando clientes...
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ?
                `Nenhum cliente encontrado para "${searchTerm}".` :
                'Nenhum cliente cadastrado no sistema.'
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">#{client.id}</TableCell>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{formatDate(client.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client)}
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

      {/* Create Client Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Adicione um novo cliente ao sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Nome do Cliente</Label>
                <Input
                  id="create-name"
                  {...createForm.register('name', {
                    required: 'Nome é obrigatório',
                    minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                  })}
                  placeholder="Digite o nome do cliente"
                />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
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
                  'Criar Cliente'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Altere as informações do cliente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome do Cliente</Label>
                <Input
                  id="edit-name"
                  {...editForm.register('name', {
                    required: 'Nome é obrigatório',
                    minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                  })}
                  placeholder="Digite o nome do cliente"
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedClient(null);
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
              Tem certeza que deseja excluir o cliente "{selectedClient?.name}"?
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