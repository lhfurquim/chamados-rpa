package com.rpa.chamados.domain.model;

import com.rpa.chamados.domain.model.enums.ServiceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING)
@Table(name = "requests")
@Entity
public abstract class Request {

    public Request() {
    }

    public Request(String description, String submittedBy, String celula, SubmitterInfo submitterInfo) {
        this.description = description;
        this.submittedBy = submittedBy;
        this.celula = celula;
        this.submitterInfo = submitterInfo;
    }

    @GeneratedValue(strategy = GenerationType.UUID)
    @Id
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    private String submittedBy;

    private String celula;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "submitter_info_id")
    private SubmitterInfo submitterInfo;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = true)
    private String robot;

    @Column(nullable = true)
    private String tecnologiaAutomacao;

    @Column(nullable = true)
    private String empresa;

    public abstract ServiceType getServiceType();

}
