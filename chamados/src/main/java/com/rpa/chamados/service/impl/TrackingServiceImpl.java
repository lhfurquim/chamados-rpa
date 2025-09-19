package com.rpa.chamados.service.impl;

import com.rpa.chamados.controller.dto.*;
import com.rpa.chamados.domain.model.Demand;
import com.rpa.chamados.domain.model.User;
import com.rpa.chamados.domain.model.Tracking;
import com.rpa.chamados.domain.model.enums.DemandStatus;
import com.rpa.chamados.domain.model.enums.Nature;
import com.rpa.chamados.exception.InvalidTrackingCreationException;
import com.rpa.chamados.exception.InvalidTrackingUpdateException;
import com.rpa.chamados.exception.TrackingNotFoundException;
import com.rpa.chamados.repository.DemandRepository;
import com.rpa.chamados.repository.UserRepository;
import com.rpa.chamados.repository.TrackingRepository;
import com.rpa.chamados.service.DemandService;
import com.rpa.chamados.service.TrackingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TrackingServiceImpl implements TrackingService {

    private final TrackingRepository trackingRepository;
    private final DemandRepository demandRepository;
    private final UserRepository userRepository;
    private final DemandService demandService;

    public TrackingServiceImpl(TrackingRepository trackingRepository,
                             DemandRepository demandRepository,
                             UserRepository userRepository,
                             DemandService demandService) {
        this.trackingRepository = trackingRepository;
        this.demandRepository = demandRepository;
        this.userRepository = userRepository;
        this.demandService = demandService;
    }

    @Override
    public TrackingDto createTracking(CreateTrackingRequest request) {
        Demand demand = demandRepository.findById(request.demandId())
                .orElseThrow(() -> new InvalidTrackingCreationException("Demanda com ID " + request.demandId() + " não encontrada"));

        // Validação principal: não permitir criar tracking se demanda estiver bloqueada
        if (demand.getStatus() == DemandStatus.BLOCKED) {
            throw new InvalidTrackingCreationException("Não é possível criar tracking para demanda bloqueada");
        }

        User submitter = userRepository.findById(request.submitterId())
                .orElseThrow(() -> new InvalidTrackingCreationException("Submitter com ID " + request.submitterId() + " não encontrado"));

        Tracking tracking = Tracking.builder()
                .demand(demand)
                .hours(request.hours())
                .nature(request.nature())
                .description(request.description())
                .submittedAt(request.submittedAt())
                .submitter(submitter)
                .build();

        Tracking savedTracking = trackingRepository.save(tracking);
        return convertToDto(savedTracking);
    }

    @Override
    public TrackingDto updateTracking(UpdateTrackingRequest request) {
        Tracking existingTracking = trackingRepository.findById(request.id())
                .orElseThrow(() -> new TrackingNotFoundException("Tracking com ID " + request.id() + " não encontrado"));

        Demand demand = demandRepository.findById(request.demandId())
                .orElseThrow(() -> new InvalidTrackingUpdateException("Demanda com ID " + request.demandId() + " não encontrada"));

        User submitter = userRepository.findById(request.submitterId())
                .orElseThrow(() -> new InvalidTrackingUpdateException("Submitter com ID " + request.submitterId() + " não encontrado"));

        existingTracking.setDemand(demand);
        existingTracking.setHours(request.hours());
        existingTracking.setNature(request.nature());
        existingTracking.setDescription(request.description());
        existingTracking.setSubmittedAt(request.submittedAt());
        existingTracking.setSubmitter(submitter);

        Tracking savedTracking = trackingRepository.save(existingTracking);
        return convertToDto(savedTracking);
    }

    @Override
    @Transactional(readOnly = true)
    public TrackingDto findById(Long id) {
        Tracking tracking = trackingRepository.findById(id)
                .orElseThrow(() -> new TrackingNotFoundException("Tracking com ID " + id + " não encontrado"));
        return convertToDto(tracking);
    }

    @Override
    @Transactional(readOnly = true)
    public GetAllTrackingsResponse getAllTrackings() {
        List<Tracking> trackings = trackingRepository.findAll();

        List<TrackingDto> trackingDtos = trackings.stream()
                .map(this::convertToDto)
                .toList();

        return new GetAllTrackingsResponse(trackingDtos);
    }

    @Override
    public void deleteTrackingById(Long id) {
        if (!trackingRepository.existsById(id)) {
            throw new TrackingNotFoundException("Tracking com ID " + id + " não encontrado");
        }
        trackingRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackingDto> findByDemandId(Long demandId) {
        List<Tracking> trackings = trackingRepository.findByDemandIdOrderBySubmittedAtDesc(demandId);
        return trackings.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackingDto> findBySubmitterId(UUID submitterId) {
        List<Tracking> trackings = trackingRepository.findBySubmitterIdOrderBySubmittedAtDesc(submitterId);
        return trackings.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackingDto> findByNature(Nature nature) {
        List<Tracking> trackings = trackingRepository.findByNature(nature);
        return trackings.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Double getTotalHoursByDemandId(Long demandId) {
        Double total = trackingRepository.sumHoursByDemandId(demandId);
        return total != null ? total : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Double getTotalHoursByDemandIdAndNature(Long demandId, Nature nature) {
        Double total = trackingRepository.sumHoursByDemandIdAndNature(demandId, nature);
        return total != null ? total : 0.0;
    }

    private TrackingDto convertToDto(Tracking tracking) {
        // Usar o DemandService para obter DemandDto completo
        DemandDto demandDto = demandService.findById(tracking.getDemand().getId());

        SubmitterInfoDto submitterDto = new SubmitterInfoDto(
                tracking.getSubmitter().getId().toString(),
                tracking.getSubmitter().getName(),
                tracking.getSubmitter().getEmail(),
                tracking.getSubmitter().getPhone(),
                tracking.getSubmitter().getDepartment(),
                tracking.getSubmitter().getCompany(),
                tracking.getSubmitter().getRole(),
                tracking.getSubmitter().getIsActive(),
                tracking.getSubmitter().getRequestsSubmitted(),
                tracking.getSubmitter().getLastActivity(),
                tracking.getSubmitter().getJoinedAt()
        );

        return new TrackingDto(
                tracking.getId(),
                demandDto,
                tracking.getHours(),
                tracking.getNature(),
                tracking.getDescription(),
                tracking.getSubmittedAt(),
                submitterDto
        );
    }
}