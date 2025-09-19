package com.rpa.chamados.service.impl;

import com.rpa.chamados.controller.dto.ClientDto;
import com.rpa.chamados.controller.dto.CreateClientRequest;
import com.rpa.chamados.controller.dto.UpdateClientRequest;
import com.rpa.chamados.domain.model.Client;
import com.rpa.chamados.exception.ClientAlreadyExistsException;
import com.rpa.chamados.exception.ClientNotFoundException;
import com.rpa.chamados.exception.InvalidClientUpdateException;
import com.rpa.chamados.repository.ClientRepository;
import com.rpa.chamados.service.ClientService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientServiceImpl implements ClientService {

    private final ClientRepository repository;

    public ClientServiceImpl(ClientRepository repository) {
        this.repository = repository;
    }

    @Override
    public ClientDto createClient(CreateClientRequest request) {
        if (repository.existsByNameIgnoreCase(request.name())) {
            throw new ClientAlreadyExistsException("Client with name '" + request.name() + "' already exists");
        }

        Client client = Client
                .builder()
                .name(request.name())
                .build();

        repository.save(client);

        return mapToDto(client);
    }

    @Transactional
    @Override
    public ClientDto updateClient(UpdateClientRequest request) {
        if (request.id() == null) {
            throw new InvalidClientUpdateException("ID cannot be null for update");
        }

        Optional<Client> clientFound = repository.findById(request.id());

        if (clientFound.isEmpty()) {
            throw new ClientNotFoundException("Could not find client for id: " + request.id());
        }

        if (request.name() != null) {
            if (repository.existsByNameIgnoreCase(request.name())) {
                Optional<Client> existingClient = repository.findByNameIgnoreCase(request.name());
                if (existingClient.isPresent() && !existingClient.get().getId().equals(request.id())) {
                    throw new ClientAlreadyExistsException("Client with name '" + request.name() + "' already exists");
                }
            }
            clientFound.get().setName(request.name());
        }

        repository.save(clientFound.get());

        return mapToDto(clientFound.get());
    }

    @Override
    public List<ClientDto> findAll() {
        return repository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public ClientDto findById(Long id) {
        Optional<Client> client = repository.findById(id);

        if (client.isEmpty()) {
            throw new ClientNotFoundException("Could not find client for id: " + id);
        }

        return mapToDto(client.get());
    }

    @Override
    public void deleteClient(Long id) {
        if (id == null) {
            throw new InvalidClientUpdateException("ID cannot be null for delete");
        }

        Optional<Client> clientFound = repository.findById(id);

        if (clientFound.isEmpty()) {
            throw new ClientNotFoundException("Could not find client for id: " + id);
        }

        repository.delete(clientFound.get());
    }

    @Override
    public List<ClientDto> findByName(String name) {
        return repository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private ClientDto mapToDto(Client client) {
        return new ClientDto(
                client.getId(),
                client.getName(),
                client.getCreatedAt()
        );
    }
}