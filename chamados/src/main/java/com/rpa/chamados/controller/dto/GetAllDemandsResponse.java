package com.rpa.chamados.controller.dto;

import java.util.List;

public record GetAllDemandsResponse(
        List<DemandDto> demands
) {
}