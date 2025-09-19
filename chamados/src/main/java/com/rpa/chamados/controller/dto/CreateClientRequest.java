package com.rpa.chamados.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateClientRequest(

        @NotBlank(message = "Name cannot be blank")
        String name
) {
}