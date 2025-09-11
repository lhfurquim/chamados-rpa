import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { getCallById, updateCall } from '../services/callsApi';
import { getRobotsByCell } from '../services/robotsApi';
import { type Call, type Robot } from '../types';
import { useToast } from '../hooks/use-toast';
import { Loader2, AlertCircle, Save, X } from 'lucide-react';

interface CallEditModalProps {
  callId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCall: Call) => void;
}

const CELULA_OPTIONS = [
  { value: '062', label: '062 - DWS' },
  { value: '097', label: '097 - Contábil' },
  { value: '99', label: '099 - Tesouraria' },
  { value: '107', label: '107 - Tributário' },
  { value: '128', label: '128 - Book Administrativo' },
  { value: '230', label: '230 - Gestão de Acesso' },
  { value: '367', label: '367 - Pós-Vendas' },
  { value: '411', label: '411 - Planejamento/Caixa' },
  { value: '418', label: '418 - Pricing' },
  { value: '504', label: '504 - OLÉ' },
  { value: '517', label: '517 - Recursos Humanos' },
  { value: '526', label: '526 - Femsa' },
  { value: '621', label: '621 - Vale N1' },
  { value: '1154', label: '1154 - Jurídico' },
  { value: 'outra', label: 'Outra' }
];

const TECHNOLOGY_OPTIONS = [
  'UiPath', 
  'Automation Anywhere', 
  'Power Automate', 
  'Blue Prism',
  'Python',
  'Outra'
];


