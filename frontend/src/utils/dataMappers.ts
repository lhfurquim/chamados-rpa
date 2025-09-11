import type { FormSubmissionData } from '../types';

export interface MelhoriaFormData {
  description: string;
  submittedBy: string;
  celula: string;
  robot: string;
  jaSustentada: boolean;
  idCliente: string;
  nomeCliente: string;
  idServico: string;
  nomeServico: string;
  empresa: string;
  temDocumentacao: boolean;
  tecnologiaAutomacao: string;
  usuarioAutomacao: string;
  servidorAutomacao: string;
}

export interface SustentacaoFormData {
  description: string;
  submittedBy: string;
  idCliente: string;
  nomeCliente: string;
  idServico: string;
  nomeServico: string;
  empresa: string;
  temDocumentacao: boolean;
  tecnologiaAutomacao: string;
  usuarioAutomacao: string;
  servidorAutomacao: string;
  celula: string;
  robotSelecionado: string;
}

export interface NovoProjetoFormData {
  description: string;
  submittedBy: string;
  roi: string;
  celula: string;
  cliente: string;
  servico: string;
  areaNegocio: string;
  nomeProcesso: string;
  frequenciaExecucao: string;
  sazonalidade: string;
  volumetria: string;
  duracaoCadaCaso: string;
  quantasPessoasTrabalham: number;
  fonteDadosEntrada: string;
  usaMFA: string;
  existeCaptcha: string;
  existeCertificadoDigital: string;
  possivelUsarAPI: string;
  possibilidadeUsuarioRobotico: string;
  limitacaoAcessoLogin: string;
  acessoAplicacoes: string;
  rdpOpcaoPositiva: string;
  necessitaVPN: string;
  analiseHumanaEtapa: string;
  restricaoTecnologiaSistema: string;
  regrasDefinidas: string;
  processoRepetitivo: string;
  dadosEstruturados: string;
}

export const transformMelhoriaForSubmission = (formData: any): MelhoriaFormData => {
  return {
    description: formData.description || '',
    submittedBy: formData.submittedBy || '',
    celula: formData.celula || formData.cell || '',
    robot: formData.robotSelecionado || formData.selectedRobot || '',
    jaSustentada: convertToBoolean(formData.jaSustentada) || false,
    idCliente: formData.idCliente || formData.customerId || '',
    nomeCliente: formData.nomeCliente || formData.customerName || '',
    idServico: formData.idServico || formData.serviceId || '',
    nomeServico: formData.nomeServico || formData.serviceName || '',
    empresa: formData.empresa || formData.company || '',
    temDocumentacao: convertToBoolean(formData.temDocumentacao) || false,
    tecnologiaAutomacao: formData.tecnologiaAutomacao || formData.automationTechnology || '',
    usuarioAutomacao: formData.usuarioAutomacao || formData.automationUser || '',
    servidorAutomacao: formData.servidorAutomacao || formData.automationServer || ''
  };
};

export const transformSustentacaoForSubmission = (formData: any): SustentacaoFormData => {
  return {
    description: formData.description || '',
    submittedBy: formData.submittedBy || '',
    idCliente: formData.idCliente || formData.customerId || '',
    nomeCliente: formData.nomeCliente || formData.customerName || '',
    idServico: formData.idServico || formData.serviceId || '',
    nomeServico: formData.nomeServico || formData.serviceName || '',
    empresa: formData.empresa || formData.company || '',
    temDocumentacao: convertToBoolean(formData.temDocumentacao) || false,
    tecnologiaAutomacao: formData.tecnologiaAutomacao || formData.automationTechnology || '',
    usuarioAutomacao: formData.usuarioAutomacao || formData.automationUser || '',
    servidorAutomacao: formData.servidorAutomacao || formData.automationServer || '',
    celula: formData.celula || formData.cell || '',
    robotSelecionado: formData.robotSelecionado || formData.selectedRobot || ''
  };
};

export const transformNovoProjetoForSubmission = (formData: any): NovoProjetoFormData => {
  return {
    description: formData.description || '',
    submittedBy: formData.submittedBy || '',
    roi: formData.roi || formData.ROI || '',
    celula: formData.celula || formData.cell || '',
    cliente: formData.cliente || formData.client || '',
    servico: formData.servico || formData.service || '',
    areaNegocio: formData.areaNegocio || formData.businessArea || '',
    nomeProcesso: formData.nomeProcesso || formData.processName || '',
    frequenciaExecucao: formData.frequenciaExecucao || '',
    sazonalidade: formData.sazonalidade || '',
    volumetria: formData.volumetria || '',
    duracaoCadaCaso: formData.duracaoCadaCaso || '',
    quantasPessoasTrabalham: Number(formData.quantasPessoasTrabalham) || 0,
    fonteDadosEntrada: formData.fonteDadosEntrada || '',
    usaMFA: formData.usaMFA || '',
    existeCaptcha: formData.existeCaptcha || '',
    existeCertificadoDigital: formData.existeCertificadoDigital || '',
    possivelUsarAPI: formData.possivelUsarAPI || '',
    possibilidadeUsuarioRobotico: formData.possibilidadeUsuarioRobotico || '',
    limitacaoAcessoLogin: formData.limitacaoAcessoLogin || '',
    acessoAplicacoes: formData.acessoAplicacoes || '',
    rdpOpcaoPositiva: formData.rdpOpcaoPositiva || '',
    necessitaVPN: formData.necessitaVPN || '',
    analiseHumanaEtapa: formData.analiseHumanaEtapa || '',
    restricaoTecnologiaSistema: formData.restricaoTecnologiaSistema || '',
    regrasDefinidas: formData.regrasDefinidas || '',
    processoRepetitivo: formData.processoRepetitivo || '',
    dadosEstruturados: formData.dadosEstruturados || ''
  };
};

