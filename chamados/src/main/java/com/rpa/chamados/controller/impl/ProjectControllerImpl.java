package com.rpa.chamados.controller.impl;

import com.rpa.chamados.controller.dto.CreateProjectRequest;
import com.rpa.chamados.controller.dto.GetAllProjectsResponse;
import com.rpa.chamados.controller.dto.ProjectDto;
import com.rpa.chamados.controller.dto.UpdateProjectRequest;
import com.rpa.chamados.domain.model.enums.UserRole;
import com.rpa.chamados.security.annotations.RequiresRole;
import com.rpa.chamados.service.ProjectService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/v1/api/projects")
public class ProjectControllerImpl {

    private final ProjectService service;

    public ProjectControllerImpl(ProjectService service) {
        this.service = service;
    }

    @PostMapping
    @RequiresRole(UserRole.ADMIN)
    public ResponseEntity<ProjectDto> createProject(
            @RequestBody @Valid CreateProjectRequest request
    ) {
        log.info("Creating new project with name: {}", request.name());
        ProjectDto project = service.createProject(request);

        return ResponseEntity.status(201).body(project);
    }

    @PutMapping
    @RequiresRole(UserRole.ADMIN)
    public ResponseEntity<ProjectDto> updateProject(
            @RequestBody @Valid UpdateProjectRequest request
    ) {
        log.info("Updating project with id: {}", request.id());
        ProjectDto project = service.updateProject(request);

        return ResponseEntity.ok(project);
    }

    @GetMapping
    public ResponseEntity<GetAllProjectsResponse> getAllProjects() {
        log.info("Fetching all projects");
        GetAllProjectsResponse projects = service.getAllProjects();

        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(
            @PathVariable Long id
    ) {
        log.info("Fetching project with id: {}", id);
        ProjectDto project = service.findById(id);

        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    @RequiresRole(UserRole.ADMIN)
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id
    ) {
        log.info("Deleting project with id: {}", id);
        service.deleteProjectById(id);

        return ResponseEntity.ok().build();
    }
}