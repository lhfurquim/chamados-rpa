package com.rpa.chamados.controller.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateClientRequest(

        @NotNull(message = "ID cannot be null for update")
        Long id,

        String name
) {
}