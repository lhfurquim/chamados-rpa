package com.rpa.chamados.controller.dto;

public record DepartmentStatDto(
        String department,
        Long userCount,
        Long requestCount
) {
}