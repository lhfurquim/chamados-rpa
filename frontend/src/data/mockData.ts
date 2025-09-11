import { type Call } from '../types';

export const mockCalls: Call[] = [
  {
    id: '1',
    serviceType: 'sustentacao',
    issueType: 'Erro de Robô',
    description: 'Robô de extração de faturas travando durante execução mensal',
    createdAt: new Date('2025-09-01T10:30:00'),
    updatedAt: new Date('2025-09-01T10:30:00'),
    submittedBy: '1',
    submitterInfo: {
      id: '1',
      name: 'Maria Silva',
      email: 'maria.silva@tesouraria.com',
      phone: '(11) 99999-1234',
      department: 'Tesouraria',
      company: 'Tesouraria Corporativa'
    },
    celulaCode: '99',
    robotSelecionado: 'Anexar Faturamento HAUS RM',
    tecnologiaAutomacao: 'UiPath',
    empresa: 'Tesouraria Corporativa'
  },
  {
    id: '2',
    serviceType: 'novo-projeto',
    issueType: 'Automação Nova',
    description: 'Criar novo robô para automação de processamento de notas fiscais',
    createdAt: new Date('2025-08-30T14:15:00'),
    updatedAt: new Date('2025-09-01T09:00:00'),
    submittedBy: '9',
    submitterInfo: {
      id: '9',
      name: 'Juliana Alves',
      email: 'juliana.alves@rpa.com',
      phone: '(11) 91111-5432',
      department: 'RPA',
      company: 'Torre RPA'
    },
    roi: 'Economia de 40 horas/mês de trabalho manual',
    areaNegocio: 'Gestão financeira',
    nomeProcesso: 'Processamento NF-e',
    regrasDefinidas: 'padrao'
  },
  {
    id: '3',
    serviceType: 'melhoria',
    issueType: 'Otimização',
    description: 'Melhorar performance do robô de conciliação bancária',
    createdAt: new Date('2025-08-28T16:45:00'),
    updatedAt: new Date('2025-08-31T11:30:00'),
    submittedBy: '2',
    submitterInfo: {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos.santos@planejamento.com',
      phone: '(11) 98888-5678',
      department: 'Planejamento Financeiro',
      company: 'Planejamento Financeiro'
    },
    jaSustentada: true,
    celulaCode: '411',
    robotSelecionado: 'Master_A_Vista',
    tecnologiaAutomacao: 'Blue Prism'
  },
  {
    id: '4',
    serviceType: 'sustentacao',
    issueType: 'Erro Crítico',
    description: 'Falha crítica no robô de pagamentos - interrupção total do processo',
    createdAt: new Date('2025-09-02T08:00:00'),
    updatedAt: new Date('2025-09-02T08:00:00'),
    submittedBy: '2',
    submitterInfo: {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos.santos@planejamento.com',
      phone: '(11) 98888-5678',
      department: 'Planejamento Financeiro',
      company: 'Planejamento Financeiro'
    },
    celulaCode: '411',
    robotSelecionado: 'Caixa_Contestacao_Performer',
    tecnologiaAutomacao: 'UiPath',
    empresa: 'Planejamento Financeiro'
  },
  {
    id: '5',
    serviceType: 'melhoria',
    issueType: 'Documentação',
    description: 'Atualizar documentação técnica dos robôs de RH',
    createdAt: new Date('2025-08-25T13:20:00'),
    updatedAt: new Date('2025-08-29T15:45:00'),
    submittedBy: '3',
    submitterInfo: {
      id: '3',
      name: 'Ana Costa',
      email: 'ana.costa@bookadm.com',
      phone: '(11) 97777-9012',
      department: 'Book Administrativo',
      company: 'Book Administrativo'
    },
    jaSustentada: false,
    celulaCode: '128',
    robotSelecionado: 'BookAdministrativo_Holerite',
    tecnologiaAutomacao: 'Power Automate'
  },
  {
    id: '6',
    serviceType: 'novo-projeto',
    issueType: 'Estudo de Viabilidade',
    description: 'Avaliar viabilidade de automação para processo de gestão de estoque',
    createdAt: new Date('2025-09-02T14:20:00'),
    updatedAt: new Date('2025-09-02T14:20:00'),
    submittedBy: '8',
    submitterInfo: {
      id: '8',
      name: 'Ricardo Santos',
      email: 'ricardo.santos@operacoes.com',
      phone: '(11) 92222-9876',
      department: 'Operações',
      company: 'Operações e Logística'
    },
    roi: 'ROI estimado em 300% em 12 meses',
    areaNegocio: 'Operações e logística',
    nomeProcesso: 'Controle de Estoque',
    regrasDefinidas: 'ramificacoes'
  },
  {
    id: '7',
    serviceType: 'sustentacao',
    issueType: 'Manutenção Preventiva',
    description: 'Atualização de segurança dos robôs da célula 621',
    createdAt: new Date('2025-08-29T11:10:00'),
    updatedAt: new Date('2025-09-01T16:30:00'),
    submittedBy: '4',
    submitterInfo: {
      id: '4',
      name: 'Bruno Oliveira',
      email: 'bruno.oliveira@vale.com',
      phone: '(11) 96666-3456',
      department: 'Vale N1',
      company: 'Vale'
    },
    celulaCode: '621',
    robotSelecionado: 'Gerenciador de Incidentes',
    tecnologiaAutomacao: 'Python',
    empresa: 'Vale'
  },
  {
    id: '8',
    serviceType: 'melhoria',
    issueType: 'Interface',
    description: 'Melhorar interface de monitoramento dos robôs OLÉ',
    createdAt: new Date('2025-08-27T09:45:00'),
    updatedAt: new Date('2025-08-30T17:20:00'),
    submittedBy: '5',
    submitterInfo: {
      id: '5',
      name: 'Lúcia Ferreira',
      email: 'lucia.ferreira@ole.com',
      phone: '(11) 95555-7890',
      department: 'OLÉ',
      company: 'OLÉ'
    },
    jaSustentada: true,
    celulaCode: '504',
    robotSelecionado: 'Deteccao_Perfil_Cliente',
    tecnologiaAutomacao: 'JavaScript'
  }
];

