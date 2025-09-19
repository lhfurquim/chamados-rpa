package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.Nature;

import java.time.LocalDate;

public record TrackingDto(
        Long id,
        DemandDto demand,
        Double hours,
        Nature nature,
        String description,
        LocalDate submittedAt,
        SubmitterInfoDto submitter
) {
}