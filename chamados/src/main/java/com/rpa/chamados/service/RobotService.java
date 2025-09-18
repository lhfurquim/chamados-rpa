package com.rpa.chamados.service;

import com.rpa.chamados.controller.dto.CreateRobotRequest;
import com.rpa.chamados.controller.dto.RobotDto;
import com.rpa.chamados.controller.dto.UpdateRobotRequest;
import com.rpa.chamados.domain.model.Robot;
import com.rpa.chamados.domain.model.enums.Client;
import com.rpa.chamados.domain.model.enums.ExecutionType;
import com.rpa.chamados.domain.model.enums.RobotStatus;

import java.util.List;

public interface RobotService {

    RobotDto createRobot(CreateRobotRequest request);
    RobotDto updateRobot(UpdateRobotRequest request);
    List<Robot> findAll();
    void deleteRobot(Long robotId);
    List<RobotDto> findByCell(String cell);
    List<RobotDto> findByClient(Client client);
    List<RobotDto> findByExecutionType(ExecutionType type);
    List<RobotDto> findByStatus(RobotStatus robotStatus);

}
