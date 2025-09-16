import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '../../components/ui/chart';
import { getCallStats, getCalls, getTimelineStats } from '../../services/callsService';
import { type CallStats, type Call, type TimelineStats } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  PieChart,
  Pie,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<CallStats | null>(null);
  const [_, setCalls] = useState<Call[]>([]);
  const [timelineStats, setTimelineStats] = useState<TimelineStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, callsData, timelineData] = await Promise.all([
        getCallStats(),
        getCalls(),
        getTimelineStats(8)
      ]);
      
      setStats(statsData);
      setCalls(callsData);
      setTimelineStats(timelineData);
      
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Erro ao carregar dados de analytics. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const serviceTypeData = stats ? [
    { name: 'Novo Projeto', value: stats.serviceTypeStats.novoProjeto, fill: 'var(--color-novo-projeto)' },
    { name: 'Melhoria', value: stats.serviceTypeStats.melhoria, fill: 'var(--color-melhoria)' },
    { name: 'Sustentação', value: stats.serviceTypeStats.sustentacao, fill: 'var(--color-sustentacao)' },
  ] : [];

  const celulaChartData = stats ? Object.entries(stats.byCelula).map(([celula, count], index) => ({
    celula,
    count,
    fill: `var(--color-celula-${index})`
  })) : [];

  const technologyChartData = stats ? Object.entries(stats.byTechnology).map(([tech, count], index) => ({
    technology: tech,
    count,
    fill: `var(--color-tech-${index})`
  })) : [];

  const weeklyRequestData = timelineStats.map((period) => ({
    week: period.period,
    requests: period.totalRequests,
    startDate: period.startDate,
    endDate: period.endDate
  }));

  const serviceTypeChartConfig = {
    "novo-projeto": {
      label: "Novo Projeto",
      color: "#3b82f6",
    },
    melhoria: {
      label: "Melhoria",
      color: "#f59e0b",
    },
    sustentacao: {
      label: "Sustentação",
      color: "#10b981",
    },
  };

  const celulaChartConfig = stats ? Object.entries(stats.byCelula).reduce((config, [celula], index) => {
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
    return {
      ...config,
      [`celula-${index}`]: {
        label: celula,
        color: colors[index % colors.length],
      },
    };
  }, {}) : {};

  const technologyChartConfig = stats ? Object.entries(stats.byTechnology).reduce((config, [tech], index) => {
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316'];
    return {
      ...config,
      [`tech-${index}`]: {
        label: tech,
        color: colors[index % colors.length],
      },
    };
  }, {}) : {};

  const weeklyRequestChartConfig = {
    requests: {
      label: "Solicitações",
      color: "#0056b3",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics da Torre RPA</h1>
          <p className="text-gray-600">Insights e métricas para planejamento e gestão da Torre RPA</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Carregando analytics...</span>
          </div>
        )}
      </div>

      {error ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Células Ativas</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {loading ? '...' : (stats ? Object.keys(stats.byCelula).length : 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unidades solicitando suporte
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos Projetos</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-blue-700 mb-2">
                    {loading ? '...' : (stats?.serviceTypeStats.novoProjeto || 0)}
                  </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Melhorias</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                   <div className="text-2xl font-bold text-amber-700 mb-2">
                    {loading ? '...' : (stats?.serviceTypeStats.melhoria || 0)}
                  </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sustentação</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                   <div className="text-2xl font-bold text-green-700 mb-2">
                    {loading ? '...' : (stats?.serviceTypeStats.sustentacao || 0)}
                  </div>
              </CardContent>
            </Card>
            </div>
              
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Solicitação RPA</CardTitle>
                <CardDescription>Distribuição por tipo de serviço</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-500">Carregando gráfico...</p>
                    </div>
                  </div>
                ) : serviceTypeData.length > 0 ? (
                  <ChartContainer config={serviceTypeChartConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={serviceTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Solicitações por Célula</CardTitle>
                <CardDescription>Volume de demandas por unidade de negócio</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-500">Carregando gráfico...</p>
                    </div>
                  </div>
                ) : celulaChartData.length > 0 ? (
                  <ChartContainer config={celulaChartConfig} className="h-[300px]">
                    <BarChart data={celulaChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="celula" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Solicitações</CardTitle>
                <CardDescription>Volume semanal de solicitações RPA</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-500">Carregando gráfico...</p>
                    </div>
                  </div>
                ) : weeklyRequestData.length > 0 ? (
                  <ChartContainer config={weeklyRequestChartConfig} className="h-[300px]">
                    <LineChart data={weeklyRequestData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="requests" 
                        stroke="var(--color-requests)" 
                        strokeWidth={3}
                        dot={{ fill: 'var(--color-requests)', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tecnologias de Automação</CardTitle>
                <CardDescription>Distribuição por tecnologia utilizada</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-500">Carregando gráfico...</p>
                    </div>
                  </div>
                ) : technologyChartData.length > 0 ? (
                  <ChartContainer config={technologyChartConfig} className="h-[300px]">
                    <BarChart data={technologyChartData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="technology" type="category" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}