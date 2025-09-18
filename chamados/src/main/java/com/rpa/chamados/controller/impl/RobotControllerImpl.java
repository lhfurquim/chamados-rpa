package com.rpa.chamados.controller.impl;

import com.rpa.chamados.controller.dto.CreateRobotRequest;
import com.rpa.chamados.controller.dto.RobotDto;
import com.rpa.chamados.controller.dto.UpdateRobotRequest;
import com.rpa.chamados.domain.model.Robot;
import com.rpa.chamados.domain.model.enums.Client;
import com.rpa.chamados.domain.model.enums.ExecutionType;
import com.rpa.chamados.domain.model.enums.RobotStatus;
import com.rpa.chamados.service.RobotService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v1/api/robots")
public class RobotControllerImpl {

    private final RobotService service;

    public RobotControllerImpl(RobotService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RobotDto> createRobot(
            @RequestBody @Valid CreateRobotRequest request
    ) {
        RobotDto r = service.createRobot(request);

        return ResponseEntity.status(201).body(r);
    }

    @PutMapping
    public ResponseEntity<RobotDto> updateRobot(
            @RequestBody @Valid UpdateRobotRequest request
    ) {
        RobotDto r = service.updateRobot(request);

        return ResponseEntity.ok(r);
    }

    @GetMapping
    public ResponseEntity<List<Robot>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/cell/{cell}")
    public ResponseEntity<List<RobotDto>> getByCell(
            @PathVariable String cell
    ){
        List<RobotDto> robots = service.findByCell(cell);

        log.info("Chamou a rota de celula");

        return ResponseEntity.ok(robots);
    }

    @GetMapping("/client/{client}")
    public ResponseEntity<List<RobotDto>> getByClient(
            @PathVariable Client client
    ) {
        List<RobotDto> robots = service.findByClient(client);

        return ResponseEntity.ok(robots);
    }

    @GetMapping("/execution/{execution}")
    public ResponseEntity<List<RobotDto>> getByExecution(
            @PathVariable ExecutionType execution
    ) {
        List<RobotDto> robots = service.findByExecutionType(execution);

        return ResponseEntity.ok(robots);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<RobotDto>> getByStatus(
            @PathVariable RobotStatus robotStatus
    ) {
        List<RobotDto> robots = service.findByStatus(robotStatus);

        return ResponseEntity.ok(robots);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        service.deleteRobot(id);

        return ResponseEntity.ok().build();
    }

}
