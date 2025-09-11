package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.Client;
import com.rpa.chamados.domain.model.enums.ExecutionType;
import com.rpa.chamados.domain.model.enums.Status;

public record RobotDto (
        String name,
        String cell,
        String technology,
        ExecutionType executionType,
        Client client,
        Status status
) {
}
