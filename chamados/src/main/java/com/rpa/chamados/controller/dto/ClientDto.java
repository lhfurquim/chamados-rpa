package com.rpa.chamados.controller.dto;

import java.time.LocalDateTime;

public record ClientDto(
        Long id,
        String name,
        LocalDateTime createdAt
) {
}