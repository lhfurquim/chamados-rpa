package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.Nature;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateTrackingRequest(

        @NotNull(message = "Id of the tracking must be valid")
        @Positive(message = "Tracking ID must be positive")
        Long id,

        @NotNull(message = "Demand ID cannot be null")
        @Positive(message = "Demand ID must be positive")
        Long demandId,

        @NotNull(message = "Hours cannot be null")
        @PositiveOrZero(message = "Hours must be positive or zero")
        Double hours,

        @NotNull(message = "Nature cannot be null")
        Nature nature,

        @NotBlank(message = "Description cannot be blank")
        String description,

        @NotNull(message = "Submitted date cannot be null")
        LocalDate submittedAt,

        @NotNull(message = "Submitter ID cannot be null")
        UUID submitterId

) {
}