package com.rpa.chamados.controller.impl;

import com.rpa.chamados.service.DpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api/dp")
public class DpControllerImpl {

    private final DpService service;

    public DpControllerImpl(DpService service) {
        this.service = service;
    }

    @GetMapping("/cell")
    public ResponseEntity<?> findAllCells(
    ) {
        return ResponseEntity.ok(service.findAllCells());
    }


    @GetMapping("/client/{cell}")
    public ResponseEntity<?> findClientByCell(
            @PathVariable("cell") Integer cell
    ) {
        return ResponseEntity.ok(service.findClientIdByCell(cell));
    }

    @GetMapping("/service/{cell}/{client}")
    public ResponseEntity<?> findServiceByClientAndCell(
            @PathVariable("cell") Integer cell,
            @PathVariable("client") Integer client
    ) {
        return ResponseEntity.ok(service.findServiceIdByCellAndClient(cell, client));
    }


}
