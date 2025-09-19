package com.rpa.chamados.domain.model;

import com.rpa.chamados.domain.model.enums.DemandStatus;
import com.rpa.chamados.domain.model.enums.ServiceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Setter
@Getter
@Table(name = "demands")
public class Demand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Double docHours;

    private Double devHours;

    @Enumerated(EnumType.STRING)
    private ServiceType type;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "focal_point_id")
    private User focalPoint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyst_id")
    private User analyst;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Enumerated(EnumType.STRING)
    private DemandStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demand_id")
    private Robot robot;

    private Long client;

    private Long service;

    private LocalDate openedAt;

    private LocalDate startAt;

    private LocalDate endsAt;

    private LocalDate endedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private String ROI;

}
