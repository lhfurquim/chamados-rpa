package com.rpa.chamados.controller.dto;

import java.util.List;
import java.util.Map;

public record DashboardDataDto(
        CallStatsDto callStats,
        Long totalUsers,
        Long activeUsers,
        Long newUsersThisMonth,
        List<DepartmentStatDto> topDepartments,
        Map<String, Long> departmentStats,
        Map<String, Long> technologyStats,
        List<UserTicketMetricsDto> topUsersByTickets,
        List<RequestDto> recentCalls
) {
}