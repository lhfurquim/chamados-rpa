package com.rpa.chamados.service;

import com.rpa.chamados.controller.dto.CreateDemandRequest;
import com.rpa.chamados.controller.dto.DemandDto;
import com.rpa.chamados.controller.dto.GetAllDemandsResponse;
import com.rpa.chamados.controller.dto.UpdateDemandRequest;
import com.rpa.chamados.domain.model.enums.DemandStatus;
import com.rpa.chamados.domain.model.enums.ServiceType;

import java.util.List;
import java.util.UUID;

public interface DemandService {

    DemandDto createDemand(CreateDemandRequest request);
    DemandDto updateDemand(UpdateDemandRequest request);
    GetAllDemandsResponse getAllDemands();
    DemandDto findById(Long id);
    void deleteDemandById(Long id);
    List<DemandDto> findByStatus(DemandStatus status);
    List<DemandDto> findByAnalystId(UUID analystId);
    List<DemandDto> findByFocalPointId(UUID focalPointId);
    List<DemandDto> findByProjectId(Long projectId);
    List<DemandDto> findByType(ServiceType type);
    List<DemandDto> findByClientId(Long clientId);
    List<DemandDto> findByRobotId(Long robotId);
    List<DemandDto> findByClient(Long client);
    List<DemandDto> findByService(Long service);

}