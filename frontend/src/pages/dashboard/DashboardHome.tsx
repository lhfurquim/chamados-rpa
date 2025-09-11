import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { getDashboardData } from '../../services/dashboardApi';
import { type DashboardData } from '../../types';
import { 
  Users, 
  Building2, 
  Cpu, 
  TrendingUp,
  Phone,
  Calendar,
  User,
  Mail,
  Clock,
  Loader2
} from 'lucide-react';

export default function DashboardHome() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getDashboardData();
      setDashboardData(data);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
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

  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'NOVO_PROJETO': return 'Novo Projeto';
      case 'MELHORIA': return 'Melhoria';
      case 'SUSTENTACAO': return 'Sustentação';
      default: return serviceType;
    }
  };

  const activeCells = dashboardData ? Object.keys(dashboardData.callStats.byCelula).length : 0;

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Dashboard Torre RPA</h1>
          <p className="text-gray-600 text-sm sm:text-base">Visão geral do sistema de gerenciamento RPA</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}
      </div>

      {error ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
                <Phone className="h-4 w-4 text-stefanini-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-stefanini-700">
                  {loading ? '...' : dashboardData?.callStats.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Carregando...' : (
                    dashboardData?.callStats.recentActivity.percentChange 
                      ? `${dashboardData.callStats.recentActivity.percentChange > 0 ? '+' : ''}${dashboardData.callStats.recentActivity.percentChange}% esta semana`
                      : 'Sem dados desta semana'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Células Ativas</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {loading ? '...' : activeCells}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unidades solicitando suporte
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {loading ? '...' : dashboardData?.activeUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Carregando...' : (
                    dashboardData?.newUsersThisMonth 
                      ? `+${dashboardData.newUsersThisMonth} novos este mês`
                      : 'Usuários cadastrados no sistema'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tecnologias em Uso</CardTitle>
                <Cpu className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {loading ? '...' : Object.keys(dashboardData?.technologyStats || {}).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Carregando...' : (
                    Object.keys(dashboardData?.technologyStats || {}).length > 0 
                      ? `${Math.max(...Object.values(dashboardData?.technologyStats || {}))} solicitações na mais usada`
                      : 'Diferentes plataformas RPA'
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service Type Distribution and Recent Calls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações Recentes</CardTitle>
                <CardDescription>Últimas solicitações registradas no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Carregando...
                    </div>
                  ) : !dashboardData?.recentCalls || dashboardData.recentCalls.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Nenhuma solicitação encontrada
                    </div>
                  ) : (
                    dashboardData.recentCalls.map((call) => (
                      <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceTypeColor(call.serviceType)}`}>
                              {getServiceTypeLabel(call.serviceType)}
                            </span>
                            <span className="text-xs text-gray-500">#{call.id}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-sm font-medium">{call.submitterInfo?.name || 'N/A'}</span>
                            <span className="text-xs text-gray-500">({call.submitterInfo?.department || 'N/A'})</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-1">{call.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(call.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                            {call.celula && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Célula {call.celula}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo de Serviço</CardTitle>
                <CardDescription>Análise dos tipos de solicitação RPA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Carregando estatísticas...
                    </div>
                  ) : dashboardData?.callStats ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Novo Projeto</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: dashboardData.callStats.total > 0 ? `${(dashboardData.callStats.byServiceType.novoProjeto / dashboardData.callStats.total) * 100}%` : '0%' }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-6">{dashboardData.callStats.byServiceType.novoProjeto}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Melhoria</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-amber-500 h-2 rounded-full" 
                              style={{ width: dashboardData.callStats.total > 0 ? `${(dashboardData.callStats.byServiceType.melhoria / dashboardData.callStats.total) * 100}%` : '0%' }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-6">{dashboardData.callStats.byServiceType.melhoria}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sustentação</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: dashboardData.callStats.total > 0 ? `${(dashboardData.callStats.byServiceType.sustentacao / dashboardData.callStats.total) * 100}%` : '0%' }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-6">{dashboardData.callStats.byServiceType.sustentacao}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Sem dados disponíveis
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department and Technology Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Departamentos Mais Ativos</CardTitle>
                <CardDescription>Solicitações por departamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Carregando...
                    </div>
                  ) : Object.keys(dashboardData?.departmentStats || {}).length > 0 ? (
                    Object.entries(dashboardData?.departmentStats || {})
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 4)
                      .map(([dept, count]) => {
                        const totalRequests = Object.values(dashboardData?.departmentStats || {}).reduce((sum, val) => sum + val, 0);
                        return (
                          <div key={dept} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{dept}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-stefanini-500 h-2 rounded-full" 
                                  style={{ width: totalRequests > 0 ? `${(count / totalRequests) * 100}%` : '0%' }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-6">{count}</span>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-4 text-gray-500">Sem dados disponíveis</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tecnologias Mais Utilizadas</CardTitle>
                <CardDescription>Plataformas RPA em uso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Carregando...
                    </div>
                  ) : Object.keys(dashboardData?.technologyStats || {}).length > 0 ? (
                    Object.entries(dashboardData?.technologyStats || {})
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([tech, count]) => {
                        const totalTechRequests = Object.values(dashboardData?.technologyStats || {}).reduce((sum, val) => sum + val, 0);
                        return (
                          <div key={tech} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{tech}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full" 
                                  style={{ width: totalTechRequests > 0 ? `${(count / totalTechRequests) * 100}%` : '0%' }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-6">{count}</span>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-4 text-gray-500">Sem dados disponíveis</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Activity and Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Mais Ativos</CardTitle>
                <CardDescription>Top usuários por número de solicitações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Carregando...
                    </div>
                  ) : dashboardData?.topUsersByTickets && dashboardData.topUsersByTickets.length > 0 ? (
                    dashboardData.topUsersByTickets
                      .map((user) => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate">{user.userName}</span>
                            <span className="text-xs text-gray-500">{user.department}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{user.totalTickets}</div>
                            <div className="text-xs text-gray-500">solicitações</div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">Sem dados disponíveis</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Usuários</CardTitle>
                <CardDescription>Resumo da base de usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Carregando estatísticas...
                    </div>
                  ) : dashboardData ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total de Usuários</span>
                        <span className="text-lg font-bold text-blue-700">{dashboardData.totalUsers}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Usuários Ativos</span>
                        <span className="text-lg font-bold text-green-700">{dashboardData.activeUsers}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Novos este Mês</span>
                        <span className="text-lg font-bold text-amber-700">{dashboardData.newUsersThisMonth}</span>
                      </div>

                      {dashboardData.topDepartments.length > 0 && (
                        <div className="pt-2 border-t">
                          <span className="text-sm text-gray-600 block mb-2">Departamento Mais Ativo</span>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{dashboardData.topDepartments[0].department}</span>
                            <span className="text-sm text-gray-600">{dashboardData.topDepartments[0].userCount} usuários</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">Sem dados disponíveis</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Atividade</CardTitle>
              <CardDescription>Indicadores-chave da Torre RPA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700 mb-1">
                    {loading ? '...' : dashboardData?.callStats.recentActivity.thisWeek || 0}
                  </div>
                  <p className="text-sm text-blue-600">Esta Semana</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {loading ? '...' : (dashboardData?.callStats.avgResponseTime ? `${dashboardData.callStats.avgResponseTime}h` : 'N/A')}
                  </div>
                  <p className="text-sm text-green-600">Tempo Médio</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700 mb-1">
                    {loading ? '...' : (dashboardData ? Object.keys(dashboardData.callStats.byCelula).length : 0)}
                  </div>
                  <p className="text-sm text-purple-600">Células Ativas</p>
                </div>

                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Mail className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-700 mb-1">
                    {loading ? '...' : dashboardData?.totalUsers || 0}
                  </div>
                  <p className="text-sm text-amber-600">Total Usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}