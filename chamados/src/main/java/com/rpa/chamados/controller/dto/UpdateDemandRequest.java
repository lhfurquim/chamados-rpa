package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.DemandStatus;
import com.rpa.chamados.domain.model.enums.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateDemandRequest(

        @NotNull(message = "Id of the demand must be valid")
        @Positive(message = "Demand ID must be positive")
        Long id,

        @NotBlank(message = "Name cannot be blank")
        String name,

        @PositiveOrZero(message = "Doc hours must be positive or zero")
        Double docHours,

        @PositiveOrZero(message = "Dev hours must be positive or zero")
        Double devHours,

        @NotNull(message = "Type cannot be null")
        ServiceType type,

        @NotBlank(message = "Description cannot be blank")
        String description,

        @NotNull(message = "Focal point ID cannot be null")
        UUID focalPointId,

        @NotNull(message = "Analyst ID cannot be null")
        UUID analystId,

        @NotNull(message = "Project ID cannot be null")
        @Positive(message = "Project ID must be positive")
        Long projectId,

        @NotNull(message = "Status cannot be null")
        DemandStatus status,

        LocalDate openedAt,

        LocalDate startAt,

        LocalDate endsAt,

        LocalDate endedAt,

        String roi,

        @NotNull(message = "Robot ID cannot be null")
        @Positive(message = "Robot ID must be positive")
        Long robotId,

        @PositiveOrZero(message = "Client must be positive or zero")
        Long client,

        @PositiveOrZero(message = "Service must be positive or zero")
        Long service

) {
}