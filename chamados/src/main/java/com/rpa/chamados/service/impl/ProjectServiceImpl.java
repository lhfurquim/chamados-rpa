package com.rpa.chamados.service.impl;

import com.rpa.chamados.controller.dto.ClientDto;
import com.rpa.chamados.controller.dto.CreateProjectRequest;
import com.rpa.chamados.controller.dto.GetAllProjectsResponse;
import com.rpa.chamados.controller.dto.ProjectDto;
import com.rpa.chamados.controller.dto.UpdateProjectRequest;
import com.rpa.chamados.domain.model.Client;
import com.rpa.chamados.domain.model.Project;
import com.rpa.chamados.exception.InvalidProjectUpdateException;
import com.rpa.chamados.exception.ProjectAlreadyExistsException;
import com.rpa.chamados.exception.ProjectNotFoundException;
import com.rpa.chamados.repository.ClientRepository;
import com.rpa.chamados.repository.ProjectRepository;
import com.rpa.chamados.service.ProjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository, ClientRepository clientRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
    }

    @Override
    public ProjectDto createProject(CreateProjectRequest request) {
        if (projectRepository.existsByName(request.name())) {
            throw new ProjectAlreadyExistsException("Projeto com o nome '" + request.name() + "' já existe");
        }

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new InvalidProjectUpdateException("Cliente com ID " + request.clientId() + " não encontrado"));

        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .area(request.area())
                .client(client)
                .build();

        Project savedProject = projectRepository.save(project);
        return convertToDto(savedProject);
    }

    @Override
    public ProjectDto updateProject(UpdateProjectRequest request) {
        Project existingProject = projectRepository.findById(request.id())
                .orElseThrow(() -> new ProjectNotFoundException("Projeto com ID " + request.id() + " não encontrado"));

        if (projectRepository.existsByNameAndIdNot(request.name(), request.id())) {
            throw new InvalidProjectUpdateException("Projeto com o nome '" + request.name() + "' já existe");
        }

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new InvalidProjectUpdateException("Cliente com ID " + request.clientId() + " não encontrado"));

        existingProject.setName(request.name());
        existingProject.setDescription(request.description());
        existingProject.setArea(request.area());
        existingProject.setClient(client);

        Project savedProject = projectRepository.save(existingProject);
        return convertToDto(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDto findById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Projeto com ID " + id + " não encontrado"));
        return convertToDto(project);
    }

    @Override
    @Transactional(readOnly = true)
    public GetAllProjectsResponse getAllProjects() {
        List<Project> projects = projectRepository.findAll();

        List<ProjectDto> projectDtos = projects.stream()
                .map(this::convertToDto)
                .toList();

        return new GetAllProjectsResponse(projectDtos);
    }

    @Override
    public void deleteProjectById(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ProjectNotFoundException("Projeto com ID " + id + " não encontrado");
        }
        projectRepository.deleteById(id);
    }

    private ProjectDto convertToDto(Project project) {
        ClientDto clientDto = null;
        if (project.getClient() != null) {
            clientDto = new ClientDto(
                    project.getClient().getId(),
                    project.getClient().getName(),
                    project.getClient().getCreatedAt()
            );
        }

        return new ProjectDto(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getArea(),
                clientDto
        );
    }
}
