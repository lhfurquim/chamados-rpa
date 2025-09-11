package com.rpa.chamados.controller.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record UserTicketMetricsDto(
        String userId,
        String userName,
        String department,
        long totalTickets,
        Map<String, Long> ticketsByServiceType,
        LocalDateTime lastSubmission,
        double avgResponseTime
) {
}