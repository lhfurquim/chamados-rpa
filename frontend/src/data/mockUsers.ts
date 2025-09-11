import { type FormRespondent } from '../types';

export const mockUsers: FormRespondent[] = [
  {
    id: '1',
    email: 'maria.silva@tesouraria.com',
    name: 'Maria Silva',
    phone: '(11) 99999-1234',
    department: 'Tesouraria',
    role: 'Analista Financeiro',
    company: 'Tesouraria Corporativa',
    requestsSubmitted: 3,
    lastActivity: new Date('2025-09-02T08:00:00'),
    joinedAt: new Date('2025-06-15T10:00:00'),
    preferredServiceType: 'sustentacao',
    avgRequestPriority: 'high',
    isActive: true,
    submissionHistory: [
      {
        id: '1',
        serviceType: 'sustentacao',
        issueType: 'Erro de Robô',
        submittedAt: new Date('2025-09-01T10:30:00'),
        status: 'open',
        priority: 'high',
        celula: '099 - Tesouraria',
        technology: 'UiPath',
        description: 'Robô de extração de faturas travando durante execução mensal'
      },
      {
        id: '15',
        serviceType: 'sustentacao',
        issueType: 'Manutenção Preventiva',
        submittedAt: new Date('2025-08-20T14:15:00'),
        status: 'resolved',
        priority: 'medium',
        celula: '099 - Tesouraria',
        technology: 'UiPath',
        description: 'Atualização de credenciais do robô de anexação de faturamento'
      },
      {
        id: '28',
        serviceType: 'melhoria',
        issueType: 'Otimização',
        submittedAt: new Date('2025-07-10T09:45:00'),
        status: 'closed',
        priority: 'low',
        celula: '099 - Tesouraria',
        technology: 'UiPath',
        description: 'Melhorar tempo de resposta do robô de validação de faturas'
      }
    ]
  },
  {
    id: '2',
    email: 'carlos.santos@planejamento.com',
    name: 'Carlos Santos',
    phone: '(11) 98888-5678',
    department: 'Planejamento Financeiro',
    role: 'Coordenador de Caixa',
    company: 'Planejamento Financeiro',
    requestsSubmitted: 5,
    lastActivity: new Date('2025-09-02T08:00:00'),
    joinedAt: new Date('2025-03-20T14:30:00'),
    preferredServiceType: 'novo-projeto',
    avgRequestPriority: 'medium',
    isActive: true,
    submissionHistory: [
      {
        id: '4',
        serviceType: 'sustentacao',
        issueType: 'Erro Crítico',
        submittedAt: new Date('2025-09-02T08:00:00'),
        status: 'open',
        priority: 'critical',
        celula: '411 - Planejamento/Caixa',
        technology: 'UiPath',
        description: 'Falha crítica no robô de pagamentos - interrupção total do processo'
      },
      {
        id: '3',
        serviceType: 'melhoria',
        issueType: 'Otimização',
        submittedAt: new Date('2025-08-28T16:45:00'),
        status: 'resolved',
        priority: 'low',
        celula: '411 - Planejamento/Caixa',
        technology: 'Blue Prism',
        description: 'Melhorar performance do robô de conciliação bancária'
      },
      {
        id: '16',
        serviceType: 'novo-projeto',
        issueType: 'Automação Nova',
        submittedAt: new Date('2025-08-15T11:20:00'),
        status: 'in-progress',
        priority: 'high',
        description: 'Automação para reconciliação automática de extratos bancários'
      },
      {
        id: '22',
        serviceType: 'novo-projeto',
        issueType: 'Estudo de Viabilidade',
        submittedAt: new Date('2025-07-25T16:30:00'),
        status: 'resolved',
        priority: 'medium',
        description: 'Análise de viabilidade para automação de fluxo de aprovações'
      },
      {
        id: '29',
        serviceType: 'melhoria',
        issueType: 'Interface',
        submittedAt: new Date('2025-06-18T10:15:00'),
        status: 'closed',
        priority: 'low',
        celula: '411 - Planejamento/Caixa',
        technology: 'Blue Prism',
        description: 'Melhorar relatórios do robô Master_A_Vista'
      }
    ]
  },
  {
    id: '3',
    email: 'ana.costa@bookadm.com',
    name: 'Ana Costa',
    phone: '(11) 97777-9012',
    department: 'Book Administrativo',
    role: 'Especialista em RH',
    company: 'Book Administrativo',
    requestsSubmitted: 2,
    lastActivity: new Date('2025-08-29T15:45:00'),
    joinedAt: new Date('2025-04-10T09:00:00'),
    preferredServiceType: 'melhoria',
    avgRequestPriority: 'medium',
    isActive: true,
    submissionHistory: [
      {
        id: '5',
        serviceType: 'melhoria',
        issueType: 'Documentação',
        submittedAt: new Date('2025-08-25T13:20:00'),
        status: 'closed',
        priority: 'medium',
        celula: '128 - Book Administrativo',
        technology: 'Power Automate',
        description: 'Atualizar documentação técnica dos robôs de RH'
      },
      {
        id: '23',
        serviceType: 'sustentacao',
        issueType: 'Configuração',
        submittedAt: new Date('2025-07-30T14:45:00'),
        status: 'resolved',
        priority: 'medium',
        celula: '128 - Book Administrativo',
        technology: 'Power Automate',
        description: 'Configurar novo ambiente para robô de folha de pagamento'
      }
    ]
  },
  {
    id: '4',
    email: 'bruno.oliveira@vale.com',
    name: 'Bruno Oliveira',
    phone: '(11) 96666-3456',
    department: 'Vale N1',
    role: 'Analista de Sistemas',
    company: 'Vale',
    requestsSubmitted: 4,
    lastActivity: new Date('2025-09-01T16:30:00'),
    joinedAt: new Date('2025-02-28T11:15:00'),
    preferredServiceType: 'sustentacao',
    avgRequestPriority: 'low',
    isActive: true,
    submissionHistory: [
      {
        id: '7',
        serviceType: 'sustentacao',
        issueType: 'Manutenção Preventiva',
        submittedAt: new Date('2025-08-29T11:10:00'),
        status: 'in-progress',
        priority: 'low',
        celula: '621 - Vale N1',
        technology: 'Python',
        description: 'Atualização de segurança dos robôs da célula 621'
      },
      {
        id: '17',
        serviceType: 'melhoria',
        issueType: 'Otimização',
        submittedAt: new Date('2025-08-10T09:30:00'),
        status: 'resolved',
        priority: 'medium',
        celula: '621 - Vale N1',
        technology: 'Python',
        description: 'Otimizar algoritmo do gerenciador de incidentes'
      },
      {
        id: '24',
        serviceType: 'sustentacao',
        issueType: 'Erro de Robô',
        submittedAt: new Date('2025-07-15T15:20:00'),
        status: 'closed',
        priority: 'high',
        celula: '621 - Vale N1',
        technology: 'UiPath',
        description: 'Corrigir erro na criação automática de incidentes'
      },
      {
        id: '30',
        serviceType: 'novo-projeto',
        issueType: 'Estudo de Viabilidade',
        submittedAt: new Date('2025-06-05T13:45:00'),
        status: 'closed',
        priority: 'low',
        description: 'Estudo para automação de relatórios de incidentes'
      }
    ]
  },
  {
    id: '5',
    email: 'lucia.ferreira@ole.com',
    name: 'Lúcia Ferreira',
    phone: '(11) 95555-7890',
    department: 'OLÉ',
    role: 'Gerente de Operações',
    company: 'OLÉ',
    requestsSubmitted: 3,
    lastActivity: new Date('2025-08-30T17:20:00'),
    joinedAt: new Date('2025-01-15T16:00:00'),
    preferredServiceType: 'melhoria',
    avgRequestPriority: 'medium',
    isActive: true,
    submissionHistory: [
      {
        id: '8',
        serviceType: 'melhoria',
        issueType: 'Interface',
        submittedAt: new Date('2025-08-27T09:45:00'),
        status: 'resolved',
        priority: 'medium',
        celula: '504 - OLÉ',
        technology: 'JavaScript',
        description: 'Melhorar interface de monitoramento dos robôs OLÉ'
      },
      {
        id: '18',
        serviceType: 'novo-projeto',
        issueType: 'Automação Nova',
        submittedAt: new Date('2025-07-20T12:10:00'),
        status: 'in-progress',
        priority: 'high',
        description: 'Criar robô para detecção automática de perfil de cliente'
      },
      {
        id: '25',
        serviceType: 'sustentacao',
        issueType: 'Configuração',
        submittedAt: new Date('2025-06-22T08:30:00'),
        status: 'closed',
        priority: 'low',
        celula: '504 - OLÉ',
        technology: 'JavaScript',
        description: 'Configurar ambiente de desenvolvimento para novos robôs'
      }
    ]
  },
  {
    id: '6',
    email: 'pedro.lima@gestao.com',
    name: 'Pedro Lima',
    phone: '(11) 94444-2468',
    department: 'Gestão de Acesso',
    role: 'Administrador de Sistemas',
    company: 'Gestão de Acesso',
    requestsSubmitted: 2,
    lastActivity: new Date('2025-08-22T10:15:00'),
    joinedAt: new Date('2025-05-08T14:20:00'),
    preferredServiceType: 'novo-projeto',
    avgRequestPriority: 'high',
    isActive: true,
    submissionHistory: [
      {
        id: '19',
        serviceType: 'novo-projeto',
        issueType: 'Automação Nova',
        submittedAt: new Date('2025-08-22T10:15:00'),
        status: 'open',
        priority: 'high',
        description: 'Automação para provisioning automático de acessos'
      },
      {
        id: '26',
        serviceType: 'sustentacao',
        issueType: 'Manutenção Preventiva',
        submittedAt: new Date('2025-07-12T11:40:00'),
        status: 'resolved',
        priority: 'medium',
        celula: '230 - Gestão de Acesso',
        technology: 'PowerShell',
        description: 'Atualização trimestral dos robôs de acesso'
      }
    ]
  },
  {
    id: '7',
    email: 'fernanda.rocha@femsa.com',
    name: 'Fernanda Rocha',
    phone: '(11) 93333-1357',
    department: 'Femsa',
    role: 'Analista de Processos',
    company: 'Femsa',
    requestsSubmitted: 1,
    lastActivity: new Date('2025-08-05T16:50:00'),
    joinedAt: new Date('2025-07-30T13:25:00'),
    preferredServiceType: 'novo-projeto',
    avgRequestPriority: 'medium',
    isActive: false,
    submissionHistory: [
      {
        id: '20',
        serviceType: 'novo-projeto',
        issueType: 'Estudo de Viabilidade',
        submittedAt: new Date('2025-08-05T16:50:00'),
        status: 'resolved',
        priority: 'medium',
        description: 'Análise para automação de processo de vendas'
      }
    ]
  },
  {
    id: '8',
    email: 'ricardo.santos@operacoes.com',
    name: 'Ricardo Santos',
    phone: '(11) 92222-9876',
    department: 'Operações',
    role: 'Supervisor Logístico',
    company: 'Operações e Logística',
    requestsSubmitted: 2,
    lastActivity: new Date('2025-09-02T14:20:00'),
    joinedAt: new Date('2025-08-01T10:30:00'),
    preferredServiceType: 'novo-projeto',
    avgRequestPriority: 'high',
    isActive: true,
    submissionHistory: [
      {
        id: '6',
        serviceType: 'novo-projeto',
        issueType: 'Estudo de Viabilidade',
        submittedAt: new Date('2025-09-02T14:20:00'),
        status: 'open',
        priority: 'high',
        description: 'Avaliar viabilidade de automação para processo de gestão de estoque'
      },
      {
        id: '21',
        serviceType: 'novo-projeto',
        issueType: 'Automação Nova',
        submittedAt: new Date('2025-08-18T15:35:00'),
        status: 'in-progress',
        priority: 'medium',
        description: 'Criar automação para controle de inventário'
      }
    ]
  },
  {
    id: '9',
    email: 'juliana.alves@rpa.com',
    name: 'Juliana Alves',
    phone: '(11) 91111-5432',
    department: 'RPA',
    role: 'Desenvolvedor RPA',
    company: 'Torre RPA',
    requestsSubmitted: 1,
    lastActivity: new Date('2025-08-30T14:15:00'),
    joinedAt: new Date('2025-08-15T09:45:00'),
    preferredServiceType: 'novo-projeto',
    avgRequestPriority: 'medium',
    isActive: true,
    submissionHistory: [
      {
        id: '2',
        serviceType: 'novo-projeto',
        issueType: 'Automação Nova',
        submittedAt: new Date('2025-08-30T14:15:00'),
        status: 'in-progress',
        priority: 'medium',
        description: 'Criar novo robô para automação de processamento de notas fiscais'
      }
    ]
  },
  {
    id: '10',
    email: 'marcos.pereira@financeiro.com',
    name: 'Marcos Pereira',
    phone: '(11) 90000-1111',
    department: 'Financeiro',
    role: 'Analista Sênior',
    company: 'Gestão Financeira',
    requestsSubmitted: 1,
    lastActivity: new Date('2025-07-28T11:20:00'),
    joinedAt: new Date('2025-07-15T14:50:00'),
    preferredServiceType: 'sustentacao',
    avgRequestPriority: 'low',
    isActive: false,
    submissionHistory: [
      {
        id: '27',
        serviceType: 'sustentacao',
        issueType: 'Configuração',
        submittedAt: new Date('2025-07-28T11:20:00'),
        status: 'closed',
        priority: 'low',
        technology: 'Excel VBA',
        description: 'Configurar robô para relatórios financeiros mensais'
      }
    ]
  }
];

