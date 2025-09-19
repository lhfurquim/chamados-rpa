package com.rpa.chamados.service;

import com.rpa.chamados.controller.dto.ClientDto;
import com.rpa.chamados.controller.dto.CreateClientRequest;
import com.rpa.chamados.controller.dto.UpdateClientRequest;
import com.rpa.chamados.domain.model.Client;

import java.util.List;

public interface ClientService {

    ClientDto createClient(CreateClientRequest request);
    ClientDto updateClient(UpdateClientRequest request);
    List<ClientDto> findAll();
    ClientDto findById(Long id);
    void deleteClient(Long id);
    List<ClientDto> findByName(String name);
}