export const transformFormDataForSubmission = (formData: any): FormSubmissionData => {
  return {
    serviceType: formData.serviceType,
    description: formData.description || '',
    submittedBy: formData.submittedBy,
    roi: formData.roi || formData.ROI || '',
    celula: formData.celula || formData.cell || '',
    cliente: formData.cliente || formData.client || '',
    servico: formData.servico || formData.service || formData.Service || '',
    areaNegocio: formData.areaNegocio || formData.businessArea || '',
    nomeProcesso: formData.nomeProcesso || formData.processName || formData.ProcessName || '',
    regrasDefinidas: formData.regrasDefinidas || formData.definedRules || formData.DefinedRules || '',
    processoRepetitivo: formData.processoRepetitivo || formData.repetitiveProcess || formData.RepetitiveProcess || '',
    dadosEstruturados: formData.dadosEstruturados || formData.structuredData || '',
    // Sustentação fields
    ocorrenciaSustentacao: formData.ocorrenciaSustentacao || formData.supportIncident || formData.SupportIncident || '',
    celula: formData.celula || formData.cellCode || '',
    robotSelecionado: formData.robotSelecionado || formData.selectedRobot || formData.SelectedRobot || '',
    // Melhoria fields  
    jaSustentada: convertToBoolean(formData.jaSustentada),
    idCliente: formData.idCliente || formData.customerId || '',
    nomeCliente: formData.nomeCliente || formData.customerName || '',
    idServico: formData.idServico || formData.serviceId || '',
    nomeServico: formData.nomeServico || formData.serviceName || formData.ServiceName || '',
    empresa: formData.empresa || formData.company || '',
    temDocumentacao: convertToBoolean(formData.temDocumentacao || formData.hasDocumentation || formData.DocumentationItem),
    tecnologiaAutomacao: formData.tecnologiaAutomacao || formData.automationTechnology || formData.AutomationTechnology || '',
    usuarioAutomacao: formData.usuarioAutomacao || formData.automationUser || formData.AutomationUser || '',
    servidorAutomacao: formData.servidorAutomacao || formData.automationServer || formData.AutomationServer || '',
    // New fields for Novo Projeto
    frequenciaExecucao: formData.frequenciaExecucao || '',
    sazonalidade: formData.sazonalidade || '',
    volumetria: formData.volumetria || '',
    duracaoCadaCaso: formData.duracaoCadaCaso || '',
    quantasPessoasTrabalham: formData.quantasPessoasTrabalham,
    fonteDadosEntrada: formData.fonteDadosEntrada || '',
    usaMFA: formData.usaMFA || '',
    existeCaptcha: formData.existeCaptcha || '',
    existeCertificadoDigital: formData.existeCertificadoDigital || '',
    possivelUsarAPI: formData.possivelUsarAPI || '',
    possibilidadeUsuarioRobotico: formData.possibilidadeUsuarioRobotico || '',
    limitacaoAcessoLogin: formData.limitacaoAcessoLogin || '',
    acessoAplicacoes: formData.acessoAplicacoes || '',
    rdpOpcaoPositiva: formData.rdpOpcaoPositiva || '',
    necessitaVPN: formData.necessitaVPN || '',
    analiseHumanaEtapa: formData.analiseHumanaEtapa || '',
    restricaoTecnologiaSistema: formData.restricaoTecnologiaSistema || '',
  };
};

const convertToBoolean = (value: any): boolean | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === 'sim' || lowerValue === 'yes') {
      return true;
    }
    if (lowerValue === 'false' || lowerValue === 'nao' || lowerValue === 'no') {
      return false;
    }
  }
  
  return undefined;
};

export const mapServiceTypeForAPI = (serviceType: string): string => {
  const mapping: Record<string, string> = {
    'novo-projeto': 'NOVO_PROJETO',
    'melhoria': 'MELHORIA',
    'sustentacao': 'SUSTENTACAO'
  };
  return mapping[serviceType] || serviceType.toUpperCase();
};

export const mapServiceTypeFromAPI = (serviceType: string): string => {
  const mapping: Record<string, string> = {
    'NOVO_PROJETO': 'novo-projeto',
    'MELHORIA': 'melhoria',
    'SUSTENTACAO': 'sustentacao'
  };
  return mapping[serviceType] || serviceType.toLowerCase();
};