package com.rpa.chamados.controller.dto;


import java.util.List;

public record GetAllProjectsResponse(
        List<ProjectDto> projects
) {
}
