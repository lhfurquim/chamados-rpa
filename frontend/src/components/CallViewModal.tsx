import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { getCallById } from '../services/callsApi';
import { type Call } from '../types';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Cpu, 
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface CallViewModalProps {
  callId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CallViewModal({ callId, isOpen, onClose }: CallViewModalProps) {
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && callId) {
      loadCall();
    } else if (!isOpen) {
      setCall(null);
      setError(null);
    }
  }, [isOpen, callId]);

  const loadCall = async () => {
    if (!callId) return;
    
    try {
      setLoading(true);
      setError(null);
      const callData = await getCallById(callId);
      setCall(callData);
    } catch (err) {
      console.error('Error loading call:', err);
      setError('Erro ao carregar detalhes da solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case 'NOVO_PROJETO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MELHORIA': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SUSTENTACAO': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getCelulaLabel = (celulaCode: string) => {
    switch (celulaCode) {
      case '99': return '099 - Tesouraria';
      case '411': return '411 - Planejamento/Caixa';
      case '128': return '128 - Book Administrativo';
      case '621': return '621 - Vale N1';
      case '504': return '504 - OLÉ';
      case '230': return '230 - Gestão de Acesso';
      case '526': return '526 - Femsa';
      default: return celulaCode;
    }
  };

  const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ icon: Icon, label, value }: { 
    icon: React.ComponentType<{ className?: string }>;
    label: string; 
    value: string | null | undefined;
  }) => (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm text-gray-600 min-w-0">{label}:</span>
      <span className="text-sm font-medium text-gray-900 flex-1 truncate">
        {value || 'N/A'}
      </span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Solicitação {call && `#${call.id}`}
          </DialogTitle>
          <DialogDescription>
            Informações completas da solicitação RPA
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando detalhes...</span>
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
            <div className="space-y-6">
              {/* Header with Service Type and ID */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={getServiceTypeColor(call.serviceType)}
                >
                  {getServiceTypeLabel(call.serviceType)}
                </Badge>
                <span className="text-sm text-gray-500">
                  Criado em {formatDate(call.createdAt)}
                </span>
              </div>

              <Separator />

              {/* Submitter Information */}
              <InfoSection title="Solicitante">
                <InfoRow 
                  icon={User} 
                  label="Nome" 
                  value={call.submitterInfo?.name} 
                />
                <InfoRow 
                  icon={Mail} 
                  label="Email" 
                  value={call.submitterInfo?.email} 
                />
                <InfoRow 
                  icon={Phone} 
                  label="Telefone" 
                  value={call.submitterInfo?.phone} 
                />
                <InfoRow 
                  icon={Briefcase} 
                  label="Departamento" 
                  value={call.submitterInfo?.department} 
                />
                <InfoRow 
                  icon={Building2} 
                  label="Empresa" 
                  value={call.submitterInfo?.company} 
                />
              </InfoSection>

              <Separator />

              {/* Technical Information */}
              <InfoSection title="Informações Técnicas">
                {call.celulaCode && (
                  <InfoRow 
                    icon={Building2} 
                    label="Célula" 
                    value={getCelulaLabel(call.celulaCode)} 
                  />
                )}
                <InfoRow 
                  icon={Cpu} 
                  label="Robô Selecionado" 
                  value={call.robotSelecionado} 
                />
                <InfoRow 
                  icon={Cpu} 
                  label="Tecnologia" 
                  value={call.tecnologiaAutomacao} 
                />
                {call.empresa && (
                  <InfoRow 
                    icon={Building2} 
                    label="Empresa do Processo" 
                    value={call.empresa} 
                  />
                )}
              </InfoSection>

              <Separator />

              <InfoSection title="Descrição">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {call.description}
                  </p>
                </div>
              </InfoSection>

              {call.roi && (
                <>
                  <Separator />
                  <InfoSection title="ROI">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {call.roi}
                      </p>
                    </div>
                  </InfoSection>
                </>
              )}

              {call.serviceType === 'NOVO_PROJETO' && (
                call.frequenciaExecucao || call.sazonalidade || call.volumetria || call.duracaoCadaCaso || 
                call.quantasPessoasTrabalham || call.fonteDadosEntrada || call.usaMFA || call.existeCaptcha ||
                call.existeCertificadoDigital || call.possivelUsarAPI || call.possibilidadeUsuarioRobotico ||
                call.limitacaoAcessoLogin || call.acessoAplicacoes || call.rdpOpcaoPositiva || 
                call.necessitaVPN || call.analiseHumanaEtapa || call.restricaoTecnologiaSistema
              ) && (
                <>
                  <Separator />
                  <InfoSection title="Informações Detalhadas do Projeto">
                    {call.frequenciaExecucao && (
                      <InfoRow 
                        icon={Calendar} 
                        label="Frequência de Execução" 
                        value={call.frequenciaExecucao} 
                      />
                    )}
                    {call.sazonalidade && (
                      <InfoRow 
                        icon={Calendar} 
                        label="Sazonalidade" 
                        value={call.sazonalidade} 
                      />
                    )}
                    {call.duracaoCadaCaso && (
                      <InfoRow 
                        icon={Calendar} 
                        label="Duração de Cada Caso" 
                        value={call.duracaoCadaCaso} 
                      />
                    )}
                    {call.quantasPessoasTrabalham && (
                      <InfoRow 
                        icon={User} 
                        label="Pessoas no Processo" 
                        value={call.quantasPessoasTrabalham.toString()} 
                      />
                    )}
                    {call.fonteDadosEntrada && (
                      <InfoRow 
                        icon={FileText} 
                        label="Fonte de Dados" 
                        value={call.fonteDadosEntrada} 
                      />
                    )}
                    
                    {call.volumetria && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Volumetria:</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.volumetria}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.usaMFA && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">MFA (Duplo Fator):</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.usaMFA}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.existeCaptcha && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Captcha:</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.existeCaptcha}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.existeCertificadoDigital && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Certificado Digital:</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.existeCertificadoDigital}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.possivelUsarAPI && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">API/Banco de Dados:</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.possivelUsarAPI}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.possibilidadeUsuarioRobotico && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Usuário Robótico:</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.possibilidadeUsuarioRobotico}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.acessoAplicacoes && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Acesso às Aplicações:</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.acessoAplicacoes}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.necessitaVPN && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">VPN:</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.necessitaVPN}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.analiseHumanaEtapa && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Análise Humana:</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.analiseHumanaEtapa}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.restricaoTecnologiaSistema && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Restrições de Tecnologia:</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.restricaoTecnologiaSistema}
                          </p>
                        </div>
                      </div>
                    )}
                  </InfoSection>
                </>
              )}

              {/* Sustentação specific information */}
              {call.serviceType === 'SUSTENTACAO' && (
                call.ocorrenciaSustentacao || call.celulaCode || call.robotSelecionado
              ) && (
                <>
                  <Separator />
                  <InfoSection title="Informações de Sustentação">
                    {call.ocorrenciaSustentacao && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Descrição da Ocorrência:</p>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {call.ocorrenciaSustentacao}
                          </p>
                        </div>
                      </div>
                    )}
                    {call.celulaCode && (
                      <InfoRow 
                        icon={Building2} 
                        label="Código da Célula" 
                        value={call.celulaCode} 
                      />
                    )}
                    {call.robotSelecionado && (
                      <InfoRow 
                        icon={Cpu} 
                        label="Robô Selecionado" 
                        value={call.robotSelecionado} 
                      />
                    )}
                  </InfoSection>
                </>
              )}

              {call.serviceType === 'MELHORIA' && (
                call.jaSustentada !== undefined || call.idCliente || call.nomeCliente || 
                call.idServico || call.nomeServico
              ) && (
                <>
                  <Separator />
                  <InfoSection title="Informações de Melhoria">
                    {call.jaSustentada !== undefined && (
                      <InfoRow 
                        icon={FileText} 
                        label="Já Sustentada" 
                        value={call.jaSustentada ? 'Sim' : 'Não'} 
                      />
                    )}
                    {call.idCliente && (
                      <InfoRow 
                        icon={User} 
                        label="ID do Cliente" 
                        value={call.idCliente} 
                      />
                    )}
                    {call.nomeCliente && (
                      <InfoRow 
                        icon={User} 
                        label="Nome do Cliente" 
                        value={call.nomeCliente} 
                      />
                    )}
                    {call.idServico && (
                      <InfoRow 
                        icon={Briefcase} 
                        label="ID do Serviço" 
                        value={call.idServico} 
                      />
                    )}
                    {call.nomeServico && (
                      <InfoRow 
                        icon={Briefcase} 
                        label="Nome do Serviço" 
                        value={call.nomeServico} 
                      />
                    )}
                  </InfoSection>
                </>
              )}
              
              <Separator />
              <InfoSection title="Histórico">
                <InfoRow 
                  icon={Calendar} 
                  label="Data de Criação" 
                  value={formatDate(call.createdAt)} 
                />
                {call.updatedAt && call.updatedAt !== call.createdAt && (
                  <InfoRow 
                    icon={Calendar} 
                    label="Última Atualização" 
                    value={formatDate(call.updatedAt)} 
                  />
                )}
              </InfoSection>
            </div>
          ) : null}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}