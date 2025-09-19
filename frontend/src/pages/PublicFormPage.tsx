import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { FileUpload } from '../components/ui/file-upload';
import { SearchableSelect } from '../components/ui/searchable-select';
import { type ApiError, type SubmissionResponse } from '../types';
import { submitCall } from '../services/callsService';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formSchema, type FormData, getDefaultValues } from '../schemas/formSchemas';
import { createCard, transformDataForPlanner } from '../services/plannerService';
import { useCascadingSelects } from '../hooks/useCascadingSelects';

const TECHNOLOGY_OPTIONS: readonly string[] = [
  'UiPath',
  'Blue Prism',
  'Automation Anywhere',
  'Power Automate Desktop',
  'Python',
  'JavaScript',
  'Outras'
];

function PublicFormPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: getDefaultValues()
  });

  const { handleSubmit, watch, formState: { errors: formErrors, isSubmitting }, reset, setValue, register, control } = form;
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [apiErrors, setApiErrors] = useState<ApiError | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const serviceType = watch('serviceType');
  
  const cascadingSelects = useCascadingSelects({
    onCellChange: (cellId) => {
      setValue('celula', cellId || '');
    },
    onClientChange: (clientId) => {
      if (serviceType === 'NOVO_PROJETO') {
        setValue('cliente', clientId || '');
      } else {
        setValue('idCliente', clientId || '');
      }
    },
    onServiceChange: (serviceId) => {
      if (serviceType === 'NOVO_PROJETO') {
        setValue('servico', serviceId || '');
      } else {
        setValue('idServico', serviceId || '');
      }
    },
    onRobotChange: (robotName) => {
      setValue('robotSelecionado', robotName || '');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stefanini-50 to-stefanini-100">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleServiceTypeChange = (newServiceType: string) => {
    reset(getDefaultValues(newServiceType));
  };

  const onSubmit = async (data: FormData) => {
    setApiErrors(null);
    setLoadingStep('');

    try {
      setLoadingStep('Enviando solicitação...');
      const result = await submitCall(data);
      
      let plannerSuccess = false;
      try {
        if (user?.email && result.id) {
          setLoadingStep('Notificando equipe de planejamento...');
          
          const plannerData = transformDataForPlanner(data, result.id, user.email);
          const plannerResult = await createCard(plannerData);
          
          if (plannerResult.success) {
            console.log('✅ Dados enviados com sucesso para o Planner');
            plannerSuccess = true;
          } else {
            console.warn('⚠️ Falha ao enviar para o Planner:', plannerResult.message);
          }
        }
      } catch (plannerError) {
        console.error('❌ Erro ao comunicar com API do Planner:', plannerError);
      }
      
      setLoadingStep('');
      
      const successMessage = plannerSuccess 
        ? `${result.message} A equipe de planejamento foi notificada automaticamente.`
        : result.message;
        
      setSubmissionResult({
        protocol: result.protocol,
        message: successMessage
      });
      setIsSubmitted(true);
      reset(getDefaultValues());
      

    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setLoadingStep('');
      setApiErrors(error as ApiError);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    const fieldPath = fieldName.split('.');
    let error: unknown = formErrors;
    for (const path of fieldPath) {
      error = (error as Record<string, unknown>)?.[path];
    }
    return (error as { message?: string })?.message;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stefanini-50 to-stefanini-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Solicitação Criada com Sucesso!</CardTitle>
            <CardDescription>
              {submissionResult?.message || 'Sua solicitação foi registrada e será encaminhada para a equipe de planejamento da Torre RPA.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Protocolo: <strong>{submissionResult?.protocol || '#N/A'}</strong>
              </p>
            </div>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setSubmissionResult(null);
                setApiErrors(null);
                setLoadingStep('');
                reset(getDefaultValues());
              }}
              className="w-full"
            >
              Nova Solicitação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stefanini-50 to-stefanini-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-stefanini-700 mb-2">Torre RPA</h1>
          <p className="text-lg text-stefanini-600">Formulário de requisitos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitação RPA</CardTitle>
            <CardDescription>
              Preencha as informações abaixo para abrir uma solicitação para a Torre RPA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiErrors && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-1">
                      Erro ao enviar solicitação
                    </h4>
                    <p className="text-sm text-red-700">{apiErrors.message}</p>
                    {apiErrors.details && apiErrors.details.length > 0 && (
                      <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                        {apiErrors.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              <div className="space-y-3">
                <Label>Tipo de Serviço *</Label>
                <Controller
                  name="serviceType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleServiceTypeChange(value);
                      }}
                      className="space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="MELHORIA" id="melhoria" />
                          <Label htmlFor="melhoria" className="font-medium">Melhoria</Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Exemplos: Alteração de regra de negócio, alterar escopo do robô...
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="SUSTENTACAO" id="sustentacao" />
                          <Label htmlFor="sustentacao" className="font-medium">Sustentação</Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Exemplos: Correção de erros/bugs, automação não está executando...
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="NOVO_PROJETO" id="novo-projeto" />
                          <Label htmlFor="novo-projeto" className="font-medium">Novo Projeto</Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Exemplos: Criação de um robô...
                        </p>
                      </div>
                    </RadioGroup>
                  )}
                />
                {getFieldError('serviceType') && (
                  <p className="text-sm text-red-600">{getFieldError('serviceType')}</p>
                )}
              </div>


              {serviceType === 'MELHORIA' && (
                <div className="space-y-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">Informações Adicionais - Melhoria</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricaoMelhoria">Descreva a ocorrência da melhoria *</Label>
                    <p className="text-sm text-muted-foreground">(destinação, quais sistemas, software ou plataformas envolvidas no processo)</p>
                    <Textarea
                      {...register('description')}
                      id="descricaoMelhoria"
                      placeholder="Descreva o processo, sistemas envolvidos, objetivos... (mínimo 50 caracteres)"
                      className={`min-h-[120px] ${getFieldError('description') ? 'border-red-500' : ''}`}
                    />
                    {getFieldError('description') && (
                      <p className="text-sm text-red-600">{getFieldError('description')}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Já sustentada pelo time? *</Label>
                    <Controller
                      name="jaSustentada"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value ? 'true' : field.value === false ? 'false' : ''}
                          onValueChange={(value) => field.onChange(value === 'true')}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="ja-sustentada-sim" />
                            <Label htmlFor="ja-sustentada-sim">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="ja-sustentada-nao" />
                            <Label htmlFor="ja-sustentada-nao">Não</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                    {getFieldError('jaSustentada') && (
                      <p className="text-sm text-red-600">{getFieldError('jaSustentada')}</p>
                    )}
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa *</Label>
                    <Input
                      {...register('empresa')}
                      id="empresa"
                      placeholder="Nome da empresa"
                      className={getFieldError('empresa') ? 'border-red-500' : ''}
                    />
                    {getFieldError('empresa') && (
                      <p className="text-sm text-red-600">{getFieldError('empresa')}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>A automação tem documentação? *</Label>
                    <Controller
                      name="temDocumentacao"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value ? 'true' : field.value === false ? 'false' : ''}
                          onValueChange={(value) => field.onChange(value === 'true')}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="tem-doc-sim" />
                            <Label htmlFor="tem-doc-sim">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="tem-doc-nao" />
                            <Label htmlFor="tem-doc-nao">Não</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                    {getFieldError('temDocumentacao') && (
                      <p className="text-sm text-red-600">{getFieldError('temDocumentacao')}</p>
                    )}
                  </div>

                  {watch('temDocumentacao') && (
                    <div className="space-y-2">
                      <Label>Anexe a documentação da automação</Label>
                      <Controller
                        name="documentacaoFiles"
                        control={control}
                        render={({ field }) => (
                          <FileUpload
                            value={field.value || []}
                            onChange={field.onChange}
                            accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mp3,.wav"
                            maxFiles={10}
                            maxSize={10 * 1024 * 1024}
                          />
                        )}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="tecnologiaAutomacao">Tecnologia da automação *</Label>
                    <Controller
                      name="tecnologiaAutomacao"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className={getFieldError('tecnologiaAutomacao') ? 'border-red-500' : ''}>
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
                      )}
                    />
                    {getFieldError('tecnologiaAutomacao') && (
                      <p className="text-sm text-red-600">{getFieldError('tecnologiaAutomacao')}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="usuarioAutomacao">Qual o usuário da automação? *</Label>
                      <Input
                        {...register('usuarioAutomacao')}
                        id="usuarioAutomacao"
                        placeholder="Usuário da automação"
                        className={getFieldError('usuarioAutomacao') ? 'border-red-500' : ''}
                      />
                      {getFieldError('usuarioAutomacao') && (
                        <p className="text-sm text-red-600">{getFieldError('usuarioAutomacao')}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="servidorAutomacao">Qual o servidor da automação? *</Label>
                      <Input
                        {...register('servidorAutomacao')}
                        id="servidorAutomacao"
                        placeholder="Servidor da automação"
                        className={getFieldError('servidorAutomacao') ? 'border-red-500' : ''}
                      />
                      {getFieldError('servidorAutomacao') && (
                        <p className="text-sm text-red-600">{getFieldError('servidorAutomacao')}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celulaMelhoria">Célula *</Label>
                    {cascadingSelects.cellsLoading ? (
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Carregando células...</span>
                      </div>
                    ) : (
                      <SearchableSelect
                        options={cascadingSelects.cells}
                        value={cascadingSelects.selectedCell}
                        onValueChange={(value) => {
                          cascadingSelects.onCellChange(value);
                          setValue('robotSelecionado', '');
                        }}
                        placeholder="Pesquise ou selecione a célula"
                        emptyMessage="Nenhuma célula encontrada"
                        className={getFieldError('celula') ? 'border-red-500' : ''}
                      />
                    )}
                    {getFieldError('celula') && (
                      <p className="text-sm text-red-600">{getFieldError('celula')}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clienteMelhoria">Cliente *</Label>
                      {cascadingSelects.clientsLoading ? (
                        <div className="flex items-center space-x-2 p-3 border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Carregando clientes...</span>
                        </div>
                      ) : cascadingSelects.clients.length > 0 ? (
                        <Select
                          value={cascadingSelects.selectedClient || ''}
                          onValueChange={cascadingSelects.onClientChange}
                        >
                          <SelectTrigger className={getFieldError('idCliente') ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {cascadingSelects.clients.map((client) => (
                              <SelectItem key={client.value} value={client.value}>
                                {client.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 border rounded-md text-sm text-muted-foreground">
                          {cascadingSelects.selectedCell ? 'Nenhum cliente disponível para esta célula' : 'Selecione uma célula primeiro'}
                        </div>
                      )}
                      {getFieldError('idCliente') && (
                        <p className="text-sm text-red-600">{getFieldError('idCliente')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servicoMelhoria">Serviço *</Label>
                      {cascadingSelects.servicesLoading ? (
                        <div className="flex items-center space-x-2 p-3 border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Carregando serviços...</span>
                        </div>
                      ) : cascadingSelects.services.length > 0 ? (
                        <Select
                          value={cascadingSelects.selectedService || ''}
                          onValueChange={cascadingSelects.onServiceChange}
                        >
                          <SelectTrigger className={getFieldError('idServico') ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecione o serviço" />
                          </SelectTrigger>
                          <SelectContent>
                            {cascadingSelects.services.map((service) => (
                              <SelectItem key={service.value} value={service.value}>
                                {service.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 border rounded-md text-sm text-muted-foreground">
                          {cascadingSelects.selectedClient ? 'Nenhum serviço disponível' : 'Selecione célula e cliente primeiro'}
                        </div>
                      )}
                      {getFieldError('idServico') && (
                        <p className="text-sm text-red-600">{getFieldError('idServico')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomeClienteMelhoria">Nome do Cliente *</Label>
                      <Input
                        {...register('nomeCliente')}
                        id="nomeClienteMelhoria"
                        placeholder="Digite o nome do cliente"
                        className={getFieldError('nomeCliente') ? 'border-red-500' : ''}
                      />
                      {getFieldError('nomeCliente') && (
                        <p className="text-sm text-red-600">{getFieldError('nomeCliente')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomeServicoMelhoria">Nome do Serviço *</Label>
                      <Input
                        {...register('nomeServico')}
                        id="nomeServicoMelhoria"
                        placeholder="Digite o nome do serviço"
                        className={getFieldError('nomeServico') ? 'border-red-500' : ''}
                      />
                      {getFieldError('nomeServico') && (
                        <p className="text-sm text-red-600">{getFieldError('nomeServico')}</p>
                      )}
                    </div>
                  </div>

                  {watch('celula') && cascadingSelects.robots.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="robotSelecionadoMelhoria">Selecione seu robô - {watch('celula')} *</Label>
                      <Controller
                        name="robotSelecionado"
                        control={control}
                        render={({ field }) => (
                          <Select 
                            value={field.value || ''} 
                            onValueChange={(value) => {
                              field.onChange(value);
                              cascadingSelects.onRobotChange(value);
                            }}
                            disabled={cascadingSelects.robotsLoading}
                          >
                            <SelectTrigger className={getFieldError('robotSelecionado') ? 'border-red-500' : ''}>
                              <SelectValue placeholder={cascadingSelects.robotsLoading ? "Carregando robôs..." : "Selecione o robô"} />
                            </SelectTrigger>
                            <SelectContent>
                              {cascadingSelects.robots.map((robot) => (
                                <SelectItem key={robot.value} value={robot.value}>
                                  {robot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {getFieldError('robotSelecionado') && (
                        <p className="text-sm text-red-600">{getFieldError('robotSelecionado')}</p>
                      )}
                    </div>
                  )}

                  {watch('celula') && !cascadingSelects.robotsLoading && cascadingSelects.robots.length === 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Nenhum robô disponível para a célula selecionada. Os robôs serão adicionados em breve.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Anexe evidências da ocorrência</Label>
                    <Controller
                      name="evidenciasFiles"
                      control={control}
                      render={({ field }) => (
                        <FileUpload
                          value={field.value || []}
                          onChange={field.onChange}
                          accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mp3,.wav"
                          maxFiles={10}
                          maxSize={10 * 1024 * 1024}
                        />
                      )}
                    />
                  </div>
                </div>
              )}

              {serviceType === 'NOVO_PROJETO' && (
                <>
                  <div className="space-y-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Informações Adicionais - Novo Projeto</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="descricaoNovoProjeto">Descrição geral e objetivo do processo *</Label>
                      <p className="text-sm text-muted-foreground">(destinação, quais sistemas, software ou plataformas envolvidas no processo)</p>
                      <Textarea
                        {...register('description')}
                        id="descricaoNovoProjeto"
                        placeholder="Descreva o processo, sistemas envolvidos, objetivos... (mínimo 50 caracteres)"
                        className={`min-h-[120px] ${getFieldError('description') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('description') && (
                        <p className="text-sm text-red-600">{getFieldError('description')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="roi">ROI *</Label>
                      <p className="text-sm text-muted-foreground">Qual será o ganho esperado com essa automação?</p>
                      <Textarea
                        {...register('roi')}
                        id="roi"
                        placeholder="Descreva o ganho esperado com a automação... (mínimo 150 caracteres)"
                        className={`min-h-[80px] ${getFieldError('roi') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('roi') && (
                        <p className="text-sm text-red-600">{getFieldError('roi')}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Informações da operação:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="celula">Célula *</Label>
                          {cascadingSelects.cellsLoading ? (
                            <div className="flex items-center space-x-2 p-3 border rounded-md">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">Carregando células...</span>
                            </div>
                          ) : (
                            <SearchableSelect
                              options={cascadingSelects.cells}
                              value={cascadingSelects.selectedCell}
                              onValueChange={cascadingSelects.onCellChange}
                              placeholder="Pesquise ou selecione a célula"
                              emptyMessage="Nenhuma célula encontrada"
                              className={getFieldError('celula') ? 'border-red-500' : ''}
                            />
                          )}
                          {getFieldError('celula') && (
                            <p className="text-sm text-red-600">{getFieldError('celula')}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="cliente">Cliente *</Label>
                          {cascadingSelects.clientsLoading ? (
                            <div className="flex items-center space-x-2 p-3 border rounded-md">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">Carregando clientes...</span>
                            </div>
                          ) : cascadingSelects.clients.length > 0 ? (
                            <Select
                              value={cascadingSelects.selectedClient || ''}
                              onValueChange={cascadingSelects.onClientChange}
                            >
                              <SelectTrigger className={getFieldError('cliente') ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecione o cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {cascadingSelects.clients.map((client) => (
                                  <SelectItem key={client.value} value={client.value}>
                                    {client.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="p-3 border rounded-md text-sm text-muted-foreground">
                              {cascadingSelects.selectedCell ? 'Nenhum cliente disponível para esta célula' : 'Selecione uma célula primeiro'}
                            </div>
                          )}
                          {getFieldError('cliente') && (
                            <p className="text-sm text-red-600">{getFieldError('cliente')}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="servico">Serviço *</Label>
                          {cascadingSelects.servicesLoading ? (
                            <div className="flex items-center space-x-2 p-3 border rounded-md">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">Carregando serviços...</span>
                            </div>
                          ) : cascadingSelects.services.length > 0 ? (
                            <Select
                              value={cascadingSelects.selectedService || ''}
                              onValueChange={cascadingSelects.onServiceChange}
                            >
                              <SelectTrigger className={getFieldError('servico') ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecione o serviço" />
                              </SelectTrigger>
                              <SelectContent>
                                {cascadingSelects.services.map((service) => (
                                  <SelectItem key={service.value} value={service.value}>
                                    {service.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="p-3 border rounded-md text-sm text-muted-foreground">
                              {cascadingSelects.selectedClient ? 'Nenhum serviço disponível' : 'Selecione célula e cliente primeiro'}
                            </div>
                          )}
                          {getFieldError('servico') && (
                            <p className="text-sm text-red-600">{getFieldError('servico')}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="areaNegocio">Área de Negócio *</Label>
                      <Input
                        {...register('areaNegocio')}
                        id="areaNegocio"
                        placeholder="Ex: Gestão de fornecedores, suprimentos, operações, recursos humanos..."
                        className={getFieldError('areaNegocio') ? 'border-red-500' : ''}
                      />
                      {getFieldError('areaNegocio') && (
                        <p className="text-sm text-red-600">{getFieldError('areaNegocio')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomeProcesso">Nome do Processo *</Label>
                      <Input
                        {...register('nomeProcesso')}
                        id="nomeProcesso"
                        placeholder="Nome do processo"
                        className={getFieldError('nomeProcesso') ? 'border-red-500' : ''}
                      />
                      {getFieldError('nomeProcesso') && (
                        <p className="text-sm text-red-600">{getFieldError('nomeProcesso')}</p>
                      )}
                    </div>


                    <div className="space-y-3">
                      <Label>O processo tem regras bem definidas *</Label>
                      <p className="text-sm text-muted-foreground">
                        Use a escala para indicar se a tarefa/processo é gerenciado por meio de regras precisas, bem definidas e padronizadas ou se é bastante criativo e irregular.
                      </p>
                      <Controller
                        name="regrasDefinidas"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="padrao" id="regras-padrao" />
                              <Label htmlFor="regras-padrao" className="text-sm">As regras são bem definidas tendo um padrão</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="ramificacoes" id="regras-ramificacoes" />
                              <Label htmlFor="regras-ramificacoes" className="text-sm">As regras são bem definidas mas tem muitas ramificações</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="analise-pessoal" id="regras-analise" />
                              <Label htmlFor="regras-analise" className="text-sm">As regras são definidas de acordo com análise pessoal do analista</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pouco-definidas" id="regras-pouco" />
                              <Label htmlFor="regras-pouco" className="text-sm">Há regras, porém não são muito bem definidas</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="criativo" id="regras-criativo" />
                              <Label htmlFor="regras-criativo" className="text-sm">O processo é bastante criativo e irregular, sendo cada caso um caso</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao-sei" id="regras-nao-sei" />
                              <Label htmlFor="regras-nao-sei" className="text-sm">Não sei</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {getFieldError('regrasDefinidas') && (
                        <p className="text-sm text-red-600">{getFieldError('regrasDefinidas')}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>O processo possui etapas repetitivas e/ou com pouca variação? *</Label>
                      <p className="text-sm text-muted-foreground">
                        Use a escala para indicar se o processo é repetitivo e/ou tem poucas variações, como por exemplo um processo de cadastro de materiais, onde é necessário percorrer várias linhas de uma base de dados (excel, tabelas) executando os mesmos passos em um determinado sistema para cadastrar um a um
                      </p>
                      <Controller
                        name="processoRepetitivo"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="concordo-plenamente" id="repetitivo-concordo-plenamente" />
                              <Label htmlFor="repetitivo-concordo-plenamente" className="text-sm">Concordo plenamente</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="concordo" id="repetitivo-concordo" />
                              <Label htmlFor="repetitivo-concordo" className="text-sm">Concordo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nem-discordo-nem-concordo" id="repetitivo-neutro" />
                              <Label htmlFor="repetitivo-neutro" className="text-sm">Nem discordo nem concordo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="discordo" id="repetitivo-discordo" />
                              <Label htmlFor="repetitivo-discordo" className="text-sm">Discordo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="discordo-totalmente" id="repetitivo-discordo-totalmente" />
                              <Label htmlFor="repetitivo-discordo-totalmente" className="text-sm">Discordo totalmente</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao-sei" id="repetitivo-nao-sei" />
                              <Label htmlFor="repetitivo-nao-sei" className="text-sm">Não sei</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {getFieldError('processoRepetitivo') && (
                        <p className="text-sm text-red-600">{getFieldError('processoRepetitivo')}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>Os dados são estruturados *</Label>
                      <p className="text-sm text-muted-foreground">
                        Use a escala para indicar se o formato dos dados de entrada tem um formato previsível disponível em campos fixos e facilmente detectável por meio de algoritmos de pesquisa (excel, tabelas com estrutura fixa), ou se pode ser descrito como não previsível e difícil de detectar (conteúdo multimídia, interações de atendimento ao cliente e dados de mídia social)
                      </p>
                      <Controller
                        name="dadosEstruturados"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="concordo-plenamente" id="estruturados-concordo-plenamente" />
                              <Label htmlFor="estruturados-concordo-plenamente" className="text-sm">Concordo plenamente</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="concordo" id="estruturados-concordo" />
                              <Label htmlFor="estruturados-concordo" className="text-sm">Concordo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nem-discordo-nem-concordo" id="estruturados-neutro" />
                              <Label htmlFor="estruturados-neutro" className="text-sm">Nem discordo nem concordo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="discordo" id="estruturados-discordo" />
                              <Label htmlFor="estruturados-discordo" className="text-sm">Discordo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="discordo-totalmente" id="estruturados-discordo-totalmente" />
                              <Label htmlFor="estruturados-discordo-totalmente" className="text-sm">Discordo totalmente</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao-sei" id="estruturados-nao-sei" />
                              <Label htmlFor="estruturados-nao-sei" className="text-sm">Não sei</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {getFieldError('dadosEstruturados') && (
                        <p className="text-sm text-red-600">{getFieldError('dadosEstruturados')}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="frequenciaExecucao">13. Frequência de execução do processo *</Label>
                      <Controller
                        name="frequenciaExecucao"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <SelectTrigger className={getFieldError('frequenciaExecucao') ? 'border-red-500' : ''}>
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
                        )}
                      />
                      {getFieldError('frequenciaExecucao') && (
                        <p className="text-sm text-red-600">{getFieldError('frequenciaExecucao')}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>14. Sazonalidade *</Label>
                      <Controller
                        name="sazonalidade"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rara-previsivel" id="sazonalidade-rara-previsivel" />
                              <Label htmlFor="sazonalidade-rara-previsivel" className="text-sm">Rara mas previsível (Natal, Páscoa, último domingo)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rara-imprevisivel" id="sazonalidade-rara-imprevisivel" />
                              <Label htmlFor="sazonalidade-rara-imprevisivel" className="text-sm">Rara e imprevisível</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao-existe" id="sazonalidade-nao-existe" />
                              <Label htmlFor="sazonalidade-nao-existe" className="text-sm">Não existe sazonalidade</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {getFieldError('sazonalidade') && (
                        <p className="text-sm text-red-600">{getFieldError('sazonalidade')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="volumetria">15. Volumetria *</Label>
                      <p className="text-sm text-muted-foreground">
                        Quantos casos são executados dentro da frequência indicada? Ex: 1000 chamados por dia, 200 linhas por hora
                      </p>
                      <Textarea
                        {...register('volumetria')}
                        id="volumetria"
                        placeholder="Ex: 1000 chamados por dia, 200 linhas por hora..."
                        className={`min-h-[80px] ${getFieldError('volumetria') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('volumetria') && (
                        <p className="text-sm text-red-600">{getFieldError('volumetria')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duracaoCadaCaso">16. Duração de cada caso *</Label>
                      <p className="text-sm text-muted-foreground">
                        Quanto tempo leva para executar um caso? Ex: 5 minutos para cada chamado
                      </p>
                      <Input
                        {...register('duracaoCadaCaso')}
                        id="duracaoCadaCaso"
                        placeholder="Ex: 5 minutos para cada chamado"
                        className={getFieldError('duracaoCadaCaso') ? 'border-red-500' : ''}
                      />
                      {getFieldError('duracaoCadaCaso') && (
                        <p className="text-sm text-red-600">{getFieldError('duracaoCadaCaso')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantasPessoasTrabalham">17. Quantas pessoas trabalham nesse processo atualmente *</Label>
                      <Input
                        {...register('quantasPessoasTrabalham', { valueAsNumber: true })}
                        id="quantasPessoasTrabalham"
                        type="number"
                        min="0"
                        placeholder="Número de pessoas"
                        className={getFieldError('quantasPessoasTrabalham') ? 'border-red-500' : ''}
                      />
                      {getFieldError('quantasPessoasTrabalham') && (
                        <p className="text-sm text-red-600">{getFieldError('quantasPessoasTrabalham')}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>18. Qual fonte de dados de entrada? *</Label>
                      <Controller
                        name="fonteDadosEntrada"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="estruturado" id="fonte-estruturado" />
                              <Label htmlFor="fonte-estruturado" className="text-sm">Estruturado - Dados fixos e padronizados.</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao-estruturado" id="fonte-nao-estruturado" />
                              <Label htmlFor="fonte-nao-estruturado" className="text-sm">Não estruturados - Campo de textos livres.</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mista" id="fonte-mista" />
                              <Label htmlFor="fonte-mista" className="text-sm">Mista.</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {getFieldError('fonteDadosEntrada') && (
                        <p className="text-sm text-red-600">{getFieldError('fonteDadosEntrada')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="usaMFA">19. Usa MFA - duplo fator de autenticação? Caso positivo, descreva: *</Label>
                      <Textarea
                        {...register('usaMFA')}
                        id="usaMFA"
                        placeholder="Descreva se usa MFA e como funciona..."
                        className={`min-h-[80px] ${getFieldError('usaMFA') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('usaMFA') && (
                        <p className="text-sm text-red-600">{getFieldError('usaMFA')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="existeCaptcha">20. Existe algum captcha no processo? *</Label>
                      <Textarea
                        {...register('existeCaptcha')}
                        id="existeCaptcha"
                        placeholder="Descreva se existe captcha..."
                        className={`min-h-[60px] ${getFieldError('existeCaptcha') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('existeCaptcha') && (
                        <p className="text-sm text-red-600">{getFieldError('existeCaptcha')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="existeCertificadoDigital">21. Existe algum certificado digital? Caso positivo descreva: *</Label>
                      <Textarea
                        {...register('existeCertificadoDigital')}
                        id="existeCertificadoDigital"
                        placeholder="Descreva se existe certificado digital..."
                        className={`min-h-[80px] ${getFieldError('existeCertificadoDigital') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('existeCertificadoDigital') && (
                        <p className="text-sm text-red-600">{getFieldError('existeCertificadoDigital')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="possivelUsarAPI">22. É possível utilizar API ou Consulta no banco de dados? *</Label>
                      <Textarea
                        {...register('possivelUsarAPI')}
                        id="possivelUsarAPI"
                        placeholder="Descreva as possibilidades de API ou consulta ao banco..."
                        className={`min-h-[80px] ${getFieldError('possivelUsarAPI') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('possivelUsarAPI') && (
                        <p className="text-sm text-red-600">{getFieldError('possivelUsarAPI')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="possibilidadeUsuarioRobotico">23. Há a possibilidade da criação de um usuário robótico para acesso às aplicações? *</Label>
                      <Textarea
                        {...register('possibilidadeUsuarioRobotico')}
                        id="possibilidadeUsuarioRobotico"
                        placeholder="Descreva as possibilidades de criação de usuário robótico..."
                        className={`min-h-[80px] ${getFieldError('possibilidadeUsuarioRobotico') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('possibilidadeUsuarioRobotico') && (
                        <p className="text-sm text-red-600">{getFieldError('possibilidadeUsuarioRobotico')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="limitacaoAcessoLogin">24. Existe alguma limitação de acesso para o login de usuário? *</Label>
                      <Textarea
                        {...register('limitacaoAcessoLogin')}
                        id="limitacaoAcessoLogin"
                        placeholder="Descreva as limitações de acesso..."
                        className={`min-h-[80px] ${getFieldError('limitacaoAcessoLogin') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('limitacaoAcessoLogin') && (
                        <p className="text-sm text-red-600">{getFieldError('limitacaoAcessoLogin')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="acessoAplicacoes">25. Como é feito o acesso às aplicações (VDI/VM/Servidor)? *</Label>
                      <Textarea
                        {...register('acessoAplicacoes')}
                        id="acessoAplicacoes"
                        placeholder="Descreva como é feito o acesso às aplicações..."
                        className={`min-h-[80px] ${getFieldError('acessoAplicacoes') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('acessoAplicacoes') && (
                        <p className="text-sm text-red-600">{getFieldError('acessoAplicacoes')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rdpOpcaoPositiva">26. Caso a opção acima for positiva: Qual é o Remote Desktop Protocol (RDP=APP) para acesso remoto as VDI ou VM (Citrix, Área de trabalho remota AnyDesk/ VNC (Virtual Network Computing) /VPN/)? *</Label>
                      <Textarea
                        {...register('rdpOpcaoPositiva')}
                        id="rdpOpcaoPositiva"
                        placeholder="Descreva o protocolo RDP utilizado..."
                        className={`min-h-[80px] ${getFieldError('rdpOpcaoPositiva') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('rdpOpcaoPositiva') && (
                        <p className="text-sm text-red-600">{getFieldError('rdpOpcaoPositiva')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="necessitaVPN">27. Necessita VPN? Caso positivo descreva: *</Label>
                      <Textarea
                        {...register('necessitaVPN')}
                        id="necessitaVPN"
                        placeholder="Descreva se necessita VPN e como funciona..."
                        className={`min-h-[80px] ${getFieldError('necessitaVPN') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('necessitaVPN') && (
                        <p className="text-sm text-red-600">{getFieldError('necessitaVPN')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="analiseHumanaEtapa">28. Existe análise humana em alguma etapa do processo? *</Label>
                      <Textarea
                        {...register('analiseHumanaEtapa')}
                        id="analiseHumanaEtapa"
                        placeholder="Descreva se existe análise humana..."
                        className={`min-h-[80px] ${getFieldError('analiseHumanaEtapa') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('analiseHumanaEtapa') && (
                        <p className="text-sm text-red-600">{getFieldError('analiseHumanaEtapa')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="restricaoTecnologiaSistema">29. Existe alguma restrição de Tecnologia / Sistema? *</Label>
                      <Textarea
                        {...register('restricaoTecnologiaSistema')}
                        id="restricaoTecnologiaSistema"
                        placeholder="Descreva as restrições de tecnologia ou sistema..."
                        className={`min-h-[80px] ${getFieldError('restricaoTecnologiaSistema') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('restricaoTecnologiaSistema') && (
                        <p className="text-sm text-red-600">{getFieldError('restricaoTecnologiaSistema')}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {serviceType === 'SUSTENTACAO' && (
                <div className="space-y-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Informações Adicionais - Sustentação</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ocorrenciaSustentacao">Descreva a ocorrência da sustentação *</Label>
                    <Textarea
                      {...register('ocorrenciaSustentacao')}
                      id="ocorrenciaSustentacao"
                      placeholder="Descreva detalhadamente a ocorrência da sustentação... (mínimo 50 caracteres)"
                      className={`min-h-[100px] ${getFieldError('ocorrenciaSustentacao') ? 'border-red-500' : ''}`}
                    />
                    {getFieldError('ocorrenciaSustentacao') && (
                      <p className="text-sm text-red-600">{getFieldError('ocorrenciaSustentacao')}</p>
                    )}
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="empresaSustentacao">Empresa *</Label>
                    <Input
                      {...register('empresa')}
                      id="empresaSustentacao"
                      placeholder="Nome da empresa"
                      className={getFieldError('empresa') ? 'border-red-500' : ''}
                    />
                    {getFieldError('empresa') && (
                      <p className="text-sm text-red-600">{getFieldError('empresa')}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>A automação tem documentação? *</Label>
                    <Controller
                      name="temDocumentacao"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value ? 'true' : field.value === false ? 'false' : ''}
                          onValueChange={(value) => field.onChange(value === 'true')}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="tem-doc-sustentacao-sim" />
                            <Label htmlFor="tem-doc-sustentacao-sim">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="tem-doc-sustentacao-nao" />
                            <Label htmlFor="tem-doc-sustentacao-nao">Não</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                    {getFieldError('temDocumentacao') && (
                      <p className="text-sm text-red-600">{getFieldError('temDocumentacao')}</p>
                    )}
                  </div>

                  {watch('temDocumentacao') && (
                    <div className="space-y-2">
                      <Label>Anexe a documentação da automação</Label>
                      <Controller
                        name="documentacaoFiles"
                        control={control}
                        render={({ field }) => (
                          <FileUpload
                            value={field.value || []}
                            onChange={field.onChange}
                            accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mp3,.wav"
                            maxFiles={10}
                            maxSize={10 * 1024 * 1024}
                          />
                        )}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="tecnologiaAutomacaoSustentacao">Tecnologia da automação *</Label>
                    <Controller
                      name="tecnologiaAutomacao"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className={getFieldError('tecnologiaAutomacao') ? 'border-red-500' : ''}>
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
                      )}
                    />
                    {getFieldError('tecnologiaAutomacao') && (
                      <p className="text-sm text-red-600">{getFieldError('tecnologiaAutomacao')}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="usuarioAutomacaoSustentacao">Qual o usuário da automação? *</Label>
                      <Input
                        {...register('usuarioAutomacao')}
                        id="usuarioAutomacaoSustentacao"
                        placeholder="Usuário da automação"
                        className={getFieldError('usuarioAutomacao') ? 'border-red-500' : ''}
                      />
                      {getFieldError('usuarioAutomacao') && (
                        <p className="text-sm text-red-600">{getFieldError('usuarioAutomacao')}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="servidorAutomacaoSustentacao">Qual o servidor da automação? *</Label>
                      <Input
                        {...register('servidorAutomacao')}
                        id="servidorAutomacaoSustentacao"
                        placeholder="Servidor da automação"
                        className={getFieldError('servidorAutomacao') ? 'border-red-500' : ''}
                      />
                      {getFieldError('servidorAutomacao') && (
                        <p className="text-sm text-red-600">{getFieldError('servidorAutomacao')}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celulaSustentacao">Célula *</Label>
                    {cascadingSelects.cellsLoading ? (
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Carregando células...</span>
                      </div>
                    ) : (
                      <SearchableSelect
                        options={cascadingSelects.cells}
                        value={cascadingSelects.selectedCell}
                        onValueChange={(value) => {
                          cascadingSelects.onCellChange(value);
                          setValue('robotSelecionado', '');
                        }}
                        placeholder="Pesquise ou selecione a célula"
                        emptyMessage="Nenhuma célula encontrada"
                        className={getFieldError('celula') ? 'border-red-500' : ''}
                      />
                    )}
                    {getFieldError('celula') && (
                      <p className="text-sm text-red-600">{getFieldError('celula')}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clienteSustentacao">Cliente *</Label>
                      {cascadingSelects.clientsLoading ? (
                        <div className="flex items-center space-x-2 p-3 border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Carregando clientes...</span>
                        </div>
                      ) : cascadingSelects.clients.length > 0 ? (
                        <Select
                          value={cascadingSelects.selectedClient || ''}
                          onValueChange={cascadingSelects.onClientChange}
                        >
                          <SelectTrigger className={getFieldError('idCliente') ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {cascadingSelects.clients.map((client) => (
                              <SelectItem key={client.value} value={client.value}>
                                {client.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 border rounded-md text-sm text-muted-foreground">
                          {cascadingSelects.selectedCell ? 'Nenhum cliente disponível para esta célula' : 'Selecione uma célula primeiro'}
                        </div>
                      )}
                      {getFieldError('idCliente') && (
                        <p className="text-sm text-red-600">{getFieldError('idCliente')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servicoSustentacao">Serviço *</Label>
                      {cascadingSelects.servicesLoading ? (
                        <div className="flex items-center space-x-2 p-3 border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Carregando serviços...</span>
                        </div>
                      ) : cascadingSelects.services.length > 0 ? (
                        <Select
                          value={cascadingSelects.selectedService || ''}
                          onValueChange={cascadingSelects.onServiceChange}
                        >
                          <SelectTrigger className={getFieldError('idServico') ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecione o serviço" />
                          </SelectTrigger>
                          <SelectContent>
                            {cascadingSelects.services.map((service) => (
                              <SelectItem key={service.value} value={service.value}>
                                {service.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 border rounded-md text-sm text-muted-foreground">
                          {cascadingSelects.selectedClient ? 'Nenhum serviço disponível' : 'Selecione célula e cliente primeiro'}
                        </div>
                      )}
                      {getFieldError('idServico') && (
                        <p className="text-sm text-red-600">{getFieldError('idServico')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomeClienteSustentacao">Nome do Cliente *</Label>
                      <Input
                        {...register('nomeCliente')}
                        id="nomeClienteSustentacao"
                        placeholder="Digite o nome do cliente"
                        className={getFieldError('nomeCliente') ? 'border-red-500' : ''}
                      />
                      {getFieldError('nomeCliente') && (
                        <p className="text-sm text-red-600">{getFieldError('nomeCliente')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomeServicoSustentacao">Nome do Serviço *</Label>
                      <Input
                        {...register('nomeServico')}
                        id="nomeServicoSustentacao"
                        placeholder="Digite o nome do serviço"
                        className={getFieldError('nomeServico') ? 'border-red-500' : ''}
                      />
                      {getFieldError('nomeServico') && (
                        <p className="text-sm text-red-600">{getFieldError('nomeServico')}</p>
                      )}
                    </div>
                  </div>

                  {watch('celula') && cascadingSelects.robots.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="robotSelecionadoSustentacao">Selecione seu robô - {watch('celula')} *</Label>
                      <Controller
                        name="robotSelecionado"
                        control={control}
                        render={({ field }) => (
                          <Select 
                            value={field.value || ''} 
                            onValueChange={(value) => {
                              field.onChange(value);
                              cascadingSelects.onRobotChange(value);
                            }}
                            disabled={cascadingSelects.robotsLoading}
                          >
                            <SelectTrigger className={getFieldError('robotSelecionado') ? 'border-red-500' : ''}>
                              <SelectValue placeholder={cascadingSelects.robotsLoading ? "Carregando robôs..." : "Selecione o robô"} />
                            </SelectTrigger>
                            <SelectContent>
                              {cascadingSelects.robots.map((robot) => (
                                <SelectItem key={robot.value} value={robot.value}>
                                  {robot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {getFieldError('robotSelecionado') && (
                        <p className="text-sm text-red-600">{getFieldError('robotSelecionado')}</p>
                      )}
                    </div>
                  )}

                  {watch('celula') && !cascadingSelects.robotsLoading && cascadingSelects.robots.length === 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Nenhum robô disponível para a célula selecionada. Os robôs serão adicionados em breve.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Anexe evidências da ocorrência</Label>
                    <Controller
                      name="evidenciasFiles"
                      control={control}
                      render={({ field }) => (
                        <FileUpload
                          value={field.value || []}
                          onChange={field.onChange}
                          accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mp3,.wav"
                          maxFiles={10}
                          maxSize={10 * 1024 * 1024}
                        />
                      )}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {loadingStep || 'Enviando...'}
                    </>
                  ) : (
                    'Enviar Solicitação'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PublicFormPage;