export const userStats = {
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter(u => u.isActive).length,
  newUsersThisMonth: mockUsers.filter(u => 
    u.joinedAt.getMonth() === 8 && u.joinedAt.getFullYear() === 2025
  ).length,
  topDepartments: [
    { department: 'Tesouraria', userCount: 1, requestCount: 3 },
    { department: 'Planejamento Financeiro', userCount: 1, requestCount: 5 },
    { department: 'Vale N1', userCount: 1, requestCount: 4 },
    { department: 'OLÉ', userCount: 1, requestCount: 3 },
    { department: 'Book Administrativo', userCount: 1, requestCount: 2 }
  ],
  userGrowth: [
    { month: 'Jan 2025', newUsers: 1, totalUsers: 1 },
    { month: 'Fev 2025', newUsers: 1, totalUsers: 2 },
    { month: 'Mar 2025', newUsers: 1, totalUsers: 3 },
    { month: 'Abr 2025', newUsers: 1, totalUsers: 4 },
    { month: 'Mai 2025', newUsers: 1, totalUsers: 5 },
    { month: 'Jun 2025', newUsers: 1, totalUsers: 6 },
    { month: 'Jul 2025', newUsers: 1, totalUsers: 7 },
    { month: 'Ago 2025', newUsers: 3, totalUsers: 10 }
  ]
};