package com.rpa.chamados.domain.model;

import com.rpa.chamados.domain.model.enums.Client;
import com.rpa.chamados.domain.model.enums.ExecutionType;
import com.rpa.chamados.domain.model.enums.RobotStatus;
import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "robots")
@Entity
public class Robot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String cell;

    private String technology;

    @Enumerated(EnumType.STRING)
    private ExecutionType executionType;

    @Enumerated(EnumType.STRING)
    private Client client;

    @Enumerated(EnumType.STRING)
    private RobotStatus robotStatus;

}
