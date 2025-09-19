package com.rpa.chamados.controller.dto;

import java.util.List;

public record GetAllTrackingsResponse(
        List<TrackingDto> trackings
) {
}