package com.rpa.chamados.controller.impl;

import com.rpa.chamados.controller.dto.ClientDto;
import com.rpa.chamados.controller.dto.CreateClientRequest;
import com.rpa.chamados.controller.dto.UpdateClientRequest;
import com.rpa.chamados.domain.model.enums.UserRole;
import com.rpa.chamados.security.annotations.RequiresRole;
import com.rpa.chamados.service.ClientService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v1/api/clients")
public class ClientControllerImpl {

    private final ClientService service;

    public ClientControllerImpl(ClientService service) {
        this.service = service;
    }

    @PostMapping
    @RequiresRole(UserRole.ADMIN)
    public ResponseEntity<ClientDto> createClient(
            @RequestBody @Valid CreateClientRequest request
    ) {
        log.info("Creating new client with name: {}", request.name());
        ClientDto client = service.createClient(request);

        return ResponseEntity.status(201).body(client);
    }

    @PutMapping
    @RequiresRole(UserRole.ADMIN)
    public ResponseEntity<ClientDto> updateClient(
            @RequestBody @Valid UpdateClientRequest request
    ) {
        log.info("Updating client with id: {}", request.id());
        ClientDto client = service.updateClient(request);

        return ResponseEntity.ok(client);
    }

    @GetMapping
    public ResponseEntity<List<ClientDto>> getAllClients() {
        log.info("Fetching all clients");
        List<ClientDto> clients = service.findAll();

        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientDto> getClientById(
            @PathVariable Long id
    ) {
        log.info("Fetching client with id: {}", id);
        ClientDto client = service.findById(id);

        return ResponseEntity.ok(client);
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<List<ClientDto>> getClientsByName(
            @PathVariable String name
    ) {
        log.info("Searching clients with name containing: {}", name);
        List<ClientDto> clients = service.findByName(name);

        return ResponseEntity.ok(clients);
    }

    @DeleteMapping("/{id}")
    @RequiresRole(UserRole.ADMIN)
    public ResponseEntity<Void> deleteClient(
            @PathVariable Long id
    ) {
        log.info("Deleting client with id: {}", id);
        service.deleteClient(id);

        return ResponseEntity.ok().build();
    }
}