import type { ServiceType, FormData } from "../types";
import { plannerApi } from "./plannerAutomation";

interface PlannerFile {
  name: string;
  url: string;
}

interface CreateCardRequest {
  requestId: string;
  serviceType: ServiceType;
  description: string;
  submittedBy: string;
  roi: string;
  celula: string;
  cliente: string;
  servico: string;
  areaNegocio: string;
  nomeProcesso: string;
  regrasDefinidas: string;
  processoRepetitivo: string;
  dadosEstruturados: string;
  ocorrenciaSustentacao: string;
  roboSelecionado: string;
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
  documentacaoFiles: PlannerFile[];
  evidenciasFiles: PlannerFile[];
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
}

interface PlannerResponse {
  success: boolean;
  message?: string;
  cardId?: string;
}

export function transformDataForPlanner(
  formData: FormData, 
  requestId: string, 
  submittedBy: string
): CreateCardRequest {
  const baseData = {
    requestId,
    serviceType: formData.serviceType,
    description: formData.description || '',
    submittedBy,
    roi: '',
    celula: '',
    cliente: '',
    servico: '',
    areaNegocio: '',
    nomeProcesso: '',
    regrasDefinidas: '',
    processoRepetitivo: '',
    dadosEstruturados: '',
    ocorrenciaSustentacao: '',
    roboSelecionado: '',
    jaSustentada: false,
    idCliente: '',
    nomeCliente: '',
    idServico: '',
    nomeServico: '',
    empresa: '',
    temDocumentacao: false,
    tecnologiaAutomacao: '',
    usuarioAutomacao: '',
    servidorAutomacao: '',
    documentacaoFiles: [] as PlannerFile[],
    evidenciasFiles: [] as PlannerFile[],
    frequenciaExecucao: '',
    sazonalidade: '',
    volumetria: '',
    duracaoCadaCaso: '',
    quantasPessoasTrabalham: 0,
    fonteDadosEntrada: '',
    usaMFA: '',
    existeCaptcha: '',
    existeCertificadoDigital: '',
    possivelUsarAPI: '',
    possibilidadeUsuarioRobotico: '',
    limitacaoAcessoLogin: '',
    acessoAplicacoes: '',
    rdpOpcaoPositiva: '',
    necessitaVPN: '',
    analiseHumanaEtapa: '',
    restricaoTecnologiaSistema: ''
  };

  switch (formData.serviceType) {
    case 'MELHORIA':
      if ('jaSustentada' in formData) {
        return {
          ...baseData,
          celula: formData.celula || '',
          roboSelecionado: formData.robotSelecionado || '',
          jaSustentada: formData.jaSustentada ?? false,
          idCliente: formData.idCliente || '',
          nomeCliente: formData.nomeCliente || '',
          idServico: formData.idServico || '',
          nomeServico: formData.nomeServico || '',
          empresa: formData.empresa || '',
          temDocumentacao: formData.temDocumentacao ?? false,
          tecnologiaAutomacao: formData.tecnologiaAutomacao || '',
          usuarioAutomacao: formData.usuarioAutomacao || '',
          servidorAutomacao: formData.servidorAutomacao || ''
        };
      }
      break;
      
    case 'SUSTENTACAO':
      if ('ocorrenciaSustentacao' in formData) {
        return {
          ...baseData,
          ocorrenciaSustentacao: formData.ocorrenciaSustentacao || '',
          celula: formData.celula || '',
          roboSelecionado: formData.robotSelecionado || '',
          idCliente: formData.idCliente || '',
          nomeCliente: formData.nomeCliente || '',
          idServico: formData.idServico || '',
          nomeServico: formData.nomeServico || '',
          empresa: formData.empresa || '',
          temDocumentacao: formData.temDocumentacao ?? false,
          tecnologiaAutomacao: formData.tecnologiaAutomacao || '',
          usuarioAutomacao: formData.usuarioAutomacao || '',
          servidorAutomacao: formData.servidorAutomacao || ''
        };
      }
      break;
      
    case 'NOVO_PROJETO':
      if ('roi' in formData) {
        return {
          ...baseData,
          roi: formData.roi || '',
          celula: formData.celula || '',
          cliente: formData.cliente || '',
          servico: formData.servico || '',
          areaNegocio: formData.areaNegocio || '',
          nomeProcesso: formData.nomeProcesso || '',
          regrasDefinidas: formData.regrasDefinidas || '',
          processoRepetitivo: formData.processoRepetitivo || '',
          dadosEstruturados: formData.dadosEstruturados || '',
          frequenciaExecucao: formData.frequenciaExecucao || '',
          sazonalidade: formData.sazonalidade || '',
          volumetria: formData.volumetria || '',
          duracaoCadaCaso: formData.duracaoCadaCaso || '',
          quantasPessoasTrabalham: formData.quantasPessoasTrabalham || 0,
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
          restricaoTecnologiaSistema: formData.restricaoTecnologiaSistema || ''
        };
      }
      break;
  }

  return baseData;
}

export async function createCard(request: CreateCardRequest): Promise<PlannerResponse> {
  try {
    console.log('📋 Enviando dados para API do Planner:', request);
    
    const response = await plannerApi.post<PlannerResponse>("/", request, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta da API do Planner:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao enviar para API do Planner:', error);
    
    const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido ao comunicar com o Planner';
    
    return {
      success: false,
      message: errorMessage
    };
  }
}