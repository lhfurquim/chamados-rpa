package com.rpa.chamados.service;

import com.rpa.chamados.controller.dto.DepartmentStatDto;
import com.rpa.chamados.controller.dto.SubmitterInfoDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface UserService {

    List<SubmitterInfoDto> getFormRespondents();
    
    SubmitterInfoDto getFormRespondentById(String id);
    
    SubmitterInfoDto getFormRespondentByEmail(String email);
    
    Map<String, Object> getUserStats();
    
    Page<SubmitterInfoDto> searchFormRespondents(String search, String department, String company, 
                                               Boolean isActive, String preferredServiceType, 
                                               String dateFrom, String dateTo, Pageable pageable);
    
    SubmitterInfoDto updateUserActiveStatus(String id, Boolean isActive);
    
    List<Map<String, Object>> getDepartmentAnalytics();
    
    SubmitterInfoDto findOrCreateSubmitter(SubmitterInfoDto submitterDto);
    
    List<DepartmentStatDto> getTopDepartmentStats();
}