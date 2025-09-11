package com.rpa.chamados.repository;

import com.rpa.chamados.domain.model.Request;
import com.rpa.chamados.domain.model.MelhoriaRequest;
import com.rpa.chamados.domain.model.SustentacaoRequest;
import com.rpa.chamados.domain.model.NovoProjetoRequest;
import com.rpa.chamados.domain.model.enums.ServiceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequestRepository extends JpaRepository<Request, UUID> {
    
    @Query("SELECT r FROM Request r WHERE " +
           "((:serviceType = 'MELHORIA' AND TYPE(r) = MelhoriaRequest) OR " +
           "(:serviceType = 'SUSTENTACAO' AND TYPE(r) = SustentacaoRequest) OR " +
           "(:serviceType = 'NOVO_PROJETO' AND TYPE(r) = NovoProjetoRequest))")
    List<Request> findByServiceType(@Param("serviceType") String serviceType);
    
    List<Request> findBySubmittedBy(String submittedBy);
    
    List<Request> findByCelula(String celula);
    
    List<Request> findByTecnologiaAutomacao(String tecnologiaAutomacao);
    
    @Query("SELECT r FROM Request r WHERE r.submitterInfo.department = :department")
    List<Request> findByDepartment(@Param("department") String department);
    
    @Query("SELECT r FROM Request r WHERE r.submitterInfo.company = :company")
    List<Request> findByCompany(@Param("company") String company);
    
    @Query("SELECT r FROM Request r WHERE r.createdAt >= :dateFrom AND r.createdAt <= :dateTo")
    List<Request> findByCreatedAtBetween(@Param("dateFrom") LocalDateTime dateFrom, @Param("dateTo") LocalDateTime dateTo);
    
    @Query("SELECT COUNT(r) FROM Request r WHERE TYPE(r) = :requestType")
    long countByServiceType(@Param("requestType") Class<? extends Request> requestType);
    
    @Query("SELECT DISTINCT r.celula FROM Request r WHERE r.celula IS NOT NULL")
    List<String> findDistinctCelulaCodes();
    
    @Query("SELECT DISTINCT r.tecnologiaAutomacao FROM Request r WHERE r.tecnologiaAutomacao IS NOT NULL")
    List<String> findDistinctTechnologies();
    
    @Query("SELECT DISTINCT r.submitterInfo.department FROM Request r")
    List<String> findDistinctDepartments();
    
    @Query("SELECT r FROM Request r WHERE " +
           "(:search IS NULL OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.robot) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.tecnologiaAutomacao) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.empresa) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.submitterInfo.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.submitterInfo.department) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:serviceType IS NULL OR " +
           "((:serviceType = 'MELHORIA' AND TYPE(r) = MelhoriaRequest) OR " +
           "(:serviceType = 'SUSTENTACAO' AND TYPE(r) = SustentacaoRequest) OR " +
           "(:serviceType = 'NOVO_PROJETO' AND TYPE(r) = NovoProjetoRequest))) AND " +
           "(:department IS NULL OR r.submitterInfo.department = :department) AND " +
           "(:technology IS NULL OR r.tecnologiaAutomacao = :technology)")
    Page<Request> searchRequests(@Param("search") String search,
                                @Param("serviceType") String serviceType,
                                @Param("department") String department,
                                @Param("technology") String technology,
                                Pageable pageable);
    
    @Query("SELECT COUNT(r) FROM Request r WHERE r.createdAt >= :weekAgo")
    long countRequestsThisWeek(@Param("weekAgo") LocalDateTime weekAgo);
    
    @Query("SELECT r FROM Request r ORDER BY r.createdAt DESC")
    Page<Request> findAllOrderByCreatedAtDesc(Pageable pageable);
}
