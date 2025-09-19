package com.rpa.chamados.controller.impl;

import com.rpa.chamados.controller.dto.CreateTrackingRequest;
import com.rpa.chamados.controller.dto.GetAllTrackingsResponse;
import com.rpa.chamados.controller.dto.TrackingDto;
import com.rpa.chamados.controller.dto.UpdateTrackingRequest;
import com.rpa.chamados.domain.model.enums.Nature;
import com.rpa.chamados.domain.model.enums.UserRole;
import com.rpa.chamados.security.annotations.RequiresRole;
import com.rpa.chamados.service.TrackingService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/api/trackings")
public class TrackingControllerImpl {

    private final TrackingService service;

    public TrackingControllerImpl(TrackingService service) {
        this.service = service;
    }

    @PostMapping
    @RequiresRole({UserRole.DEVELOP, UserRole.ADMIN})
    public ResponseEntity<TrackingDto> createTracking(
            @RequestBody @Valid CreateTrackingRequest request
    ) {
        log.info("Creating new tracking for demand: {}", request.demandId());
        TrackingDto tracking = service.createTracking(request);

        return ResponseEntity.status(201).body(tracking);
    }

    @PutMapping
    @RequiresRole({UserRole.DEVELOP, UserRole.ADMIN})
    public ResponseEntity<TrackingDto> updateTracking(
            @RequestBody @Valid UpdateTrackingRequest request
    ) {
        log.info("Updating tracking with id: {}", request.id());
        TrackingDto tracking = service.updateTracking(request);

        return ResponseEntity.ok(tracking);
    }

    @GetMapping
    public ResponseEntity<GetAllTrackingsResponse> getAllTrackings() {
        log.info("Fetching all trackings");
        GetAllTrackingsResponse trackings = service.getAllTrackings();

        return ResponseEntity.ok(trackings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrackingDto> getTrackingById(
            @PathVariable Long id
    ) {
        log.info("Fetching tracking with id: {}", id);
        TrackingDto tracking = service.findById(id);

        return ResponseEntity.ok(tracking);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({UserRole.DEVELOP, UserRole.ADMIN})
    public ResponseEntity<Void> deleteTracking(
            @PathVariable Long id
    ) {
        log.info("Deleting tracking with id: {}", id);
        service.deleteTrackingById(id);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/demand/{demandId}")
    public ResponseEntity<List<TrackingDto>> getTrackingsByDemand(
            @PathVariable Long demandId
    ) {
        log.info("Fetching trackings for demand: {}", demandId);
        List<TrackingDto> trackings = service.findByDemandId(demandId);

        return ResponseEntity.ok(trackings);
    }

    @GetMapping("/submitter/{submitterId}")
    public ResponseEntity<List<TrackingDto>> getTrackingsBySubmitter(
            @PathVariable UUID submitterId
    ) {
        log.info("Fetching trackings for submitter: {}", submitterId);
        List<TrackingDto> trackings = service.findBySubmitterId(submitterId);

        return ResponseEntity.ok(trackings);
    }

    @GetMapping("/nature/{nature}")
    public ResponseEntity<List<TrackingDto>> getTrackingsByNature(
            @PathVariable Nature nature
    ) {
        log.info("Fetching trackings with nature: {}", nature);
        List<TrackingDto> trackings = service.findByNature(nature);

        return ResponseEntity.ok(trackings);
    }

    @GetMapping("/demand/{demandId}/total-hours")
    public ResponseEntity<Double> getTotalHoursByDemand(
            @PathVariable Long demandId
    ) {
        log.info("Fetching total hours for demand: {}", demandId);
        Double totalHours = service.getTotalHoursByDemandId(demandId);

        return ResponseEntity.ok(totalHours);
    }

    @GetMapping("/demand/{demandId}/total-hours/{nature}")
    public ResponseEntity<Double> getTotalHoursByDemandAndNature(
            @PathVariable Long demandId,
            @PathVariable Nature nature
    ) {
        log.info("Fetching total hours for demand: {} and nature: {}", demandId, nature);
        Double totalHours = service.getTotalHoursByDemandIdAndNature(demandId, nature);

        return ResponseEntity.ok(totalHours);
    }
}