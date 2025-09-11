package com.rpa.chamados.controller.dto;

import java.util.Map;

public record CallStatsDto(
        int total,
        ServiceTypeStatsDto byServiceType,
        Map<String, Integer> byCelula,
        Map<String, Integer> byDepartment,
        Map<String, Integer> byTechnology,
        int activeUsers,
        double avgResponseTime,
        RecentActivityDto recentActivity
) {
    
    public record ServiceTypeStatsDto(
            int melhoria,
            int sustentacao,
            int novoProjeto
    ) {}
    
    public record RecentActivityDto(
            int thisWeek,
            int lastWeek,
            double percentChange
    ) {}
}