export default function CallEditModal({ callId, isOpen, onClose, onSuccess }: CallEditModalProps) {
  const [call, setCall] = useState<Call | null>(null);
  const [formData, setFormData] = useState<Partial<Call>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotsLoading, setRobotsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && callId) {
      loadCall();
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, callId]);

  const resetForm = () => {
    setCall(null);
    setFormData({});
    setError(null);
    setErrors({});
    setRobots([]);
    setRobotsLoading(false);
  };

  const loadRobots = async (cellId: string) => {
    if (!cellId || cellId === 'outra') {
      setRobots([]);
      return;
    }

    try {
      setRobotsLoading(true);
      const robotsData = await getRobotsByCell(cellId);
      setRobots(robotsData);
    } catch (err) {
      console.error('Error loading robots:', err);
      setRobots([]);
    } finally {
      setRobotsLoading(false);
    }
  };

  const loadCall = async () => {
    if (!callId) return;
    
    try {
      setLoading(true);
      setError(null);
      const callData = await getCallById(callId);
      setCall(callData);
      const newFormData = {
        serviceType: callData.serviceType,
        description: callData.description,
        issueType: callData.issueType,
        celula: callData.celula,
        robotSelecionado: callData.robotSelecionado,
        tecnologiaAutomacao: callData.tecnologiaAutomacao,
        empresa: callData.empresa,
        roi: callData.roi,
        usuarioAutomacao: callData.usuarioAutomacao,
        servidorAutomacao: callData.servidorAutomacao,
        nomeCliente: callData.nomeCliente,
        nomeServico: callData.nomeServico
      };
      setFormData(newFormData);

      if (newFormData.celula) {
        await loadRobots(newFormData.celula);
      }
    } catch (err) {
      console.error('Error loading call:', err);
      setError('Erro ao carregar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.issueType?.trim()) {
      newErrors.issueType = 'Categoria é obrigatória';
    }

    if (!formData.serviceType) {
      newErrors.serviceType = 'Tipo de serviço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    let processedValue: any = value;
    
    if (field === 'jaSustentada' || field === 'temDocumentacao') {
      if (value === 'true') {
        processedValue = true;
      } else if (value === 'false') {
        processedValue = false;
      } else {
        processedValue = undefined;
      }
    } 
    // Handle numeric fields
    else if (field === 'quantasPessoasTrabalham') {
      processedValue = value ? parseInt(value, 10) : undefined;
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCelulaChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      celula: value,
      robotSelecionado: '' // Reset robot when celula changes
    }));
    loadRobots(value);
  };

  const handleSave = async () => {
    if (!validateForm() || !callId) return;

    try {
      setSaving(true);
      setError(null);
      
      const updatedCall = await updateCall(callId, formData);
      onSuccess(updatedCall);
      toast({
        title: "Solicitação atualizada!",
        description: `Solicitação #${updatedCall.id} foi atualizada com sucesso.`,
      });
      onClose();
    } catch (err: any) {
      console.error('Error updating call:', err);
      const errorMessage = err?.response?.data?.message || 'Erro ao atualizar solicitação. Tente novamente.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const availableRobots = robots;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Editar Solicitação {call && `#${call.id}`}
          </DialogTitle>
          <DialogDescription>
            Edite as informações da solicitação RPA
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando solicitação...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadCall} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : call ? (
            <div className="space-y-6 pr-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Tipo de Serviço *</Label>
                <Select 
                  value={formData.serviceType || ''} 
                  onValueChange={(value) => handleInputChange('serviceType', value)}
                >
                  <SelectTrigger className={errors.serviceType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOVO_PROJETO">Novo Projeto</SelectItem>
                    <SelectItem value="MELHORIA">Melhoria</SelectItem>
                    <SelectItem value="SUSTENTACAO">Sustentação aaa</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceType && (
                  <p className="text-sm text-red-600">{errors.serviceType}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva detalhadamente sua solicitação"
                  className={errors.description ? 'border-red-500' : ''}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Célula */}
              <div className="space-y-2">
                <Label htmlFor="celula">Célula</Label>
                <Select 
                  value={formData.celula || ''} 
                  onValueChange={handleCelulaChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a célula" />
                  </SelectTrigger>
                  <SelectContent>
                    {CELULA_OPTIONS.map((celula) => (
                      <SelectItem key={celula.value} value={celula.value}>
                        {celula.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Robot Selection */}
              {(availableRobots.length > 0 || robotsLoading) && (
                <div className="space-y-2">
                  <Label htmlFor="robotSelecionado">Robô Selecionado</Label>
                  <Select 
                    value={formData.robotSelecionado || ''} 
                    onValueChange={(value) => handleInputChange('robotSelecionado', value)}
                    disabled={robotsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={robotsLoading ? "Carregando robôs..." : "Selecione o robô"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRobots.map((robot) => (
                        <SelectItem key={robot.name} value={robot.name}>
                          {robot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Technology */}
              <div className="space-y-2">
                <Label htmlFor="tecnologiaAutomacao">Tecnologia da Automação</Label>
                <Select 
                  value={formData.tecnologiaAutomacao || ''} 
                  onValueChange={(value) => handleInputChange('tecnologiaAutomacao', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a tecnologia" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNOLOGY_OPTIONS.map((tech) => (
                      <SelectItem key={tech} value={tech}>
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={formData.empresa || ''}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>

              {/* Nome Cliente - only for MELHORIA and SUSTENTACAO */}
              {(formData.serviceType === 'MELHORIA' || formData.serviceType === 'SUSTENTACAO') && (
                <div className="space-y-2">
                  <Label htmlFor="nomeCliente">Nome do Cliente</Label>
                  <Input
                    id="nomeCliente"
                    value={formData.nomeCliente || ''}
                    onChange={(e) => handleInputChange('nomeCliente', e.target.value)}
                    placeholder="Digite o nome do cliente"
                  />
                </div>
              )}

              {/* Nome Serviço - only for MELHORIA and SUSTENTACAO */}
              {(formData.serviceType === 'MELHORIA' || formData.serviceType === 'SUSTENTACAO') && (
                <div className="space-y-2">
                  <Label htmlFor="nomeServico">Nome do Serviço</Label>
                  <Input
                    id="nomeServico"
                    value={formData.nomeServico || ''}
                    onChange={(e) => handleInputChange('nomeServico', e.target.value)}
                    placeholder="Digite o nome do serviço"
                  />
                </div>
              )}

              {/* Novo Projeto Section */}
              {formData.serviceType === 'NOVO_PROJETO' && (
                <div className="space-y-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Informações do Novo Projeto</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roi">ROI (Retorno sobre Investimento)</Label>
                    <Textarea
                      id="roi"
                      value={formData.roi || ''}
                      onChange={(e) => handleInputChange('roi', e.target.value)}
                      placeholder="Descreva o ROI esperado"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="areaNegocio">Área de Negócio</Label>
                      <Input
                        id="areaNegocio"
                        value={formData.areaNegocio || ''}
                        onChange={(e) => handleInputChange('areaNegocio', e.target.value)}
                        placeholder="Área de negócio"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nomeProcesso">Nome do Processo</Label>
                      <Input
                        id="nomeProcesso"
                        value={formData.nomeProcesso || ''}
                        onChange={(e) => handleInputChange('nomeProcesso', e.target.value)}
                        placeholder="Nome do processo"
                      />
                    </div>
                  </div>

                  {/* New 17 fields for Novo Projeto */}
                  <div className="space-y-2">
                    <Label htmlFor="frequenciaExecucao">Frequência de execução do processo</Label>
                    <Select 
                      value={formData.frequenciaExecucao || ''} 
                      onValueChange={(value) => handleInputChange('frequenciaExecucao', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="de-hora-em-hora">De hora em hora</SelectItem>
                        <SelectItem value="diaria">Diária</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="duas-vezes-semana">Duas vezes por semana</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sazonalidade</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sazonalidade"
                          value="rara-previsivel"
                          checked={formData.sazonalidade === 'rara-previsivel'}
                          onChange={() => handleInputChange('sazonalidade', 'rara-previsivel')}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Rara mas previsível (Natal, Páscoa, último domingo)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sazonalidade"
                          value="rara-imprevisivel"
                          checked={formData.sazonalidade === 'rara-imprevisivel'}
                          onChange={() => handleInputChange('sazonalidade', 'rara-imprevisivel')}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Rara e imprevisível</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sazonalidade"
                          value="nao-existe"
                          checked={formData.sazonalidade === 'nao-existe'}
                          onChange={() => handleInputChange('sazonalidade', 'nao-existe')}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Não existe sazonalidade</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volumetria">Volumetria</Label>
                    <Textarea
                      id="volumetria"
                      value={formData.volumetria || ''}
                      onChange={(e) => handleInputChange('volumetria', e.target.value)}
                      placeholder="Ex: 1000 chamados por dia, 200 linhas por hora..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duracaoCadaCaso">Duração de cada caso</Label>
                      <Input
                        id="duracaoCadaCaso"
                        value={formData.duracaoCadaCaso || ''}
                        onChange={(e) => handleInputChange('duracaoCadaCaso', e.target.value)}
                        placeholder="Ex: 5 minutos para cada chamado"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantasPessoasTrabalham">Quantas pessoas trabalham no processo</Label>
                      <Input
                        id="quantasPessoasTrabalham"
                        type="number"
                        min="0"
                        value={formData.quantasPessoasTrabalham || ''}
                        onChange={(e) => handleInputChange('quantasPessoasTrabalham', e.target.value)}
                        placeholder="Número de pessoas"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Qual fonte de dados de entrada?</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="fonteDadosEntrada"
                          value="estruturado"
                          checked={formData.fonteDadosEntrada === 'estruturado'}
                          onChange={() => handleInputChange('fonteDadosEntrada', 'estruturado')}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Estruturado - Dados fixos e padronizados</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="fonteDadosEntrada"
                          value="nao-estruturado"
                          checked={formData.fonteDadosEntrada === 'nao-estruturado'}
                          onChange={() => handleInputChange('fonteDadosEntrada', 'nao-estruturado')}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Não estruturados - Campo de textos livres</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="fonteDadosEntrada"
                          value="mista"
                          checked={formData.fonteDadosEntrada === 'mista'}
                          onChange={() => handleInputChange('fonteDadosEntrada', 'mista')}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Mista</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usaMFA">Usa MFA - duplo fator de autenticação? Caso positivo, descreva:</Label>
                    <Textarea
                      id="usaMFA"
                      value={formData.usaMFA || ''}
                      onChange={(e) => handleInputChange('usaMFA', e.target.value)}
                      placeholder="Descreva se usa MFA e como funciona..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="existeCaptcha">Existe algum captcha no processo?</Label>
                    <Textarea
                      id="existeCaptcha"
                      value={formData.existeCaptcha || ''}
                      onChange={(e) => handleInputChange('existeCaptcha', e.target.value)}
                      placeholder="Descreva se existe captcha..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="existeCertificadoDigital">Existe algum certificado digital? Caso positivo descreva:</Label>
                    <Textarea
                      id="existeCertificadoDigital"
                      value={formData.existeCertificadoDigital || ''}
                      onChange={(e) => handleInputChange('existeCertificadoDigital', e.target.value)}
                      placeholder="Descreva se existe certificado digital..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="possivelUsarAPI">É possível utilizar API ou Consulta no banco de dados?</Label>
                    <Textarea
                      id="possivelUsarAPI"
                      value={formData.possivelUsarAPI || ''}
                      onChange={(e) => handleInputChange('possivelUsarAPI', e.target.value)}
                      placeholder="Descreva as possibilidades de API ou consulta ao banco..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="possibilidadeUsuarioRobotico">Há a possibilidade da criação de um usuário robótico para acesso às aplicações?</Label>
                    <Textarea
                      id="possibilidadeUsuarioRobotico"
                      value={formData.possibilidadeUsuarioRobotico || ''}
                      onChange={(e) => handleInputChange('possibilidadeUsuarioRobotico', e.target.value)}
                      placeholder="Descreva as possibilidades de criação de usuário robótico..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limitacaoAcessoLogin">Existe alguma limitação de acesso para o login de usuário?</Label>
                    <Textarea
                      id="limitacaoAcessoLogin"
                      value={formData.limitacaoAcessoLogin || ''}
                      onChange={(e) => handleInputChange('limitacaoAcessoLogin', e.target.value)}
                      placeholder="Descreva as limitações de acesso..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acessoAplicacoes">Como é feito o acesso às aplicações (VDI/VM/Servidor)?</Label>
                    <Textarea
                      id="acessoAplicacoes"
                      value={formData.acessoAplicacoes || ''}
                      onChange={(e) => handleInputChange('acessoAplicacoes', e.target.value)}
                      placeholder="Descreva como é feito o acesso às aplicações..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rdpOpcaoPositiva">Qual é o Remote Desktop Protocol (RDP=APP) para acesso remoto as VDI ou VM?</Label>
                    <Textarea
                      id="rdpOpcaoPositiva"
                      value={formData.rdpOpcaoPositiva || ''}
                      onChange={(e) => handleInputChange('rdpOpcaoPositiva', e.target.value)}
                      placeholder="Descreva o protocolo RDP utilizado..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="necessitaVPN">Necessita VPN? Caso positivo descreva:</Label>
                    <Textarea
                      id="necessitaVPN"
                      value={formData.necessitaVPN || ''}
                      onChange={(e) => handleInputChange('necessitaVPN', e.target.value)}
                      placeholder="Descreva se necessita VPN e como funciona..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="analiseHumanaEtapa">Existe análise humana em alguma etapa do processo?</Label>
                    <Textarea
                      id="analiseHumanaEtapa"
                      value={formData.analiseHumanaEtapa || ''}
                      onChange={(e) => handleInputChange('analiseHumanaEtapa', e.target.value)}
                      placeholder="Descreva se existe análise humana..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restricaoTecnologiaSistema">Existe alguma restrição de Tecnologia / Sistema?</Label>
                    <Textarea
                      id="restricaoTecnologiaSistema"
                      value={formData.restricaoTecnologiaSistema || ''}
                      onChange={(e) => handleInputChange('restricaoTecnologiaSistema', e.target.value)}
                      placeholder="Descreva as restrições de tecnologia ou sistema..."
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Sustentação Section */}
              {formData.serviceType === 'SUSTENTACAO' && (
                <div className="space-y-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Informações de Sustentação</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ocorrenciaSustentacao">Descreva a ocorrência da sustentação</Label>
                    <Textarea
                      id="ocorrenciaSustentacao"
                      value={formData.ocorrenciaSustentacao || ''}
                      onChange={(e) => handleInputChange('ocorrenciaSustentacao', e.target.value)}
                      placeholder="Descreva detalhadamente a ocorrência"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Melhoria Section */}
              {formData.serviceType === 'MELHORIA' && (
                <div className="space-y-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">Informações de Melhoria</h3>
                  
                  <div className="space-y-2">
                    <Label>A demanda já é sustentada?</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="jaSustentada"
                          value="true"
                          checked={formData.jaSustentada === true}
                          onChange={() => handleInputChange('jaSustentada', 'true')}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Sim</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="jaSustentada"
                          value="false"
                          checked={formData.jaSustentada === false}
                          onChange={() => handleInputChange('jaSustentada', 'false')}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Não</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="idCliente">ID do Cliente</Label>
                      <Input
                        id="idCliente"
                        value={formData.idCliente || ''}
                        onChange={(e) => handleInputChange('idCliente', e.target.value)}
                        placeholder="ID do cliente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nomeCliente">Nome do Cliente</Label>
                      <Input
                        id="nomeCliente"
                        value={formData.nomeCliente || ''}
                        onChange={(e) => handleInputChange('nomeCliente', e.target.value)}
                        placeholder="Nome do cliente"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="idServico">ID do Serviço</Label>
                      <Input
                        id="idServico"
                        value={formData.idServico || ''}
                        onChange={(e) => handleInputChange('idServico', e.target.value)}
                        placeholder="ID do serviço"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nomeServico">Nome do Serviço</Label>
                      <Input
                        id="nomeServico"
                        value={formData.nomeServico || ''}
                        onChange={(e) => handleInputChange('nomeServico', e.target.value)}
                        placeholder="Nome do serviço"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Common technical fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usuarioAutomacao">Usuário da Automação</Label>
                  <Input
                    id="usuarioAutomacao"
                    value={formData.usuarioAutomacao || ''}
                    onChange={(e) => handleInputChange('usuarioAutomacao', e.target.value)}
                    placeholder="Usuário da automação"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servidorAutomacao">Servidor da Automação</Label>
                  <Input
                    id="servidorAutomacao"
                    value={formData.servidorAutomacao || ''}
                    onChange={(e) => handleInputChange('servidorAutomacao', e.target.value)}
                    placeholder="Servidor da automação"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || !call}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}