package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.Area;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateProjectRequest(

        @NotNull(message = "Id of the project must be valid")
        @Positive(message = "Project ID must be positive")
        Long id,

        @NotBlank(message = "Name cannot be blank")
        String name,

        @NotBlank(message = "Description cannot be blank")
        String description,

        @NotNull(message = "Area cannot be null")
        Area area,

        @NotNull(message = "Client ID cannot be null")
        @Positive(message = "Client ID must be positive")
        Long clientId

) {
}
