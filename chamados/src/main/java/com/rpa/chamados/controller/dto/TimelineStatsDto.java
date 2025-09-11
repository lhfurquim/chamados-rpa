package com.rpa.chamados.controller.dto;

import java.time.LocalDate;
import java.util.Map;

public record TimelineStatsDto(
        String period,
        LocalDate startDate,
        LocalDate endDate,
        long totalRequests,
        Map<String, Long> byServiceType
) {}