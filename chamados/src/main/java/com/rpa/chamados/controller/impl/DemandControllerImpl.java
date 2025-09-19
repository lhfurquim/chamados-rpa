package com.rpa.chamados.controller.impl;

import com.rpa.chamados.controller.dto.CreateDemandRequest;
import com.rpa.chamados.controller.dto.DemandDto;
import com.rpa.chamados.controller.dto.GetAllDemandsResponse;
import com.rpa.chamados.controller.dto.UpdateDemandRequest;
import com.rpa.chamados.domain.model.enums.DemandStatus;
import com.rpa.chamados.domain.model.enums.ServiceType;
import com.rpa.chamados.domain.model.enums.UserRole;
import com.rpa.chamados.security.annotations.RequiresRole;
import com.rpa.chamados.service.DemandService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/api/demands")
public class DemandControllerImpl {

    private final DemandService service;

    public DemandControllerImpl(DemandService service) {
        this.service = service;
    }

    @PostMapping
    @RequiresRole({UserRole.ANALYST, UserRole.ADMIN})
    public ResponseEntity<DemandDto> createDemand(
            @RequestBody @Valid CreateDemandRequest request
    ) {
        log.info("Creating new demand with name: {}", request.name());
        DemandDto demand = service.createDemand(request);

        return ResponseEntity.status(201).body(demand);
    }

    @PutMapping
    @RequiresRole({UserRole.ANALYST, UserRole.ADMIN})
    public ResponseEntity<DemandDto> updateDemand(
            @RequestBody @Valid UpdateDemandRequest request
    ) {
        log.info("Updating demand with id: {}", request.id());
        DemandDto demand = service.updateDemand(request);

        return ResponseEntity.ok(demand);
    }

    @GetMapping
    public ResponseEntity<GetAllDemandsResponse> getAllDemands() {
        log.info("Fetching all demands");
        GetAllDemandsResponse demands = service.getAllDemands();

        return ResponseEntity.ok(demands);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandDto> getDemandById(
            @PathVariable Long id
    ) {
        log.info("Fetching demand with id: {}", id);
        DemandDto demand = service.findById(id);

        return ResponseEntity.ok(demand);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({UserRole.ANALYST, UserRole.ADMIN})
    public ResponseEntity<Void> deleteDemand(
            @PathVariable Long id
    ) {
        log.info("Deleting demand with id: {}", id);
        service.deleteDemandById(id);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DemandDto>> getDemandsByStatus(
            @PathVariable DemandStatus status
    ) {
        log.info("Fetching demands with status: {}", status);
        List<DemandDto> demands = service.findByStatus(status);

        return ResponseEntity.ok(demands);
    }

    @GetMapping("/analyst/{analystId}")
    public ResponseEntity<List<DemandDto>> getDemandsByAnalyst(
            @PathVariable UUID analystId
    ) {
        log.info("Fetching demands for analyst: {}", analystId);
        List<DemandDto> demands = service.findByAnalystId(analystId);

        return ResponseEntity.ok(demands);
    }

    @GetMapping("/focal-point/{focalPointId}")
    public ResponseEntity<List<DemandDto>> getDemandsByFocalPoint(
            @PathVariable UUID focalPointId
    ) {
        log.info("Fetching demands for focal point: {}", focalPointId);
        List<DemandDto> demands = service.findByFocalPointId(focalPointId);

        return ResponseEntity.ok(demands);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<DemandDto>> getDemandsByProject(
            @PathVariable Long projectId
    ) {
        log.info("Fetching demands for project: {}", projectId);
        List<DemandDto> demands = service.findByProjectId(projectId);

        return ResponseEntity.ok(demands);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<DemandDto>> getDemandsByType(
            @PathVariable ServiceType type
    ) {
        log.info("Fetching demands with type: {}", type);
        List<DemandDto> demands = service.findByType(type);

        return ResponseEntity.ok(demands);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<DemandDto>> getDemandsByClient(
            @PathVariable Long clientId
    ) {
        log.info("Fetching demands for client: {}", clientId);
        List<DemandDto> demands = service.findByClientId(clientId);

        return ResponseEntity.ok(demands);
    }

    @GetMapping("/robot/{robotId}")
    public ResponseEntity<List<DemandDto>> getDemandsByRobot(
            @PathVariable Long robotId
    ) {
        log.info("Fetching demands for robot: {}", robotId);
        List<DemandDto> demands = service.findByRobotId(robotId);

        return ResponseEntity.ok(demands);
    }

    @GetMapping("/client-field/{client}")
    public ResponseEntity<List<DemandDto>> getDemandsByClientField(
            @PathVariable Long client
    ) {
        log.info("Fetching demands for client field: {}", client);
        List<DemandDto> demands = service.findByClient(client);

        return ResponseEntity.ok(demands);
    }

    @GetMapping("/service/{service}")
    public ResponseEntity<List<DemandDto>> getDemandsByService(
            @PathVariable("service") Long serviceId
    ) {
        log.info("Fetching demands for service: {}", service);
        List<DemandDto> demands = service.findByService(serviceId);

        return ResponseEntity.ok(demands);
    }
}