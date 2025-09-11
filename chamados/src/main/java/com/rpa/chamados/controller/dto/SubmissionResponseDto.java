package com.rpa.chamados.controller.dto;

public record SubmissionResponseDto(
        String id,
        String protocol,
        String message
) {
}