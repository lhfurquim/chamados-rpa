package com.rpa.chamados.repository;

import com.rpa.chamados.domain.model.Demand;
import com.rpa.chamados.domain.model.enums.DemandStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DemandRepository extends JpaRepository<Demand, Long> {

    Optional<Demand> findByName(String name);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    List<Demand> findByStatus(DemandStatus status);

    @Query("SELECT d FROM Demand d WHERE d.analyst.id = :analystId")
    List<Demand> findByAnalystId(@Param("analystId") UUID analystId);

    @Query("SELECT d FROM Demand d WHERE d.focalPoint.id = :focalPointId")
    List<Demand> findByFocalPointId(@Param("focalPointId") UUID focalPointId);

    @Query("SELECT d FROM Demand d WHERE d.project.id = :projectId")
    List<Demand> findByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT d FROM Demand d WHERE d.type = :type")
    List<Demand> findByType(@Param("type") String type);

    @Query("SELECT d FROM Demand d WHERE d.project.client.id = :clientId")
    List<Demand> findByClientId(@Param("clientId") Long clientId);

    @Query("SELECT d FROM Demand d WHERE d.robot.id = :robotId")
    List<Demand> findByRobotId(@Param("robotId") Long robotId);

    List<Demand> findByClient(Long client);

    List<Demand> findByService(Long service);
}