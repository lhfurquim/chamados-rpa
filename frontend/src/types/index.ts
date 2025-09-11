export type ServiceType = 'MELHORIA' | 'SUSTENTACAO' | 'NOVO_PROJETO';
export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isAdmin: boolean;
}

export interface TicketSubmitter {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  company: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Call {
  id: string;
  serviceType: ServiceType;
  issueType: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  submittedBy: string;
  submitterInfo: TicketSubmitter;
  roi?: string;
  cliente?: string;
  servico?: string;
  areaNegocio?: string;
  nomeProcesso?: string;
  regrasDefinidas?: string;
  processoRepetitivo?: string;
  dadosEstruturados?: string;
  ocorrenciaSustentacao?: string;
  celula?: string;
  robotSelecionado?: string;
  jaSustentada?: boolean;
  idCliente?: string;
  nomeCliente?: string;
  idServico?: string;
  nomeServico?: string;
  empresa?: string;
  temDocumentacao?: boolean;
  documentacaoFiles?: string[];
  tecnologiaAutomacao?: string;
  usuarioAutomacao?: string;
  servidorAutomacao?: string;
  evidenciasFiles?: string[];
  frequenciaExecucao?: string;
  sazonalidade?: string;
  volumetria?: string;
  duracaoCadaCaso?: string;
  quantasPessoasTrabalham?: number;
  fonteDadosEntrada?: string;
  usaMFA?: string;
  existeCaptcha?: string;
  existeCertificadoDigital?: string;
  possivelUsarAPI?: string;
  possibilidadeUsuarioRobotico?: string;
  limitacaoAcessoLogin?: string;
  acessoAplicacoes?: string;
  rdpOpcaoPositiva?: string;
  necessitaVPN?: string;
  analiseHumanaEtapa?: string;
  restricaoTecnologiaSistema?: string;
}

// Form submission data - only fields needed for API
export interface FormSubmissionData {
  serviceType: ServiceType;
  description: string;
  submittedBy?: string;
  roi?: string;
  cliente?: string;
  servico?: string;
  areaNegocio?: string;
  nomeProcesso?: string;
  regrasDefinidas?: string;
  processoRepetitivo?: string;
  dadosEstruturados?: string;
  ocorrenciaSustentacao?: string;
  celula?: string;
  robotSelecionado?: string;
  jaSustentada?: boolean;
  idCliente?: string;
  nomeCliente?: string;
  idServico?: string;
  nomeServico?: string;
  empresa?: string;
  temDocumentacao?: boolean;
  tecnologiaAutomacao?: string;
  usuarioAutomacao?: string;
  servidorAutomacao?: string;
  documentacaoFiles?: File[];
  evidenciasFiles?: File[];
  frequenciaExecucao?: string;
  sazonalidade?: string;
  volumetria?: string;
  duracaoCadaCaso?: string;
  quantasPessoasTrabalham?: number;
  fonteDadosEntrada?: string;
  usaMFA?: string;
  existeCaptcha?: string;
  existeCertificadoDigital?: string;
  possivelUsarAPI?: string;
  possibilidadeUsuarioRobotico?: string;
  limitacaoAcessoLogin?: string;
  acessoAplicacoes?: string;
  rdpOpcaoPositiva?: string;
  necessitaVPN?: string;
  analiseHumanaEtapa?: string;
  restricaoTecnologiaSistema?: string;
}

export interface CreateCallData extends FormSubmissionData {}

export interface CallStats {
  total: number;
  serviceTypeStats: {
    melhoria: number;
    sustentacao: number;
    novoProjeto: number;
  };
  byCelula: Record<string, number>;
  byDepartment: Record<string, number>;
  byTechnology: Record<string, number>;
  activeUsers: number;
  avgResponseTime: number;
  recentActivity: {
    thisWeek: number;
    lastWeek: number;
    percentChange: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RequestSubmission {
  id: string;
  serviceType: ServiceType;
  issueType: string;
  submittedAt: Date;
  celula?: string;
  technology?: string;
  description: string;
}

export interface FormRespondent {
  id: string;
  email: string;
  name: string;
  phone?: string;
  department: string;
  role: string; // Job title/position
  company: string;
  requestsSubmitted: number;
  lastActivity: Date;
  joinedAt: Date;
  preferredServiceType: ServiceType;
  submissionHistory: RequestSubmission[];
  isActive: boolean;
  userRole?: UserRole; // System role (admin/user)
  isAdmin?: boolean; // Computed field for admin status
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  topDepartments: DepartmentStat[];
  userGrowth: UserGrowthData[];
}

export interface DepartmentStat {
  department: string;
  userCount: number;
  requestCount: number;
}

export interface UserGrowthData {
  month: string;
  newUsers: number;
  totalUsers: number;
}


export interface SubmissionResponse {
  id: string;
  protocol: string;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string[];
}

export interface FormValidationError {
  field: string;
  message: string;
}

export interface UserTicketMetrics {
  userId: string;
  userName: string;
  department: string;
  totalTickets: number;
  ticketsByServiceType: Record<string, number>;
  lastSubmission: Date;
  avgResponseTime: number;
}

export interface DashboardData {
  callStats: CallStats;
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  topDepartments: DepartmentStat[];
  departmentStats: Record<string, number>;
  technologyStats: Record<string, number>;
  topUsersByTickets: UserTicketMetrics[];
  recentCalls: Call[];
}

export type ExecutionType = 'ATTENDED' | 'UNATTENDED';
export type ClientType = 'NECXT' | 'STEFANINI'; 
export type RobotStatus = 'ACTIVE' | 'INACTIVE';

export interface Robot {
  id?: number;
  name: string;
  cell: string;
  technology: string;
  executionType: ExecutionType;
  client: ClientType;
  status: RobotStatus;
}

export interface CreateRobotRequest {
  name: string;
  cell: string;
  technology: string;
  executionType: ExecutionType;
  client: ClientType;
  status: RobotStatus;
}

export interface UpdateRobotRequest {
  id: number;
  name?: string;
  cell?: string;
  technology?: string;
  executionType?: ExecutionType;
  client?: ClientType;
  status?: RobotStatus;
}

export interface RobotFilters {
  search?: string;
  cell?: string;
  client?: ClientType;
  executionType?: ExecutionType;
  status?: RobotStatus;
  technology?: string;
}

export interface DpCell {
  ID_CELULA: number;
  NOME_CELULA?: string;
  DESCRICAO?: string;
}

export interface DpClient {
  ID_CLIENTE: number;
  ID_CELULA: number;
  NOME_CLIENT?: string;
}

export interface DpService {
  ID_SERVICO: number;
  ID_CELULA: number;
  ID_CLIENTE: number;
  NOME_SERVICE?: string;
}

export interface TimelineStats {
  period: string;
  startDate: string;
  endDate: string;
  totalRequests: number;
  byServiceType: Record<string, number>;
}