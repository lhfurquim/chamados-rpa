package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.DemandStatus;
import com.rpa.chamados.domain.model.enums.ServiceType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DemandDto(
        Long id,
        String name,
        Double docHours,
        Double devHours,
        ServiceType type,
        String description,
        SubmitterInfoDto focalPoint,
        SubmitterInfoDto analyst,
        ProjectDto project,
        DemandStatus status,
        LocalDate openedAt,
        LocalDate startAt,
        LocalDate endsAt,
        LocalDate endedAt,
        LocalDateTime createdAt,
        String roi,
        RobotDto robot,
        Long client,
        Long service
) {
}