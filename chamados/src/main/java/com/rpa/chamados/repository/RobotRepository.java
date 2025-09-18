package com.rpa.chamados.repository;

import com.rpa.chamados.domain.model.Robot;
import com.rpa.chamados.domain.model.enums.Client;
import com.rpa.chamados.domain.model.enums.ExecutionType;
import com.rpa.chamados.domain.model.enums.RobotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RobotRepository extends JpaRepository<Robot, Long> {

    List<Robot> findRobotByCell(String cell);
    List<Robot> findRobotByClient(Client client);
    List<Robot> findRobotByExecutionType(ExecutionType type);
    List<Robot> findRobotByRobotStatus(RobotStatus robotStatus);
}
