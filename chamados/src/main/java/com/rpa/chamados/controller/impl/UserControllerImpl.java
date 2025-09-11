package com.rpa.chamados.controller.impl;

import com.rpa.chamados.controller.dto.SubmitterInfoDto;
import com.rpa.chamados.service.AuthenticationService;
import com.rpa.chamados.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1/api/users")
public class UserControllerImpl {

    private final UserService userService;
    private final AuthenticationService authenticationService;

    public UserControllerImpl(UserService userService, AuthenticationService authenticationService) {
        this.userService = userService;
        this.authenticationService = authenticationService;
    }

    @GetMapping("/respondents")
    public ResponseEntity<List<SubmitterInfoDto>> getFormRespondents() {
        List<SubmitterInfoDto> respondents = userService.getFormRespondents();
        return ResponseEntity.ok(respondents);
    }

    @GetMapping("/respondents/{id}")
    public ResponseEntity<SubmitterInfoDto> getFormRespondentById(@PathVariable String id) {
        SubmitterInfoDto respondent = userService.getFormRespondentById(id);
        return ResponseEntity.ok(respondent);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = userService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/respondents/search")
    public ResponseEntity<Map<String, Object>> searchFormRespondents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String preferredServiceType,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        Pageable pageable = PageRequest.of(page, limit);
        Page<SubmitterInfoDto> results = userService.searchFormRespondents(search, department, 
                                                                          company, isActive, 
                                                                          preferredServiceType, 
                                                                          dateFrom, dateTo, pageable);
        
        Map<String, Object> response = Map.of(
            "users", results.getContent(),
            "total", results.getTotalElements(),
            "page", results.getNumber(),
            "totalPages", results.getTotalPages()
        );
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/respondents/{id}/status")
    public ResponseEntity<SubmitterInfoDto> updateUserActiveStatus(
            @PathVariable String id, 
            @RequestBody Map<String, Boolean> statusRequest
    ) {
        Boolean isActive = statusRequest.get("isActive");
        SubmitterInfoDto updatedUser = userService.updateUserActiveStatus(id, isActive);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/analytics/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentAnalytics() {
        List<Map<String, Object>> analytics = userService.getDepartmentAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/respondents/by-email/{email}")
    public ResponseEntity<SubmitterInfoDto> getFormRespondentByEmail(@PathVariable String email) {
        SubmitterInfoDto respondent = userService.getFormRespondentByEmail(email);
        return ResponseEntity.ok(respondent);
    }

    @PostMapping("/respondents")
    public ResponseEntity<SubmitterInfoDto> createRespondent(@Valid @RequestBody SubmitterInfoDto submitterDto) {
        SubmitterInfoDto createdRespondent = userService.findOrCreateSubmitter(submitterDto);
        return ResponseEntity.ok(createdRespondent);
    }

    @GetMapping("/me")
    public ResponseEntity<SubmitterInfoDto> getCurrentUser(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("No valid authorization header found for /me endpoint");
                return ResponseEntity.badRequest().build();
            }

            String token = authHeader.substring(7);
            SubmitterInfoDto currentUser = authenticationService.ensureUserExists(token);
            
            log.debug("Retrieved current user from token: {}", currentUser.email());
            return ResponseEntity.ok(currentUser);
            
        } catch (Exception e) {
            log.error("Failed to get current user: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}