package com.rpa.chamados.service.impl;

import com.rpa.chamados.controller.dto.*;
import com.rpa.chamados.domain.model.Demand;
import com.rpa.chamados.domain.model.Project;
import com.rpa.chamados.domain.model.Robot;
import com.rpa.chamados.domain.model.User;
import com.rpa.chamados.domain.model.enums.DemandStatus;
import com.rpa.chamados.domain.model.enums.ServiceType;
import com.rpa.chamados.exception.DemandAlreadyExistsException;
import com.rpa.chamados.exception.DemandNotFoundException;
import com.rpa.chamados.exception.InvalidDemandUpdateException;
import com.rpa.chamados.repository.DemandRepository;
import com.rpa.chamados.repository.ProjectRepository;
import com.rpa.chamados.repository.RobotRepository;
import com.rpa.chamados.repository.UserRepository;
import com.rpa.chamados.service.DemandService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DemandServiceImpl implements DemandService {

    private final DemandRepository demandRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final RobotRepository robotRepository;

    public DemandServiceImpl(DemandRepository demandRepository,
                           ProjectRepository projectRepository,
                           UserRepository userRepository,
                           RobotRepository robotRepository) {
        this.demandRepository = demandRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.robotRepository = robotRepository;
    }

    @Override
    public DemandDto createDemand(CreateDemandRequest request) {
        if (demandRepository.existsByName(request.name())) {
            throw new DemandAlreadyExistsException("Demanda com o nome '" + request.name() + "' já existe");
        }

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new InvalidDemandUpdateException("Projeto com ID " + request.projectId() + " não encontrado"));

        User focalPoint = userRepository.findById(request.focalPointId())
                .orElseThrow(() -> new InvalidDemandUpdateException("Ponto focal com ID " + request.focalPointId() + " não encontrado"));

        User analyst = userRepository.findById(request.analystId())
                .orElseThrow(() -> new InvalidDemandUpdateException("Analista com ID " + request.analystId() + " não encontrado"));

        Robot robot = robotRepository.findById(request.robotId())
                .orElseThrow(() -> new InvalidDemandUpdateException("Robot com ID " + request.robotId() + " não encontrado"));

        Demand demand = Demand.builder()
                .name(request.name())
                .docHours(request.docHours())
                .devHours(request.devHours())
                .type(request.type())
                .description(request.description())
                .focalPoint(focalPoint)
                .analyst(analyst)
                .project(project)
                .status(request.status())
                .openedAt(request.openedAt())
                .startAt(request.startAt())
                .endsAt(request.endsAt())
                .ROI(request.roi())
                .robot(robot)
                .client(request.client())
                .service(request.service())
                .build();

        Demand savedDemand = demandRepository.save(demand);
        return convertToDto(savedDemand);
    }

    @Override
    public DemandDto updateDemand(UpdateDemandRequest request) {
        Demand existingDemand = demandRepository.findById(request.id())
                .orElseThrow(() -> new DemandNotFoundException("Demanda com ID " + request.id() + " não encontrada"));

        if (demandRepository.existsByNameAndIdNot(request.name(), request.id())) {
            throw new InvalidDemandUpdateException("Demanda com o nome '" + request.name() + "' já existe");
        }

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new InvalidDemandUpdateException("Projeto com ID " + request.projectId() + " não encontrado"));

        User focalPoint = userRepository.findById(request.focalPointId())
                .orElseThrow(() -> new InvalidDemandUpdateException("Ponto focal com ID " + request.focalPointId() + " não encontrado"));

        User analyst = userRepository.findById(request.analystId())
                .orElseThrow(() -> new InvalidDemandUpdateException("Analista com ID " + request.analystId() + " não encontrado"));

        Robot robot = robotRepository.findById(request.robotId())
                .orElseThrow(() -> new InvalidDemandUpdateException("Robot com ID " + request.robotId() + " não encontrado"));

        existingDemand.setName(request.name());
        existingDemand.setDocHours(request.docHours());
        existingDemand.setDevHours(request.devHours());
        existingDemand.setType(request.type());
        existingDemand.setDescription(request.description());
        existingDemand.setFocalPoint(focalPoint);
        existingDemand.setAnalyst(analyst);
        existingDemand.setProject(project);
        existingDemand.setStatus(request.status());
        existingDemand.setOpenedAt(request.openedAt());
        existingDemand.setStartAt(request.startAt());
        existingDemand.setEndsAt(request.endsAt());
        existingDemand.setEndedAt(request.endedAt());
        existingDemand.setROI(request.roi());
        existingDemand.setRobot(robot);
        existingDemand.setClient(request.client());
        existingDemand.setService(request.service());

        Demand savedDemand = demandRepository.save(existingDemand);
        return convertToDto(savedDemand);
    }

    @Override
    @Transactional(readOnly = true)
    public DemandDto findById(Long id) {
        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new DemandNotFoundException("Demanda com ID " + id + " não encontrada"));
        return convertToDto(demand);
    }

    @Override
    @Transactional(readOnly = true)
    public GetAllDemandsResponse getAllDemands() {
        List<Demand> demands = demandRepository.findAll();

        List<DemandDto> demandDtos = demands.stream()
                .map(this::convertToDto)
                .toList();

        return new GetAllDemandsResponse(demandDtos);
    }

    @Override
    public void deleteDemandById(Long id) {
        if (!demandRepository.existsById(id)) {
            throw new DemandNotFoundException("Demanda com ID " + id + " não encontrada");
        }
        demandRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandDto> findByStatus(DemandStatus status) {
        List<Demand> demands = demandRepository.findByStatus(status);
        return demands.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandDto> findByAnalystId(UUID analystId) {
        List<Demand> demands = demandRepository.findByAnalystId(analystId);
        return demands.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandDto> findByFocalPointId(UUID focalPointId) {
        List<Demand> demands = demandRepository.findByFocalPointId(focalPointId);
        return demands.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandDto> findByProjectId(Long projectId) {
        List<Demand> demands = demandRepository.findByProjectId(projectId);
        return demands.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandDto> findByType(ServiceType type) {
        List<Demand> demands = demandRepository.findByType(type.name());
        return demands.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandDto> findByClientId(Long clientId) {
        List<Demand> demands = demandRepository.findByClientId(clientId);
        return demands.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandDto> findByRobotId(Long robotId) {
        List<Demand> demands = demandRepository.findByRobotId(robotId);
        return demands.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandDto> findByClient(Long client) {
        List<Demand> demands = demandRepository.findByClient(client);
        return demands.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandDto> findByService(Long service) {
        List<Demand> demands = demandRepository.findByService(service);
        return demands.stream()
                .map(this::convertToDto)
                .toList();
    }

    private DemandDto convertToDto(Demand demand) {
        SubmitterInfoDto focalPointDto = null;
        if (demand.getFocalPoint() != null) {
            focalPointDto = new SubmitterInfoDto(
                    demand.getFocalPoint().getId().toString(),
                    demand.getFocalPoint().getName(),
                    demand.getFocalPoint().getEmail(),
                    demand.getFocalPoint().getPhone(),
                    demand.getFocalPoint().getDepartment(),
                    demand.getFocalPoint().getCompany(),
                    demand.getFocalPoint().getRole(),
                    demand.getFocalPoint().getIsActive(),
                    demand.getFocalPoint().getRequestsSubmitted(),
                    demand.getFocalPoint().getLastActivity(),
                    demand.getFocalPoint().getJoinedAt()
            );
        }

        SubmitterInfoDto analystDto = null;
        if (demand.getAnalyst() != null) {
            analystDto = new SubmitterInfoDto(
                    demand.getAnalyst().getId().toString(),
                    demand.getAnalyst().getName(),
                    demand.getAnalyst().getEmail(),
                    demand.getAnalyst().getPhone(),
                    demand.getAnalyst().getDepartment(),
                    demand.getAnalyst().getCompany(),
                    demand.getAnalyst().getRole(),
                    demand.getAnalyst().getIsActive(),
                    demand.getAnalyst().getRequestsSubmitted(),
                    demand.getAnalyst().getLastActivity(),
                    demand.getAnalyst().getJoinedAt()
            );
        }

        ProjectDto projectDto = null;
        if (demand.getProject() != null) {
            ClientDto clientDto = null;
            if (demand.getProject().getClient() != null) {
                clientDto = new ClientDto(
                        demand.getProject().getClient().getId(),
                        demand.getProject().getClient().getName(),
                        demand.getProject().getClient().getCreatedAt()
                );
            }

            projectDto = new ProjectDto(
                    demand.getProject().getId(),
                    demand.getProject().getName(),
                    demand.getProject().getDescription(),
                    demand.getProject().getArea(),
                    clientDto
            );
        }

        RobotDto robotDto = null;
        if (demand.getRobot() != null) {
            robotDto = new RobotDto(
                    demand.getRobot().getId(),
                    demand.getRobot().getName(),
                    demand.getRobot().getCell(),
                    demand.getRobot().getTechnology(),
                    demand.getRobot().getExecutionType(),
                    demand.getRobot().getClient(),
                    demand.getRobot().getRobotStatus()
            );
        }

        return new DemandDto(
                demand.getId(),
                demand.getName(),
                demand.getDocHours(),
                demand.getDevHours(),
                demand.getType(),
                demand.getDescription(),
                focalPointDto,
                analystDto,
                projectDto,
                demand.getStatus(),
                demand.getOpenedAt(),
                demand.getStartAt(),
                demand.getEndsAt(),
                demand.getEndedAt(),
                demand.getCreatedAt(),
                demand.getROI(),
                robotDto,
                demand.getClient(),
                demand.getService()
        );
    }
}