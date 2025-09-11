import type { Call, CallStats } from '../types';

export const transformCallFromAPI = (apiCall: any): Call => {
  return {
    id: apiCall.id,
    serviceType: apiCall.serviceType,
    issueType: apiCall.issueType || 'N/A',
    description: apiCall.description || '',
    createdAt: new Date(apiCall.createdAt),
    updatedAt: new Date(apiCall.updatedAt),
    submittedBy: apiCall.submittedBy || '',
    submitterInfo: {
      id: apiCall.submitterInfo?.id || '',
      name: apiCall.submitterInfo?.name || 'N/A',
      email: apiCall.submitterInfo?.email || 'N/A',
      phone: apiCall.submitterInfo?.phone,
      department: apiCall.submitterInfo?.department || 'N/A',
      company: apiCall.submitterInfo?.company || 'N/A'
    },
    roi: apiCall.roi,
    celula: apiCall.celula,
    cliente: apiCall.cliente,
    servico: apiCall.servico,
    areaNegocio: apiCall.areaNegocio,
    nomeProcesso: apiCall.nomeProcesso,
    regrasDefinidas: apiCall.regrasDefinidas,
    processoRepetitivo: apiCall.processoRepetitivo,
    dadosEstruturados: apiCall.dadosEstruturados,
    ocorrenciaSustentacao: apiCall.ocorrenciaSustentacao,
    robotSelecionado: apiCall.robotSelecionado,
    jaSustentada: apiCall.jaSustentada,
    idCliente: apiCall.idCliente,
    nomeCliente: apiCall.nomeCliente,
    idServico: apiCall.idServico,
    nomeServico: apiCall.nomeServico,
    empresa: apiCall.empresa,
    temDocumentacao: apiCall.temDocumentacao,
    documentacaoFiles: apiCall.documentacaoFiles || [],
    tecnologiaAutomacao: apiCall.tecnologiaAutomacao,
    usuarioAutomacao: apiCall.usuarioAutomacao,
    servidorAutomacao: apiCall.servidorAutomacao,
    evidenciasFiles: apiCall.evidenciasFiles || [],
    frequenciaExecucao: apiCall.frequenciaExecucao,
    sazonalidade: apiCall.sazonalidade,
    volumetria: apiCall.volumetria,
    duracaoCadaCaso: apiCall.duracaoCadaCaso,
    quantasPessoasTrabalham: apiCall.quantasPessoasTrabalham,
    fonteDadosEntrada: apiCall.fonteDadosEntrada,
    usaMFA: apiCall.usaMFA,
    existeCaptcha: apiCall.existeCaptcha,
    existeCertificadoDigital: apiCall.existeCertificadoDigital,
    possivelUsarAPI: apiCall.possivelUsarAPI,
    possibilidadeUsuarioRobotico: apiCall.possibilidadeUsuarioRobotico,
    limitacaoAcessoLogin: apiCall.limitacaoAcessoLogin,
    acessoAplicacoes: apiCall.acessoAplicacoes,
    rdpOpcaoPositiva: apiCall.rdpOpcaoPositiva,
    necessitaVPN: apiCall.necessitaVPN,
    analiseHumanaEtapa: apiCall.analiseHumanaEtapa,
    restricaoTecnologiaSistema: apiCall.restricaoTecnologiaSistema
  };
};

export const transformStatsFromAPI = (apiStats: any): CallStats => {
  return {
    total: apiStats.total || 0,
    serviceTypeStats: {
      melhoria: apiStats.byServiceType?.melhoria || 0,
      sustentacao: apiStats.byServiceType?.sustentacao || 0,
      novoProjeto: apiStats.byServiceType?.novoProjeto || 0
    },
    byCelula: apiStats.byCelula || {},
    byDepartment: apiStats.byDepartment || {},
    byTechnology: apiStats.byTechnology || {},
    activeUsers: apiStats.activeUsers || 0,
    avgResponseTime: apiStats.avgResponseTime || 0,
    recentActivity: {
      thisWeek: apiStats.recentActivity?.thisWeek || 0,
      lastWeek: apiStats.recentActivity?.lastWeek || 0,
      percentChange: apiStats.recentActivity?.percentChange || 0
    }
  };
};

export const transformCallsFromAPI = (apiCalls: any[]): Call[] => {
  return apiCalls.map(transformCallFromAPI);
};