package com.rpa.chamados.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record SubmitterInfoDto(
        String id,
        
        @NotBlank(message = "Name is required")
        String name,
        
        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        String email,
        
        String phone,
        
        @NotBlank(message = "Department is required")
        String department,
        
        @NotBlank(message = "Company is required")
        String company,
        
        String role,
        
        @NotNull(message = "Active status is required")
        Boolean isActive,
        
        Integer requestsSubmitted,
        
        LocalDateTime lastActivity,
        
        LocalDateTime joinedAt
) {
}