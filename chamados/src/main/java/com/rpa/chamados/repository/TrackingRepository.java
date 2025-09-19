package com.rpa.chamados.repository;

import com.rpa.chamados.domain.model.Tracking;
import com.rpa.chamados.domain.model.enums.Nature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrackingRepository extends JpaRepository<Tracking, Long> {

    @Query("SELECT t FROM Tracking t WHERE t.demand.id = :demandId ORDER BY t.submittedAt DESC")
    List<Tracking> findByDemandIdOrderBySubmittedAtDesc(@Param("demandId") Long demandId);

    @Query("SELECT t FROM Tracking t WHERE t.submitter.id = :submitterId ORDER BY t.submittedAt DESC")
    List<Tracking> findBySubmitterIdOrderBySubmittedAtDesc(@Param("submitterId") UUID submitterId);

    List<Tracking> findByNature(Nature nature);

    @Query("SELECT t FROM Tracking t WHERE t.demand.id = :demandId")
    List<Tracking> findByDemandId(@Param("demandId") Long demandId);

    @Query("SELECT t FROM Tracking t WHERE t.submitter.id = :submitterId")
    List<Tracking> findBySubmitterId(@Param("submitterId") UUID submitterId);

    @Query("SELECT SUM(t.hours) FROM Tracking t WHERE t.demand.id = :demandId")
    Double sumHoursByDemandId(@Param("demandId") Long demandId);

    @Query("SELECT SUM(t.hours) FROM Tracking t WHERE t.demand.id = :demandId AND t.nature = :nature")
    Double sumHoursByDemandIdAndNature(@Param("demandId") Long demandId, @Param("nature") Nature nature);
}