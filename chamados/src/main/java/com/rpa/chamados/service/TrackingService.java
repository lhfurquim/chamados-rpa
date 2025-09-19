package com.rpa.chamados.service;

import com.rpa.chamados.controller.dto.CreateTrackingRequest;
import com.rpa.chamados.controller.dto.GetAllTrackingsResponse;
import com.rpa.chamados.controller.dto.TrackingDto;
import com.rpa.chamados.controller.dto.UpdateTrackingRequest;
import com.rpa.chamados.domain.model.enums.Nature;

import java.util.List;
import java.util.UUID;

public interface TrackingService {

    TrackingDto createTracking(CreateTrackingRequest request);
    TrackingDto updateTracking(UpdateTrackingRequest request);
    GetAllTrackingsResponse getAllTrackings();
    TrackingDto findById(Long id);
    void deleteTrackingById(Long id);
    List<TrackingDto> findByDemandId(Long demandId);
    List<TrackingDto> findBySubmitterId(UUID submitterId);
    List<TrackingDto> findByNature(Nature nature);
    Double getTotalHoursByDemandId(Long demandId);
    Double getTotalHoursByDemandIdAndNature(Long demandId, Nature nature);

}