package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.Client;
import com.rpa.chamados.domain.model.enums.ExecutionType;
import com.rpa.chamados.domain.model.enums.RobotStatus;

public record RobotDto (
        Long id,
        String name,
        String cell,
        String technology,
        ExecutionType executionType,
        Client client,
        RobotStatus robotStatus
) {
}
