import { z } from 'zod';

// Helper functions for common validations
const nonEmptyString = (message: string, minLength: number = 1) =>
  z.string()
    .trim()
    .min(minLength, message)
    .refine(val => val.length > 0 && !/^\s*$/.test(val), {
      message: "Campo não pode conter apenas espaços vazios"
    });

const numericString = (message: string = "Deve conter apenas números") =>
  z.string()
    .trim()
    .regex(/^\d+$/, message)
    .min(1, "Campo obrigatório");

// Base schema common to all service types
const baseSchema = z.object({
  serviceType: z.enum(['MELHORIA', 'SUSTENTACAO', 'NOVO_PROJETO'], {
    message: "Selecione o tipo de serviço"
  }),
  description: nonEmptyString("Descrição é obrigatória", 50),
});

// Schema for Melhoria service type
const melhoriaSchema = baseSchema.extend({
  serviceType: z.literal('MELHORIA'),
  jaSustentada: z.boolean({
    message: "Selecione se já foi sustentada"
  }),
  idCliente: numericString("ID do cliente deve conter apenas números"),
  nomeCliente: nonEmptyString("Nome do cliente é obrigatório"),
  idServico: numericString("ID do serviço deve conter apenas números"),
  nomeServico: nonEmptyString("Nome do serviço é obrigatório"),
  empresa: nonEmptyString("Empresa é obrigatória"),
  temDocumentacao: z.boolean({
    message: "Selecione se tem documentação"
  }),
  tecnologiaAutomacao: nonEmptyString("Tecnologia de automação é obrigatória"),
  usuarioAutomacao: nonEmptyString("Usuário da automação é obrigatório"),
  servidorAutomacao: nonEmptyString("Servidor da automação é obrigatório"),
  celula: nonEmptyString("Célula é obrigatória"),
  robotSelecionado: nonEmptyString("Seleção do robô é obrigatória"),
  documentacaoFiles: z.array(z.instanceof(File)).optional(),
  evidenciasFiles: z.array(z.instanceof(File)).optional(),
});

// Schema for Sustentacao service type  
const sustentacaoSchema = baseSchema.extend({
  serviceType: z.literal('SUSTENTACAO'),
  ocorrenciaSustentacao: nonEmptyString("Descrição da ocorrência é obrigatória", 50),
  idCliente: numericString("ID do cliente deve conter apenas números"),
  nomeCliente: nonEmptyString("Nome do cliente é obrigatório"),
  idServico: numericString("ID do serviço deve conter apenas números"),
  nomeServico: nonEmptyString("Nome do serviço é obrigatório"),
  empresa: nonEmptyString("Empresa é obrigatória"),
  temDocumentacao: z.boolean({
    message: "Selecione se tem documentação"
  }),
  tecnologiaAutomacao: nonEmptyString("Tecnologia de automação é obrigatória"),
  usuarioAutomacao: nonEmptyString("Usuário da automação é obrigatório"),
  servidorAutomacao: nonEmptyString("Servidor da automação é obrigatório"),
  celula: nonEmptyString("Célula é obrigatória"),
  robotSelecionado: nonEmptyString("Seleção do robô é obrigatória"),
  documentacaoFiles: z.array(z.instanceof(File)).optional(),
  evidenciasFiles: z.array(z.instanceof(File)).optional(),
});

