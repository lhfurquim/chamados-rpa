package com.rpa.chamados.service.impl;

import com.rpa.chamados.controller.dto.DepartmentStatDto;
import com.rpa.chamados.controller.dto.SubmitterInfoDto;
import com.rpa.chamados.domain.model.SubmitterInfo;
import com.rpa.chamados.exception.UserNotFoundException;
import com.rpa.chamados.repository.SubmitterInfoRepository;
import com.rpa.chamados.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final SubmitterInfoRepository repository;

    public UserServiceImpl(SubmitterInfoRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<SubmitterInfoDto> getFormRespondents() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public SubmitterInfoDto getFormRespondentById(String id) {
        SubmitterInfo submitter = repository.findById(UUID.fromString(id))
                .orElseThrow(() -> new UserNotFoundException("Submitter not found with id: " + id));
        return mapToDto(submitter);
    }

    @Override
    public SubmitterInfoDto getFormRespondentByEmail(String email) {
        SubmitterInfo submitter = repository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Submitter not found with email: " + email));
        return mapToDto(submitter);
    }

    @Override
    public Map<String, Object> getUserStats() {
        long totalUsers = repository.count();
        long activeUsers = repository.countByIsActive(true);
        
        // Calculate new users this month
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        long newUsersThisMonth = repository.countByCreatedAtGreaterThanEqual(startOfMonth);
        
        List<String> departments = repository.findDistinctDepartments();
        List<String> companies = repository.findDistinctCompanies();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("newUsersThisMonth", newUsersThisMonth);
        stats.put("departmentCount", departments.size());
        stats.put("companyCount", companies.size());

        return stats;
    }

    @Override
    public Page<SubmitterInfoDto> searchFormRespondents(String search, String department, String company, 
                                                       Boolean isActive, String preferredServiceType, 
                                                       String dateFrom, String dateTo, Pageable pageable) {

        return repository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    public SubmitterInfoDto updateUserActiveStatus(String id, Boolean isActive) {
        SubmitterInfo submitter = repository.findById(UUID.fromString(id))
                .orElseThrow(() -> new UserNotFoundException("Submitter not found with id: " + id));
        
        submitter.setIsActive(isActive);
        SubmitterInfo updated = repository.save(submitter);
        
        return mapToDto(updated);
    }

    @Override
    public List<Map<String, Object>> getDepartmentAnalytics() {
        List<String> departments = repository.findDistinctDepartments();
        
        return departments.stream()
                .map(dept -> {
                    List<SubmitterInfo> deptUsers = repository.findByDepartment(dept);
                    Map<String, Object> analytics = new HashMap<>();
                    analytics.put("department", dept);
                    analytics.put("totalUsers", deptUsers.size());
                    analytics.put("activeUsers", deptUsers.stream().mapToInt(u -> u.getIsActive() ? 1 : 0).sum());
                    analytics.put("totalRequests", 0); // This would require joining with requests
                    analytics.put("avgRequestsPerUser", 0.0);
                    return analytics;
                })
                .collect(Collectors.toList());
    }

    @Override
    public SubmitterInfoDto findOrCreateSubmitter(SubmitterInfoDto submitterDto) {
        if (submitterDto == null) {
            throw new IllegalArgumentException("Submitter information is required");
        }

        // Try to find existing submitter by email
        Optional<SubmitterInfo> existing = repository.findByEmail(submitterDto.email());
        
        if (existing.isPresent()) {
            SubmitterInfo submitter = existing.get();
            // Update information if needed
            submitter.setName(submitterDto.name());
            submitter.setPhone(submitterDto.phone());
            submitter.setDepartment(submitterDto.department());
            submitter.setCompany(submitterDto.company());
            if (submitterDto.role() != null) {
                submitter.setRole(submitterDto.role());
            }
            if (submitterDto.isActive() != null) {
                submitter.setIsActive(submitterDto.isActive());
            }
            
            return mapToDto(repository.save(submitter));
        } else {
            SubmitterInfo newSubmitter = getSubmitterInfo(submitterDto);

            return mapToDto(repository.save(newSubmitter));
        }
    }

    @Override
    public List<DepartmentStatDto> getTopDepartmentStats() {
        List<Object[]> departmentStats = repository.getDepartmentStatistics();
        
        return departmentStats.stream()
                .map(result -> {
                    String department = (String) result[0];
                    Long userCount = (Long) result[1];
                    Long requestCount = (Long) result[2];
                    
                    return new DepartmentStatDto(department, userCount, requestCount);
                })
                .collect(Collectors.toList());
    }

    private SubmitterInfo getSubmitterInfo(SubmitterInfoDto submitterDto) {
        SubmitterInfo newSubmitter = new SubmitterInfo();
        newSubmitter.setName(submitterDto.name());
        newSubmitter.setEmail(submitterDto.email());
        newSubmitter.setPhone(submitterDto.phone());
        newSubmitter.setDepartment(submitterDto.department());
        newSubmitter.setCompany(submitterDto.company());
        newSubmitter.setRole(submitterDto.role() != null ? submitterDto.role() : "Usuário");
        newSubmitter.setIsActive(submitterDto.isActive() != null ? submitterDto.isActive() : true);
        newSubmitter.setRequestsSubmitted(0);
        return newSubmitter;
    }

    private SubmitterInfoDto mapToDto(SubmitterInfo entity) {
        return new SubmitterInfoDto(
            entity.getId().toString(),
            entity.getName(),
            entity.getEmail(),
            entity.getPhone(),
            entity.getDepartment(),
            entity.getCompany(),
            entity.getRole(),
            entity.getIsActive(),
            entity.getRequestsSubmitted(),
            entity.getLastActivity(),
            entity.getJoinedAt()
        );
    }
}