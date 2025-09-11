package com.rpa.chamados.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "submitter_info")
@Entity
public class SubmitterInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String role = "Usuário";

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Integer requestsSubmitted = 0;

    private LocalDateTime lastActivity;

    private LocalDateTime joinedAt;

    @PrePersist
    public void prePersist() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
        lastActivity = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        lastActivity = LocalDateTime.now();
    }
}