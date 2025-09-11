package com.rpa.chamados.service;

import com.rpa.chamados.controller.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface RequestService {
    
    List<RequestDto> getAllCalls();

    SubmissionResponseDto createMelhoria(CreateMelhoriaRequest request,
                                         List<MultipartFile> documentacaoFiles,
                                         List<MultipartFile> evidenciasFiles,
                                         String token
                                         );

    SubmissionResponseDto createSustentacao(
            CreateSustentacaoRequest request,
            List<MultipartFile> documentacaoFiles,
            List<MultipartFile> evidenciasFiles,
            String token
    );

    SubmissionResponseDto createNovoProjeto(
            CreateNovoProjetoRequest request,
            String token
    );

    RequestDto getCallById(String id);
    
    RequestDto updateCall(String id, UpdateRequest request);
    
    CallStatsDto getCallStats();
    
    Page<RequestDto> searchCalls(String search, String serviceType, String department, 
                                String technology, String celulaCode, String submittedBy, 
                                String company, String dateFrom, String dateTo, Pageable pageable);
    
    void deleteCall(String id);
    
    List<RequestDto> getCallsByUser(String userId);
    
    Map<String, Long> getDepartmentStats();
    
    Map<String, Long> getTechnologyStats();
    
    List<UserTicketMetricsDto> getUserTicketMetrics();
    
    DashboardDataDto getDashboardData();
    
    List<TimelineStatsDto> getTimelineStats(int weeks);

}
