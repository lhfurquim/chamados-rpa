package com.rpa.chamados.domain.model;

import com.rpa.chamados.domain.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
@Entity
public class User {

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

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role")
    private UserRole userRole = UserRole.DEFAULT;

    @Column(nullable = false)
    private Boolean isActive = true;

    private String avatarUrl;

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