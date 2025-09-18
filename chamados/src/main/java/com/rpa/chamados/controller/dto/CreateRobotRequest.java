package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.Client;
import com.rpa.chamados.domain.model.enums.ExecutionType;
import com.rpa.chamados.domain.model.enums.RobotStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateRobotRequest(

        @NotBlank
        String name,

        @NotBlank
        String cell,

        @NotBlank
        String technology,

        @NotNull
        ExecutionType executionType,

        @NotNull
        Client client,

        @NotNull
        RobotStatus robotStatus
) {
}
