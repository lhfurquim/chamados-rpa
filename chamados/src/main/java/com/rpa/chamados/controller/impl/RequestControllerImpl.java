package com.rpa.chamados.controller.impl;

import com.rpa.chamados.controller.dto.*;
import com.rpa.chamados.service.RequestService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1/api/calls")
public class RequestControllerImpl {

    private final RequestService service;

    public RequestControllerImpl(RequestService service) {
        this.service = service;
    }

    @PostMapping(path = "/melhoria", consumes = "multipart/form-data")
    public ResponseEntity<SubmissionResponseDto> createMelhoriaRequest(
            @RequestPart("request") CreateMelhoriaRequest request,
            @RequestPart(value = "documentacaoFiles", required = false) List<MultipartFile> documentacaoFiles,
            @RequestPart(value = "evidenciasFiles", required = false) List<MultipartFile> evidenciasFiles,
            @RequestHeader("Authorization") String authHeader
    ) {
        SubmissionResponseDto response = service.createMelhoria(
                request,
                documentacaoFiles,
                evidenciasFiles,
                authHeader
        );

        return ResponseEntity.status(201).body(response);
    }

    @PostMapping(path="/sustentacao",consumes = "multipart/form-data")
    public ResponseEntity<SubmissionResponseDto> createSustentacaoRequest(
            @RequestPart("request") CreateSustentacaoRequest request,
            @RequestPart(value = "documentacaoFiles", required = false) List<MultipartFile> documentacaoFiles,
            @RequestPart(value = "evidenciasFiles", required = false) List<MultipartFile> evidenciasFiles,
            @RequestHeader("Authorization") String authHeader
    ) {
        SubmissionResponseDto response = service.createSustentacao(
                request,
                documentacaoFiles,
                evidenciasFiles,
                authHeader
        );

        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/novo-projeto")
    public ResponseEntity<SubmissionResponseDto> createNovoProjetoRequest(
            @RequestPart("request") CreateNovoProjetoRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        SubmissionResponseDto response = service.createNovoProjeto(
                request,
                authHeader
        );

        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    public ResponseEntity<List<RequestDto>> getAllCalls() {
        List<RequestDto> calls = service.getAllCalls();
        return ResponseEntity.ok(calls);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestDto> getCallById(@PathVariable String id) {
        RequestDto call = service.getCallById(id);
        return ResponseEntity.ok(call);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RequestDto> updateCall(
            @PathVariable String id,
            @Valid @RequestBody UpdateRequest request
    ) {
        log.info("Updating call with ID: {}", id);
        log.debug("Update request - ServiceType: {}, Description length: {}", 
                    request.serviceType(), 
                    request.description() != null ? request.description().length() : 0);
        
        try {
            RequestDto updatedCall = service.updateCall(id, request);
            log.info("Successfully updated call with ID: {}", id);
            return ResponseEntity.ok(updatedCall);
        } catch (RuntimeException e) {
            log.error("Error updating call with ID {}: {}", id, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error updating call with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro interno do servidor ao atualizar solicitação", e);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<CallStatsDto> getCallStats() {
        CallStatsDto stats = service.getCallStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDataDto> getDashboardData() {
        DashboardDataDto dashboardData = service.getDashboardData();
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchCalls(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String technology,
            @RequestParam(required = false) String celulaCode,
            @RequestParam(required = false) String submittedBy,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        Pageable pageable = PageRequest.of(page, limit);
        Page<RequestDto> results = service.searchCalls(search, serviceType, department, 
                                                     technology, celulaCode, submittedBy, 
                                                     company, dateFrom, dateTo, pageable);
        
        Map<String, Object> response = Map.of(
            "calls", results.getContent(),
            "total", results.getTotalElements(),
            "page", results.getNumber(),
            "totalPages", results.getTotalPages()
        );
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCall(@PathVariable String id) {
        service.deleteCall(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RequestDto>> getCallsByUser(@PathVariable String userId) {
        List<RequestDto> calls = service.getCallsByUser(userId);
        return ResponseEntity.ok(calls);
    }

    @GetMapping("/stats/departments")
    public ResponseEntity<Map<String, Long>> getDepartmentStats() {
        Map<String, Long> stats = service.getDepartmentStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/technologies")
    public ResponseEntity<Map<String, Long>> getTechnologyStats() {
        Map<String, Long> stats = service.getTechnologyStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/users")
    public ResponseEntity<List<UserTicketMetricsDto>> getUserTicketMetrics() {
        List<UserTicketMetricsDto> metrics = service.getUserTicketMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/stats/timeline")
    public ResponseEntity<List<TimelineStatsDto>> getTimelineStats(
            @RequestParam(defaultValue = "8") int weeks
    ) {
        List<TimelineStatsDto> timeline = service.getTimelineStats(weeks);
        return ResponseEntity.ok(timeline);
    }

}
