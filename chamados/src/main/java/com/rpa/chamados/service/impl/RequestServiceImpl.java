package com.rpa.chamados.service.impl;

import com.rpa.chamados.controller.dto.*;
import com.rpa.chamados.domain.model.*;
import com.rpa.chamados.exception.InvalidJwtTokenException;
import com.rpa.chamados.repository.RequestRepository;
import com.rpa.chamados.service.AuthenticationService;
import com.rpa.chamados.service.RequestService;
import com.rpa.chamados.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class RequestServiceImpl implements RequestService {

    private final RequestRepository repository;
    private final AuthenticationService authenticationService;
    private final UserService userService;

    public RequestServiceImpl(RequestRepository repository, AuthenticationService authenticationService,UserService userService) {
        this.repository = repository;
        this.authenticationService = authenticationService;
        this.userService = userService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto> getAllCalls() {
        log.debug("Fetching all requests");
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public SubmissionResponseDto createMelhoria(CreateMelhoriaRequest request, List<MultipartFile> documentacaoFiles, List<MultipartFile> evidenciasFiles, String token) {
        log.debug("Creating Melhoria request for description: {}", request.description());

        log.info(request.celula());
        log.info("Request de melhoria: {}", request);

        try {
            SubmitterInfo persistedSubmitter = validateTokenAndReturnSubmitter(token);
            SubmitterInfoDto submitterDto = convertToDto(persistedSubmitter);
            
            MelhoriaRequest entity = mapToEntity(request, submitterDto);
            
            // TODO: Handle file uploads
            
            MelhoriaRequest saved = (MelhoriaRequest) repository.save(entity);
            
            log.debug("Successfully created Melhoria request with ID: {}", saved.getId());
            return createSubmissionResponse(saved, "Solicitação de melhoria criada com sucesso!");
            
        } catch (Exception e) {
            log.error("Failed to create Melhoria request: {}", e.getMessage());
            throw new RuntimeException("Erro ao criar solicitação de melhoria: " + e.getMessage(), e);
        }
    }

    @Override
    public SubmissionResponseDto createSustentacao(CreateSustentacaoRequest request, List<MultipartFile> documentacaoFiles, List<MultipartFile> evidenciasFiles, String token) {
        log.debug("Creating Sustentacao request for description: {}", request.description());
        
        try {
            SubmitterInfo persistedSubmitter = validateTokenAndReturnSubmitter(token);
            SubmitterInfoDto submitterDto = convertToDto(persistedSubmitter);
            
            SustentacaoRequest entity = mapToEntity(request, submitterDto);
            
            // TODO: Handle file uploads
            
            SustentacaoRequest saved = (SustentacaoRequest) repository.save(entity);
            
            log.debug("Successfully created Sustentacao request with ID: {}", saved.getId());
            return createSubmissionResponse(saved, "Solicitação de sustentação criada com sucesso!");
            
        } catch (Exception e) {
            log.error("Failed to create Sustentacao request: {}", e.getMessage());
            throw new RuntimeException("Erro ao criar solicitação de sustentação: " + e.getMessage(), e);
        }
    }

    @Override
    public SubmissionResponseDto createNovoProjeto(CreateNovoProjetoRequest request, String token) {
        log.debug("Creating Novo Projeto request for description: {}", request.description());
        
        try {
            SubmitterInfo persistedSubmitter = validateTokenAndReturnSubmitter(token);
            SubmitterInfoDto submitterDto = convertToDto(persistedSubmitter);
            
            NovoProjetoRequest entity = mapToEntity(request, submitterDto);
            
            NovoProjetoRequest saved = (NovoProjetoRequest) repository.save(entity);
            
            log.debug("Successfully created Novo Projeto request with ID: {}", saved.getId());
            return createSubmissionResponse(saved, "Solicitação de novo projeto criada com sucesso!");
            
        } catch (Exception e) {
            log.error("Failed to create Novo Projeto request: {}", e.getMessage());
            throw new RuntimeException("Erro ao criar solicitação de novo projeto: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public RequestDto getCallById(String id) {
        log.debug("Fetching request with ID: {}", id);
        
        try {
            UUID uuid = UUID.fromString(id);
            Request request = repository.findById(uuid)
                    .orElseThrow(() -> {
                        log.error("Request not found with ID: {}", id);
                        return new RuntimeException("Solicitação não encontrada com ID: " + id);
                    });
            
            log.debug("Successfully retrieved request with ID: {}", id);
            return mapToDto(request);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for request ID: {}", id);
            throw new RuntimeException("Formato de ID inválido: " + id, e);
        }
    }

    @Override
    public CallStatsDto getCallStats() {
        List<Request> allRequests = repository.findAll();
        
        CallStatsDto.ServiceTypeStatsDto serviceTypeStats = new CallStatsDto.ServiceTypeStatsDto(
            (int) repository.countByServiceType(MelhoriaRequest.class),
            (int) repository.countByServiceType(SustentacaoRequest.class),
            (int) repository.countByServiceType(NovoProjetoRequest.class)
        );
        
        Map<String, Integer> byCelula = allRequests.stream()
                .filter(r -> r.getCelula() != null)
                .collect(Collectors.groupingBy(
                    r -> mapCelulaCode(r.getCelula()),
                    Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)
                ));
        
        Map<String, Integer> byDepartment = allRequests.stream()
                .filter(r -> r.getSubmitterInfo() != null && r.getSubmitterInfo().getDepartment() != null)
                .collect(Collectors.groupingBy(
                    r -> r.getSubmitterInfo().getDepartment(),
                    Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)
                ));

        Map<String, Integer> byTechnology = allRequests.stream()
                .map(Request::getTecnologiaAutomacao)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        Function.identity(),
                        Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)
                ));
        
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long thisWeekCount = repository.countRequestsThisWeek(weekAgo);
        
        CallStatsDto.RecentActivityDto recentActivity = new CallStatsDto.RecentActivityDto(
            (int) thisWeekCount,
            4, // Mock data for last week
            25.0 // Mock percentage change
        );
        
        return new CallStatsDto(
            allRequests.size(),
            serviceTypeStats,
            byCelula,
            byDepartment,
            byTechnology,
            50, // Mock active users count
            2.5,
            recentActivity
        );
    }

    @Override
    public Page<RequestDto> searchCalls(String search, String serviceType, String department, 
                                       String technology, String celulaCode, String submittedBy, 
                                       String company, String dateFrom, String dateTo, Pageable pageable) {
        String serviceTypeParam = serviceType != null && !serviceType.equals("all") 
            ? serviceType.toUpperCase().replace("-", "_") 
            : null;
            
        Page<Request> results = repository.searchRequests(search, serviceTypeParam, department, technology, pageable);
        
        return results.map(this::mapToDto);
    }

    @Override
    @Transactional
    public void deleteCall(String id) {
        log.debug("Attempting to delete request with ID: {}", id);
        
        try {
            UUID uuid = UUID.fromString(id);
            
            if (!repository.existsById(uuid)) {
                log.error("Request not found for deletion with ID: {}", id);
                throw new RuntimeException("Solicitação não encontrada com ID: " + id);
            }
            
            repository.deleteById(uuid);
            log.debug("Successfully deleted request with ID: {}", id);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for request ID: {}", id);
            throw new RuntimeException("Formato de ID inválido: " + id, e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto> getCallsByUser(String userId) {
        log.debug("Fetching requests for user: {}", userId);
        List<Request> requests = repository.findBySubmittedBy(userId);
        return requests.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getDepartmentStats() {
        log.debug("Calculating department statistics");
        List<Request> allRequests = repository.findAll();
        return allRequests.stream()
                .filter(r -> r.getSubmitterInfo() != null && r.getSubmitterInfo().getDepartment() != null)
                .collect(Collectors.groupingBy(
                    r -> r.getSubmitterInfo().getDepartment(),
                    Collectors.counting()
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getTechnologyStats() {
        log.debug("Calculating technology statistics");
        List<Request> allRequests = repository.findAll();

        return allRequests.stream()
                .map(Request::getTecnologiaAutomacao)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        Function.identity(),
                        Collectors.counting()
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserTicketMetricsDto> getUserTicketMetrics() {
        log.debug("Calculating user ticket metrics");
        
        List<Request> allRequests = repository.findAll();
        
        Map<String, List<Request>> requestsByUser = allRequests.stream()
                .filter(r -> r.getSubmitterInfo() != null)
                .collect(Collectors.groupingBy(r -> r.getSubmitterInfo().getId().toString()));
        
        List<UserTicketMetricsDto> metrics = new ArrayList<>();
        
        for (Map.Entry<String, List<Request>> entry : requestsByUser.entrySet()) {
            String userId = entry.getKey();
            List<Request> userRequests = entry.getValue();
            
            if (!userRequests.isEmpty()) {
                SubmitterInfo userInfo = userRequests.getFirst().getSubmitterInfo();
                
                Map<String, Long> ticketsByServiceType = userRequests.stream()
                        .collect(Collectors.groupingBy(
                                r -> r.getServiceType().name(),
                                Collectors.counting()
                        ));
                
                Optional<Request> mostRecentRequest = userRequests.stream()
                        .max(Comparator.comparing(Request::getCreatedAt));
                
                Double avgResolutionTime = calculateAverageResolutionTime(userRequests);
                
                UserTicketMetricsDto metric = new UserTicketMetricsDto(
                    userId,
                    userInfo.getName(),
                    userInfo.getDepartment(),
                    userRequests.size(),
                    ticketsByServiceType,
                    mostRecentRequest.map(Request::getCreatedAt).orElse(null),
                    avgResolutionTime != null ? avgResolutionTime : 0.0
                );
                
                metrics.add(metric);
            }
        }
        
        metrics.sort((a, b) -> Long.compare(b.totalTickets(), a.totalTickets()));
        
        log.debug("Generated metrics for {} users", metrics.size());
        return metrics;
    }
    
    private Double calculateAverageResolutionTime(List<Request> requests) {
        // This is a placeholder implementation as we don't have resolution timestamp
        return null;
    }

    private NovoProjetoRequest mapToEntity(CreateNovoProjetoRequest dto, SubmitterInfoDto submitterDto) {
        NovoProjetoRequest entity = new NovoProjetoRequest();

        entity.setDescription(dto.description());
        entity.setSubmittedBy(submitterDto.id());
        entity.setSubmitterInfo(convertToEntity(submitterDto));

        entity.setRoi(dto.roi());
        entity.setCelula(dto.celula());
        entity.setCliente(dto.cliente());
        entity.setServico(dto.servico());
        entity.setAreaNegocio(dto.areaNegocio());
        entity.setNomeProcesso(dto.nomeProcesso());
        entity.setFrequenciaExecucao(dto.frequenciaExecucao());
        entity.setSazonalidade(dto.sazonalidade());
        entity.setVolumetria(dto.volumetria());
        entity.setDuracaoCadaCaso(dto.duracaoCadaCaso());
        entity.setQuantasPessoasTrabalham(dto.quantasPessoasTrabalham());
        entity.setFonteDadosEntrada(dto.fonteDadosEntrada());
        entity.setUsaMFA(dto.usaMFA());
        entity.setExisteCaptcha(dto.existeCaptcha());
        entity.setExisteCertificadoDigital(dto.existeCertificadoDigital());
        entity.setPossivelUsarAPI(dto.possivelUsarAPI());
        entity.setPossibilidadeUsuarioRobotico(dto.possibilidadeUsuarioRobotico());
        entity.setLimitacaoAcessoLogin(dto.limitacaoAcessoLogin());
        entity.setAcessoAplicacoes(dto.acessoAplicacoes());
        entity.setRdpOpcaoPositiva(dto.rdpOpcaoPositiva());
        entity.setNecessitaVPN(dto.necessitaVPN());
        entity.setAnaliseHumanaEtapa(dto.analiseHumanaEtapa());
        entity.setRestricaoTecnologiaSistema(dto.restricaoTecnologiaSistema());
        entity.setRegrasDefinidas(dto.regrasDefinidas());
        entity.setProcessoRepetitivo(dto.processoRepetitivo());
        entity.setDadosEstruturados(dto.dadosEstruturados());

        return entity;
    }

    private MelhoriaRequest mapToEntity(CreateMelhoriaRequest dto, SubmitterInfoDto submitterDto) {
        MelhoriaRequest entity = new MelhoriaRequest();

        entity.setDescription(dto.description());
        entity.setSubmittedBy(submitterDto.id());
        entity.setSubmitterInfo(convertToEntity(submitterDto));
        entity.setRobot(dto.robot());
        entity.setEmpresa(dto.empresa());
        entity.setTecnologiaAutomacao(dto.tecnologiaAutomacao());

        entity.setCelula(dto.celula());
        entity.setJaSustentada(dto.jaSustentada());
        entity.setIdCliente(dto.idCliente());
        entity.setNomeCliente(dto.nomeCliente());
        entity.setIdServico(dto.idServico());
        entity.setNomeServico(dto.nomeServico());
        entity.setTemDocumentacao(dto.temDocumentacao());
        entity.setUsuarioAutomacao(dto.usuarioAutomacao());
        entity.setServidorAutomacao(dto.servidorAutomacao());

        return entity;
    }

    private SustentacaoRequest mapToEntity(CreateSustentacaoRequest dto, SubmitterInfoDto submitterDto) {
        SustentacaoRequest entity = new SustentacaoRequest();

        entity.setDescription(dto.description());
        entity.setSubmittedBy(submitterDto.id());
        entity.setSubmitterInfo(convertToEntity(submitterDto));
        entity.setRobot(dto.robotSelecionado());
        entity.setEmpresa(dto.empresa());
        entity.setTecnologiaAutomacao(dto.tecnologiaAutomacao());

        entity.setCelula(dto.celula());
        entity.setIdCliente(dto.idCliente());
        entity.setNomeCliente(dto.nomeCliente());
        entity.setIdServico(dto.idServico());
        entity.setNomeServico(dto.nomeServico());
        entity.setTemDocumentacao(dto.temDocumentacao());
        entity.setUsuarioAutomacao(dto.usuarioAutomacao());
        entity.setServidorAutomacao(dto.servidorAutomacao());

        return entity;
    }

    private SubmitterInfoDto convertToDto(SubmitterInfo submitterInfo) {
        return new SubmitterInfoDto(
            submitterInfo.getId().toString(),
            submitterInfo.getName(),
            submitterInfo.getEmail(),
            submitterInfo.getPhone(),
            submitterInfo.getDepartment(),
            submitterInfo.getCompany(),
            submitterInfo.getRole(),
            submitterInfo.getIsActive(),
            submitterInfo.getRequestsSubmitted(),
            submitterInfo.getLastActivity(),
            submitterInfo.getJoinedAt()
        );
    }

    private SubmitterInfo convertToEntity(SubmitterInfoDto submitterDto) {
        SubmitterInfo submitterInfo = new SubmitterInfo();
        submitterInfo.setId(UUID.fromString(submitterDto.id()));
        submitterInfo.setName(submitterDto.name());
        submitterInfo.setEmail(submitterDto.email());
        submitterInfo.setPhone(submitterDto.phone());
        submitterInfo.setDepartment(submitterDto.department());
        submitterInfo.setCompany(submitterDto.company());
        submitterInfo.setRole(submitterDto.role());
        submitterInfo.setIsActive(submitterDto.isActive());
        submitterInfo.setRequestsSubmitted(submitterDto.requestsSubmitted());
        submitterInfo.setLastActivity(submitterDto.lastActivity());
        submitterInfo.setJoinedAt(submitterDto.joinedAt());
        return submitterInfo;
    }

    private RequestDto mapToDto(Request entity) {
        SubmitterInfoDto submitterDto = null;
        if (entity.getSubmitterInfo() != null) {
            SubmitterInfo submitter = entity.getSubmitterInfo();
            submitterDto = new SubmitterInfoDto(
                submitter.getId().toString(),
                submitter.getName(),
                submitter.getEmail(),
                submitter.getPhone(),
                submitter.getDepartment(),
                submitter.getCompany(),
                submitter.getRole(),
                submitter.getIsActive(),
                submitter.getRequestsSubmitted(),
                submitter.getLastActivity(),
                submitter.getJoinedAt()
            );
        }
        
        String roi = null, areaNegocio = null, nomeProcesso = null;
        String regrasDefinidas = null, processoRepetitivo = null, dadosEstruturados = null;
        String celula = null;
        Boolean jaSustentada = null, temDocumentacao = null;
        String idCliente = null, nomeCliente = null, idServico = null, nomeServico = null, empresa = null;
        String tecnologiaAutomacao = null, usuarioAutomacao = null, servidorAutomacao = null;
        List<String> documentacaoFiles = null, evidenciasFiles = null;
        String frequenciaExecucao = null, sazonalidade = null, volumetria = null, duracaoCadaCaso = null;
        Integer quantasPessoasTrabalham = null;
        String fonteDadosEntrada = null, usaMFA = null, existeCaptcha = null, existeCertificadoDigital = null;
        String possivelUsarAPI = null, possibilidadeUsuarioRobotico = null, limitacaoAcessoLogin = null;
        String acessoAplicacoes = null, rdpOpcaoPositiva = null, necessitaVPN = null;
        String analiseHumanaEtapa = null, restricaoTecnologiaSistema = null;

        String robot = entity.getRobot();
        tecnologiaAutomacao = entity.getTecnologiaAutomacao();
        empresa = entity.getEmpresa();
        
        if (entity instanceof NovoProjetoRequest novoProjetoRequest) {
            roi = novoProjetoRequest.getRoi();
            celula = novoProjetoRequest.getCelula();
            idCliente = novoProjetoRequest.getCliente();
            idServico = novoProjetoRequest.getServico();
            areaNegocio = novoProjetoRequest.getAreaNegocio();
            nomeProcesso = novoProjetoRequest.getNomeProcesso();
            regrasDefinidas = novoProjetoRequest.getRegrasDefinidas();
            processoRepetitivo = novoProjetoRequest.getProcessoRepetitivo();
            dadosEstruturados = novoProjetoRequest.getDadosEstruturados();
            frequenciaExecucao = novoProjetoRequest.getFrequenciaExecucao();
            sazonalidade = novoProjetoRequest.getSazonalidade();
            volumetria = novoProjetoRequest.getVolumetria();
            duracaoCadaCaso = novoProjetoRequest.getDuracaoCadaCaso();
            quantasPessoasTrabalham = novoProjetoRequest.getQuantasPessoasTrabalham();
            fonteDadosEntrada = novoProjetoRequest.getFonteDadosEntrada();
            usaMFA = novoProjetoRequest.getUsaMFA();
            existeCaptcha = novoProjetoRequest.getExisteCaptcha();
            existeCertificadoDigital = novoProjetoRequest.getExisteCertificadoDigital();
            possivelUsarAPI = novoProjetoRequest.getPossivelUsarAPI();
            possibilidadeUsuarioRobotico = novoProjetoRequest.getPossibilidadeUsuarioRobotico();
            limitacaoAcessoLogin = novoProjetoRequest.getLimitacaoAcessoLogin();
            acessoAplicacoes = novoProjetoRequest.getAcessoAplicacoes();
            rdpOpcaoPositiva = novoProjetoRequest.getRdpOpcaoPositiva();
            necessitaVPN = novoProjetoRequest.getNecessitaVPN();
            analiseHumanaEtapa = novoProjetoRequest.getAnaliseHumanaEtapa();
            restricaoTecnologiaSistema = novoProjetoRequest.getRestricaoTecnologiaSistema();
        } else if (entity instanceof MelhoriaRequest melhoriaRequest) {
            jaSustentada = melhoriaRequest.getJaSustentada();
            celula = melhoriaRequest.getCelula();
            idCliente = melhoriaRequest.getIdCliente();
            nomeCliente = melhoriaRequest.getNomeCliente();
            idServico = melhoriaRequest.getIdServico();
            nomeServico = melhoriaRequest.getNomeServico();
            temDocumentacao = melhoriaRequest.getTemDocumentacao();
            usuarioAutomacao = melhoriaRequest.getUsuarioAutomacao();
            servidorAutomacao = melhoriaRequest.getServidorAutomacao();
            documentacaoFiles = melhoriaRequest.getDocumentacaoFiles();
            evidenciasFiles = melhoriaRequest.getEvidenciasFiles();
        } else if (entity instanceof SustentacaoRequest sustentacaoRequest) {
            idCliente = sustentacaoRequest.getIdCliente();
            celula = sustentacaoRequest.getCelula();
            nomeCliente = sustentacaoRequest.getNomeCliente();
            idServico = sustentacaoRequest.getIdServico();
            nomeServico = sustentacaoRequest.getNomeServico();
            temDocumentacao = sustentacaoRequest.getTemDocumentacao();
            usuarioAutomacao = sustentacaoRequest.getUsuarioAutomacao();
            servidorAutomacao = sustentacaoRequest.getServidorAutomacao();
            documentacaoFiles = sustentacaoRequest.getDocumentacaoFiles();
            evidenciasFiles = sustentacaoRequest.getEvidenciasFiles();
        }
        
        return new RequestDto(
            entity.getId().toString(),
            entity.getServiceType(),
            entity.getDescription(),
            entity.getSubmittedBy(),
            submitterDto,
            roi,
            celula,
            areaNegocio,
            nomeProcesso,
            regrasDefinidas,
            processoRepetitivo,
            dadosEstruturados,
            robot,
            jaSustentada,
            idCliente,
            nomeCliente,
            idServico,
            nomeServico,
            empresa,
            temDocumentacao,
            tecnologiaAutomacao,
            usuarioAutomacao,
            servidorAutomacao,
            documentacaoFiles,
            evidenciasFiles,
            frequenciaExecucao,
            sazonalidade,
            volumetria,
            duracaoCadaCaso,
            quantasPessoasTrabalham,
            fonteDadosEntrada,
            usaMFA,
            existeCaptcha,
            existeCertificadoDigital,
            possivelUsarAPI,
            possibilidadeUsuarioRobotico,
            limitacaoAcessoLogin,
            acessoAplicacoes,
            rdpOpcaoPositiva,
            necessitaVPN,
            analiseHumanaEtapa,
            restricaoTecnologiaSistema,
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
    
    @Override
    @Transactional
    public RequestDto updateCall(String id, UpdateRequest request) {
        log.debug("Updating call with ID: {} and serviceType: {}", id, request.serviceType());

        Request entity = repository.findById(UUID.fromString(id))
            .orElseThrow(() -> {
                log.error("Call not found with ID: {}", id);
                return new RuntimeException("Solicitação não encontrada com ID: " + id);
            });
        
        if (request.serviceType() != null && !request.serviceType().equals(entity.getServiceType())) {
            log.error("Cannot change service type from {} to {}", entity.getServiceType(), request.serviceType());
            throw new RuntimeException("Não é possível alterar o tipo de serviço de uma solicitação existente");
        }
        
        updateEntityByType(entity, request);
        
        Request updatedEntity = repository.save(entity);
        
        log.debug("Successfully updated call with ID: {}", id);
        return mapToDto(updatedEntity);
    }
    
    private void updateEntityByType(Request entity, UpdateRequest request) {
        updateCommonFields(entity, request);
        
        switch (entity.getServiceType()) {
            case MELHORIA -> updateMelhoriaSpecificFields((MelhoriaRequest) entity, request);
            case SUSTENTACAO -> updateSustentacaoSpecificFields((SustentacaoRequest) entity, request);
            case NOVO_PROJETO -> updateNovoProjetoSpecificFields((NovoProjetoRequest) entity, request);
        }
    }
    
    private void updateCommonFields(Request entity, UpdateRequest request) {
        if (request.description() != null) {
            entity.setDescription(request.description());
        }
        if (request.celula() != null) {
            entity.setCelula(request.celula());
        }
        if (request.robotSelecionado() != null) {
            entity.setRobot(request.robotSelecionado());
        }
        if (request.empresa() != null) {
            entity.setEmpresa(request.empresa());
        }
        if (request.tecnologiaAutomacao() != null) {
            entity.setTecnologiaAutomacao(request.tecnologiaAutomacao());
        }
    }
    
    private void updateMelhoriaSpecificFields(MelhoriaRequest entity, UpdateRequest request) {
        if (request.jaSustentada() != null) {
            entity.setJaSustentada(request.jaSustentada());
        }
        if (request.idCliente() != null) {
            entity.setIdCliente(request.idCliente());
        }
        if (request.nomeCliente() != null) {
            entity.setNomeCliente(request.nomeCliente());
        }
        if (request.idServico() != null) {
            entity.setIdServico(request.idServico());
        }
        if (request.nomeServico() != null) {
            entity.setNomeServico(request.nomeServico());
        }
        if (request.temDocumentacao() != null) {
            entity.setTemDocumentacao(request.temDocumentacao());
        }
        if (request.usuarioAutomacao() != null) {
            entity.setUsuarioAutomacao(request.usuarioAutomacao());
        }
        if (request.servidorAutomacao() != null) {
            entity.setServidorAutomacao(request.servidorAutomacao());
        }
    }
    
    private void updateSustentacaoSpecificFields(SustentacaoRequest entity, UpdateRequest request) {
        if (request.idCliente() != null) {
            entity.setIdCliente(request.idCliente());
        }
        if (request.nomeCliente() != null) {
            entity.setNomeCliente(request.nomeCliente());
        }
        if (request.idServico() != null) {
            entity.setIdServico(request.idServico());
        }
        if (request.nomeServico() != null) {
            entity.setNomeServico(request.nomeServico());
        }
        if (request.temDocumentacao() != null) {
            entity.setTemDocumentacao(request.temDocumentacao());
        }
        if (request.usuarioAutomacao() != null) {
            entity.setUsuarioAutomacao(request.usuarioAutomacao());
        }
        if (request.servidorAutomacao() != null) {
            entity.setServidorAutomacao(request.servidorAutomacao());
        }
        if (request.celulaOutra() != null) {
            entity.setCelula(request.celulaOutra());
        }
    }
    
    private void updateNovoProjetoSpecificFields(NovoProjetoRequest entity, UpdateRequest request) {
        if (request.roi() != null) {
            entity.setRoi(request.roi());
        }
        if (request.cliente() != null) {
            entity.setCliente(request.cliente());
        }
        if (request.servico() != null) {
            entity.setServico(request.servico());
        }
        if (request.areaNegocio() != null) {
            entity.setAreaNegocio(request.areaNegocio());
        }
        if (request.nomeProcesso() != null) {
            entity.setNomeProcesso(request.nomeProcesso());
        }
        if (request.frequenciaExecucao() != null) {
            entity.setFrequenciaExecucao(request.frequenciaExecucao());
        }
        if (request.sazonalidade() != null) {
            entity.setSazonalidade(request.sazonalidade());
        }
        if (request.volumetria() != null) {
            entity.setVolumetria(request.volumetria());
        }
        if (request.duracaoCadaCaso() != null) {
            entity.setDuracaoCadaCaso(request.duracaoCadaCaso());
        }
        if (request.quantasPessoasTrabalham() != null) {
            entity.setQuantasPessoasTrabalham(request.quantasPessoasTrabalham());
        }
        if (request.fonteDadosEntrada() != null) {
            entity.setFonteDadosEntrada(request.fonteDadosEntrada());
        }
        if (request.usaMFA() != null) {
            entity.setUsaMFA(request.usaMFA());
        }
        if (request.existeCaptcha() != null) {
            entity.setExisteCaptcha(request.existeCaptcha());
        }
        if (request.existeCertificadoDigital() != null) {
            entity.setExisteCertificadoDigital(request.existeCertificadoDigital());
        }
        if (request.possivelUsarAPI() != null) {
            entity.setPossivelUsarAPI(request.possivelUsarAPI());
        }
        if (request.possibilidadeUsuarioRobotico() != null) {
            entity.setPossibilidadeUsuarioRobotico(request.possibilidadeUsuarioRobotico());
        }
        if (request.limitacaoAcessoLogin() != null) {
            entity.setLimitacaoAcessoLogin(request.limitacaoAcessoLogin());
        }
        if (request.acessoAplicacoes() != null) {
            entity.setAcessoAplicacoes(request.acessoAplicacoes());
        }
        if (request.rdpOpcaoPositiva() != null) {
            entity.setRdpOpcaoPositiva(request.rdpOpcaoPositiva());
        }
        if (request.necessitaVPN() != null) {
            entity.setNecessitaVPN(request.necessitaVPN());
        }
        if (request.analiseHumanaEtapa() != null) {
            entity.setAnaliseHumanaEtapa(request.analiseHumanaEtapa());
        }
        if (request.restricaoTecnologiaSistema() != null) {
            entity.setRestricaoTecnologiaSistema(request.restricaoTecnologiaSistema());
        }
        if (request.regrasDefinidas() != null) {
            entity.setRegrasDefinidas(request.regrasDefinidas());
        }
        if (request.processoRepetitivo() != null) {
            entity.setProcessoRepetitivo(request.processoRepetitivo());
        }
        if (request.dadosEstruturados() != null) {
            entity.setDadosEstruturados(request.dadosEstruturados());
        }
    }

    @Override
    public DashboardDataDto getDashboardData() {
        log.debug("Fetching consolidated dashboard data");
        
        CallStatsDto callStats = getCallStats();
        
        Map<String, Object> userStatsMap = userService.getUserStats();
        Long totalUsers = (Long) userStatsMap.get("totalUsers");
        Long activeUsers = (Long) userStatsMap.get("activeUsers");
        Long newUsersThisMonth = (Long) userStatsMap.get("newUsersThisMonth");
        List<DepartmentStatDto> topDepartments = userService.getTopDepartmentStats();
        
        Map<String, Long> departmentStats = topDepartments.stream()
                .collect(Collectors.toMap(
                    DepartmentStatDto::department,
                    DepartmentStatDto::requestCount
                ));
        Map<String, Long> technologyStats = getTechnologyStats();
        
        List<UserTicketMetricsDto> topUsersByTickets = getUserTicketMetrics()
                .stream()
                .sorted((a, b) -> Long.compare(b.totalTickets(), a.totalTickets()))
                .limit(5)
                .collect(Collectors.toList());
        
        List<RequestDto> recentCalls = getAllCalls()
                .stream()
                .sorted((a, b) -> b.createdAt().compareTo(a.createdAt()))
                .limit(5)
                .collect(Collectors.toList());
        
        log.debug("Successfully consolidated dashboard data - totalUsers: {}, activeUsers: {}, newUsersThisMonth: {}", 
                totalUsers, activeUsers, newUsersThisMonth);
        
        return new DashboardDataDto(
                callStats,
                totalUsers,
                activeUsers,
                newUsersThisMonth,
                topDepartments,
                departmentStats,
                technologyStats,
                topUsersByTickets,
                recentCalls
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimelineStatsDto> getTimelineStats(int weeks) {
        log.debug("Calculating timeline statistics for {} weeks", weeks);
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusWeeks(weeks);
        
        List<Request> allRequests = repository.findByCreatedAtBetween(startDate, endDate);
        
        Map<Integer, List<Request>> requestsByWeek = allRequests.stream()
                .collect(Collectors.groupingBy(request -> {
                    LocalDateTime createdAt = request.getCreatedAt();
                    int weekOfYear = createdAt.getDayOfYear() / 7;
                    return weekOfYear;
                }));
        
        List<TimelineStatsDto> timelineStats = new ArrayList<>();
        
        for (int i = 0; i < weeks; i++) {
            LocalDateTime weekEnd = endDate.minusWeeks(i);
            LocalDateTime weekStart = weekEnd.minusWeeks(1);
            
            int weekKey = weekEnd.getDayOfYear() / 7;
            List<Request> weekRequests = requestsByWeek.getOrDefault(weekKey, Collections.emptyList());
            
            Map<String, Long> byServiceType = weekRequests.stream()
                    .collect(Collectors.groupingBy(
                            r -> r.getServiceType().name(),
                            Collectors.counting()
                    ));
            
            String period = String.format("Sem %d", weeks - i);
            
            TimelineStatsDto weekStats = new TimelineStatsDto(
                    period,
                    weekStart.toLocalDate(),
                    weekEnd.toLocalDate(),
                    weekRequests.size(),
                    byServiceType
            );
            
            timelineStats.add(weekStats);
        }
        
        Collections.reverse(timelineStats);
        
        log.debug("Generated timeline statistics for {} periods", timelineStats.size());
        return timelineStats;
    }

    private String mapCelulaCode(String celulaCode) {
        return switch (celulaCode) {
            case "99" -> "099 - Tesouraria";
            case "411" -> "411 - Planejamento/Caixa";
            case "128" -> "128 - Book Administrativo";
            case "621" -> "621 - Vale N1";
            case "504" -> "504 - OLÉ";
            default -> celulaCode;
        };
    }

    private SubmissionResponseDto createSubmissionResponse(Request saved, String message) {
        return new SubmissionResponseDto(
            saved.getId().toString(),
            "RPA-" + saved.getId().toString().substring(0, 8).toUpperCase(),
            message
        );
    }

    private SubmitterInfo validateTokenAndReturnSubmitter(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            log.error("No valid authorization header found");
            throw new InvalidJwtTokenException("Token de autenticação é obrigatório.");
        }

        String extractedToken = token.substring(7);


        try {
            SubmitterInfoDto persistedSubmitter = authenticationService.ensureUserExists(extractedToken);
            log.debug("Validated and retrieved user from token: {}", persistedSubmitter.email());

            SubmitterInfo submitterInfo = new SubmitterInfo();
            submitterInfo.setId(UUID.fromString(persistedSubmitter.id()));
            submitterInfo.setName(persistedSubmitter.name());
            submitterInfo.setEmail(persistedSubmitter.email());
            submitterInfo.setPhone(persistedSubmitter.phone());
            submitterInfo.setDepartment(persistedSubmitter.department());
            submitterInfo.setCompany(persistedSubmitter.company());
            submitterInfo.setRole(persistedSubmitter.role());
            submitterInfo.setIsActive(persistedSubmitter.isActive());
            submitterInfo.setRequestsSubmitted(persistedSubmitter.requestsSubmitted());
            submitterInfo.setLastActivity(persistedSubmitter.lastActivity());
            submitterInfo.setJoinedAt(persistedSubmitter.joinedAt());

            return submitterInfo;
        } catch (Exception e) {
            log.error("Failed to validate token and ensure user exists: {}", e.getMessage());
            throw new InvalidJwtTokenException("Não foi possível validar o usuário. Token inválido ou expirado." + e.getMessage());
        }
    }
}
