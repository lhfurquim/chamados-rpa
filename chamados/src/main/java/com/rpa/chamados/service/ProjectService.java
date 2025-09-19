package com.rpa.chamados.service;

import com.rpa.chamados.controller.dto.CreateProjectRequest;
import com.rpa.chamados.controller.dto.GetAllProjectsResponse;
import com.rpa.chamados.controller.dto.ProjectDto;
import com.rpa.chamados.controller.dto.UpdateProjectRequest;

public interface ProjectService {

    ProjectDto createProject(CreateProjectRequest request);
    ProjectDto updateProject(UpdateProjectRequest request);
    GetAllProjectsResponse getAllProjects();
    ProjectDto findById(Long id);
    void deleteProjectById(Long id);

}
