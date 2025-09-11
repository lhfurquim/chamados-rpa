package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.Client;
import com.rpa.chamados.domain.model.enums.ExecutionType;
import com.rpa.chamados.domain.model.enums.Status;

public record UpdateRobotRequest(
        Long id,
        String name,
        String cell,
        String technology,
        ExecutionType executionType,
        Client client,
        Status status
) {
}
