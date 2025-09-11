import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getCalls, searchCalls, type CallFilters, type CallSearchResponse } from '../../services/callsApi';
import { type Call } from '../../types';
import CallViewModal from '../../components/CallViewModal';
import CallEditModal from '../../components/CallEditModal';
import { Search, Filter, Eye, Edit, Settings, Cpu, Building2, User, Mail, Phone, Loader2 } from 'lucide-react';

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [technologyFilter, setTechnologyFilter] = useState<string>('all');
  const [totalCalls, setTotalCalls] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [_, setTotalPages] = useState(0);
  
  const [viewModalCallId, setViewModalCallId] = useState<string | null>(null);
  const [editModalCallId, setEditModalCallId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const uniqueDepartments = Array.from(new Set(calls.map(call => call.submitterInfo?.department).filter(Boolean))).sort();
  const uniqueTechnologies = Array.from(new Set(calls.map(call => call.tecnologiaAutomacao).filter(Boolean))).sort();

  useEffect(() => {
    loadCalls();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadCalls();
    }
  }, [searchTerm, serviceTypeFilter, departmentFilter, technologyFilter]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: CallFilters = {
        search: searchTerm || undefined,
        serviceType: serviceTypeFilter !== 'all' ? serviceTypeFilter as Call['serviceType'] : undefined,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        technology: technologyFilter !== 'all' ? technologyFilter : undefined,
        page: currentPage,
        limit: 50
      };

      if (!filters.search && !filters.serviceType && !filters.department && !filters.technology) {
        const allCalls = await getCalls();
        setCalls(allCalls);
        setTotalCalls(allCalls.length);
        setTotalPages(1);
      } else {
        const response: CallSearchResponse = await searchCalls(filters);
        setCalls(response.calls);
        setTotalCalls(response.total);
        setCurrentPage(response.page);
        setTotalPages(response.totalPages);
      }
    } catch (err) {
      console.error('Error loading calls:', err);
      setError('Erro ao carregar solicitações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'NOVO_PROJETO': return 'Novo Projeto';
      case 'MELHORIA': return 'Melhoria';
      case 'SUSTENTACAO': return 'Sustentação';
      default: return serviceType;
    }
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case 'NOVO_PROJETO': return 'bg-blue-100 text-blue-800';
      case 'MELHORIA': return 'bg-amber-100 text-amber-800';
      case 'SUSTENTACAO': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCelulaLabel = (celula: string) => {
    switch (celula) {
      case '99': return '099 - Tesouraria';
      case '411': return '411 - Planejamento/Caixa';
      case '128': return '128 - Book Administrativo';
      case '621': return '621 - Vale N1';
      case '504': return '504 - OLÉ';
      case '230': return '230 - Gestão de Acesso';
      case '526': return '526 - Femsa';
      default: return celula;
    }
  };

  // Modal handlers
  const handleViewCall = (callId: string) => {
    setViewModalCallId(callId);
    setIsViewModalOpen(true);
  };

  const handleEditCall = (callId: string) => {
    setEditModalCallId(callId);
    setIsEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewModalCallId(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditModalCallId(null);
  };

  const handleEditSuccess = (updatedCall: Call) => {
    setCalls(prevCalls => 
      prevCalls.map(call => 
        call.id === updatedCall.id ? updatedCall : call
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Solicitações RPA</h1>
          <p className="text-gray-600">Gerencie todas as solicitações da Torre RPA</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Pesquisa
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar chamados específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por usuário, descrição, robô..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            
            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="novo-projeto">Novo Projeto</SelectItem>
                <SelectItem value="melhoria">Melhoria</SelectItem>
                <SelectItem value="sustentacao">Sustentação</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={technologyFilter} onValueChange={setTechnologyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as tecnologias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tecnologias</SelectItem>
                {uniqueTechnologies.map((tech) => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setServiceTypeFilter('all');
              setDepartmentFilter('all');
              setTechnologyFilter('all');
            }} disabled={loading}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Solicitações RPA ({totalCalls})
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadCalls} variant="outline">
                  Tentar Novamente
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
                Carregando solicitações...
              </div>
            ) : calls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma solicitação encontrada com os filtros selecionados.
              </div>
            ) : (
              calls.map((call) => (
                <div key={call.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-lg">#{call.id}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceTypeColor(call.serviceType)}`}>
                          {getServiceTypeLabel(call.serviceType)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        {/* User Information */}
                        <div className="border-r border-gray-200 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">Solicitante</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{call.submitterInfo?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-600">{call.submitterInfo?.department || 'N/A'}</p>
                            <p className="text-xs text-gray-600">{call.submitterInfo?.company || 'N/A'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{call.submitterInfo?.email || 'N/A'}</span>
                            </div>
                            {call.submitterInfo?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{call.submitterInfo.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Technical Information */}
                        <div className="border-r border-gray-200 pr-4">
                          {call.celula && (
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">{getCelulaLabel(call.celula)}</span>
                            </div>
                          )}
                          {call.robotSelecionado && (
                            <div className="flex items-center gap-2 mb-1">
                              <Cpu className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600 truncate">{call.robotSelecionado}</span>
                            </div>
                          )}
                          {call.tecnologiaAutomacao && (
                            <p className="text-sm text-gray-600">
                              <strong>Tecnologia:</strong> {call.tecnologiaAutomacao}
                            </p>
                          )}
                          {call.empresa && (
                            <p className="text-sm text-gray-600">
                              <strong>Empresa:</strong> {call.empresa}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Criado em:</strong> {new Date(call.createdAt).toLocaleString('pt-BR')}
                          </p>
                          {call.roi && (
                            <p className="text-sm text-gray-600">
                              <strong>ROI:</strong> {call.roi.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-800">
                          <strong>Descrição:</strong> {call.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCall(call.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCall(call.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CallViewModal
        callId={viewModalCallId}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />
      
      <CallEditModal
        callId={editModalCallId}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}