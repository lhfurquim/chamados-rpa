package com.rpa.chamados.controller.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
        String message,
        String code,
        LocalDateTime timestamp,
        String path,
        List<ValidationError> details
) {
    public ErrorResponse(String message, String code, String path) {
        this(message, code, LocalDateTime.now(), path, List.of());
    }
    
    public ErrorResponse(String message, String code, String path, List<ValidationError> details) {
        this(message, code, LocalDateTime.now(), path, details);
    }
}