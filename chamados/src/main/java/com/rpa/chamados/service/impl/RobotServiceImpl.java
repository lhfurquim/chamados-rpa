package com.rpa.chamados.service.impl;

import com.rpa.chamados.controller.dto.CreateRobotRequest;
import com.rpa.chamados.controller.dto.RobotDto;
import com.rpa.chamados.controller.dto.UpdateRobotRequest;
import com.rpa.chamados.domain.model.Robot;
import com.rpa.chamados.domain.model.enums.Client;
import com.rpa.chamados.domain.model.enums.ExecutionType;
import com.rpa.chamados.domain.model.enums.RobotStatus;
import com.rpa.chamados.exception.InvalidRobotUpdateException;
import com.rpa.chamados.exception.RobotNotFoundException;
import com.rpa.chamados.repository.RobotRepository;
import com.rpa.chamados.service.RobotService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RobotServiceImpl implements RobotService {

    private final RobotRepository repository;

    public RobotServiceImpl(RobotRepository repository) {
        this.repository = repository;
    }

    @Override
    public RobotDto createRobot(CreateRobotRequest request) {
        Robot robot = Robot
                .builder()
                .name(request.name())
                .cell(request.cell())
                .technology(request.technology())
                .executionType(request.executionType())
                .client(request.client())
                .robotStatus(request.robotStatus())
                .build();


        repository.save(robot);

        return mapToDto(robot);
    }

    @Transactional
    @Override
    public RobotDto updateRobot(UpdateRobotRequest request) {
        if(request.id() == null) {
            throw new InvalidRobotUpdateException("Id cannot be null for update.");
        }

        Optional<Robot> robotFound = repository.findById(request.id());

        if(robotFound.isEmpty()) {
            throw new RobotNotFoundException("Could not found the robot for id: " + request.id());
        }

        if(request.name() != null) {
            robotFound.get().setName(request.name());
        }

        if(request.cell() != null) {
            robotFound.get().setCell(request.cell());
        }

        if(request.technology() != null) {
            robotFound.get().setTechnology(request.technology());
        }

        if(request.executionType() != null) {
            robotFound.get().setExecutionType(request.executionType());
        }

        if(request.client() != null) {
            robotFound.get().setClient(request.client());
        }

        if(request.robotStatus() != null) {
            robotFound.get().setRobotStatus(request.robotStatus());
        }

        repository.save(robotFound.get());


        return mapToDto(robotFound.get());
    }

    @Override
    public List<Robot> findAll() {
        return this.repository
                .findAll();
    }

    @Override
    public void deleteRobot(Long robotId) {
        if(robotId == null) {
            throw new InvalidRobotUpdateException("Id cannot be null for update.");
        }

        Optional<Robot> robotFound = repository.findById(robotId);

        if(robotFound.isEmpty()) {
            throw new RobotNotFoundException("Could not found the robot for id: " + robotId);
        }

        repository.delete(robotFound.get());
    }

    @Override
    public List<RobotDto> findByCell(String cell) {
        return this.repository
                .findRobotByCell(cell)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<RobotDto> findByClient(Client client) {
        return this.repository
                .findRobotByClient(client)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<RobotDto> findByExecutionType(ExecutionType type) {
        return this.repository
                .findRobotByExecutionType(type)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<RobotDto> findByStatus(RobotStatus robotStatus) {
        return this.repository
                .findRobotByRobotStatus(robotStatus)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private RobotDto mapToDto(Robot robot) {
        return new RobotDto(
                robot.getId(),
                robot.getName(),
                robot.getCell(),
                robot.getTechnology(),
                robot.getExecutionType(),
                robot.getClient(),
                robot.getRobotStatus()
        );
    }

}
