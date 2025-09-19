package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.Area;

public record ProjectDto(
        Long id,
        String name,
        String description,
        Area area,
        ClientDto client
) {
}