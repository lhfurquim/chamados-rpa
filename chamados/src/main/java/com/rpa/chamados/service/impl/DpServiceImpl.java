package com.rpa.chamados.service.impl;

import com.rpa.chamados.repository.DpRepository;
import com.rpa.chamados.service.DpService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DpServiceImpl implements DpService {

    private final DpRepository repository;

    public DpServiceImpl(DpRepository repository) {
        this.repository = repository;
    }


    @Override
    public List<Map<String, Object>> findAllCells() {
        return repository.listarCelulas();
    }

    @Override
    public List<Map<String, Object>> findClientIdByCell(Integer cellId) {
        return repository.listarClientePorCelula(cellId);
    }

    @Override
    public List<Map<String, Object>> findServiceIdByCellAndClient(Integer cellId, Integer clientId) {
        return repository.listarServicoPorCelulaECliente(cellId, clientId);
    }
}