// Schema for Novo Projeto service type
const novoProjetoSchema = baseSchema.extend({
  serviceType: z.literal('NOVO_PROJETO'),
  roi: nonEmptyString("ROI é obrigatório", 150),
  celula: nonEmptyString("Célula é obrigatória"),
  cliente: nonEmptyString("Cliente é obrigatório"),
  servico: nonEmptyString("Serviço é obrigatório"),
  areaNegocio: nonEmptyString("Área de negócio é obrigatória"),
  nomeProcesso: nonEmptyString("Nome do processo é obrigatório"),
  frequenciaExecucao: nonEmptyString("Frequência de execução é obrigatória"),
  sazonalidade: nonEmptyString("Sazonalidade é obrigatória"),
  volumetria: nonEmptyString("Volumetria é obrigatória"),
  duracaoCadaCaso: nonEmptyString("Duração de cada caso é obrigatória"),
  quantasPessoasTrabalham: z.number({
    message: "Quantidade de pessoas é obrigatória"
  }).min(1, "Deve ser pelo menos 1 pessoa"),
  fonteDadosEntrada: nonEmptyString("Fonte de dados de entrada é obrigatória"),
  usaMFA: nonEmptyString("Informação sobre MFA é obrigatória"),
  existeCaptcha: nonEmptyString("Informação sobre CAPTCHA é obrigatória"),
  existeCertificadoDigital: nonEmptyString("Informação sobre certificado digital é obrigatória"),
  possivelUsarAPI: nonEmptyString("Informação sobre uso de API é obrigatória"),
  possibilidadeUsuarioRobotico: nonEmptyString("Informação sobre usuário robótico é obrigatória"),
  limitacaoAcessoLogin: nonEmptyString("Informação sobre limitação de acesso é obrigatória"),
  acessoAplicacoes: nonEmptyString("Informação sobre acesso a aplicações é obrigatória"),
  rdpOpcaoPositiva: nonEmptyString("Informação sobre RDP é obrigatória"),
  necessitaVPN: nonEmptyString("Informação sobre VPN é obrigatória"),
  analiseHumanaEtapa: nonEmptyString("Informação sobre análise humana é obrigatória"),
  restricaoTecnologiaSistema: nonEmptyString("Informação sobre restrição tecnológica é obrigatória"),
  regrasDefinidas: nonEmptyString("Informação sobre regras definidas é obrigatória"),
  processoRepetitivo: nonEmptyString("Informação sobre processo repetitivo é obrigatória"),
  dadosEstruturados: nonEmptyString("Informação sobre dados estruturados é obrigatória"),
});

// Union schema that discriminates based on serviceType
export const formSchema = z.discriminatedUnion('serviceType', [
  melhoriaSchema,
  sustentacaoSchema,
  novoProjetoSchema
]);

// Type inference
export type FormData = z.infer<typeof formSchema>;
export type MelhoriaFormData = z.infer<typeof melhoriaSchema>;
export type SustentacaoFormData = z.infer<typeof sustentacaoSchema>;
export type NovoProjetoFormData = z.infer<typeof novoProjetoSchema>;

// Helper to get default values based on service type
export const getDefaultValues = (serviceType?: string) => {
  const baseDefaults = {
    serviceType: serviceType as 'MELHORIA' | 'SUSTENTACAO' | 'NOVO_PROJETO' | undefined,
    description: '',
  };

  switch (serviceType) {
    case 'MELHORIA':
      return {
        ...baseDefaults,
        serviceType: 'MELHORIA' as const,
        jaSustentada: undefined,
        idCliente: '',
        nomeCliente: '',
        idServico: '',
        nomeServico: '',
        empresa: '',
        temDocumentacao: undefined,
        tecnologiaAutomacao: '',
        usuarioAutomacao: '',
        servidorAutomacao: '',
        celula: '',
        robotSelecionado: '',
        documentacaoFiles: [],
        evidenciasFiles: [],
      };
    
    case 'SUSTENTACAO':
      return {
        ...baseDefaults,
        serviceType: 'SUSTENTACAO' as const,
        ocorrenciaSustentacao: '',
        idCliente: '',
        nomeCliente: '',
        idServico: '',
        nomeServico: '',
        empresa: '',
        temDocumentacao: undefined,
        tecnologiaAutomacao: '',
        usuarioAutomacao: '',
        servidorAutomacao: '',
        celula: '',
        robotSelecionado: '',
        documentacaoFiles: [],
        evidenciasFiles: [],
      };
    
    case 'NOVO_PROJETO':
      return {
        ...baseDefaults,
        serviceType: 'NOVO_PROJETO' as const,
        roi: '',
        celula: '',
        cliente: '',
        servico: '',
        areaNegocio: '',
        nomeProcesso: '',
        frequenciaExecucao: '',
        sazonalidade: '',
        volumetria: '',
        duracaoCadaCaso: '',
        quantasPessoasTrabalham: undefined,
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
        restricaoTecnologiaSistema: '',
        regrasDefinidas: '',
        processoRepetitivo: '',
        dadosEstruturados: '',
      };
    
    default:
      return baseDefaults;
  }
};