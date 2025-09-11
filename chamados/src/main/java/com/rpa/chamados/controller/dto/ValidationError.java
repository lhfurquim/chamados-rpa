package com.rpa.chamados.controller.dto;

public record ValidationError(
        String field,
        String message,
        Object rejectedValue
) {
}