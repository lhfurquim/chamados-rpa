package com.rpa.chamados.repository;

import com.rpa.chamados.domain.model.SubmitterInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmitterInfoRepository extends JpaRepository<SubmitterInfo, UUID> {
    
    Optional<SubmitterInfo> findByEmail(String email);
    
    List<SubmitterInfo> findByDepartment(String department);
    
    List<SubmitterInfo> findByCompany(String company);
    
    List<SubmitterInfo> findByIsActive(Boolean isActive);
    
    @Query("SELECT DISTINCT s.department FROM SubmitterInfo s")
    List<String> findDistinctDepartments();
    
    @Query("SELECT DISTINCT s.company FROM SubmitterInfo s")
    List<String> findDistinctCompanies();
    
    @Query("SELECT COUNT(s) FROM SubmitterInfo s WHERE s.isActive = :isActive")
    long countByIsActive(@Param("isActive") Boolean isActive);
    
    @Query("SELECT COUNT(s) FROM SubmitterInfo s WHERE s.joinedAt >= :startOfMonth")
    long countByCreatedAtGreaterThanEqual(@Param("startOfMonth") LocalDateTime startOfMonth);
    
    @Query("SELECT s.department as department, COUNT(s) as userCount FROM SubmitterInfo s WHERE s.department IS NOT NULL GROUP BY s.department ORDER BY COUNT(s) DESC")
    List<Object[]> getDepartmentUserCounts();
    
    @Query("""
        SELECT s.department as department, 
               COUNT(DISTINCT s.id) as userCount, 
               COUNT(r.id) as requestCount
        FROM SubmitterInfo s 
        LEFT JOIN Request r ON r.submitterInfo.id = s.id 
        WHERE s.department IS NOT NULL 
        GROUP BY s.department 
        ORDER BY COUNT(r.id) DESC, COUNT(DISTINCT s.id) DESC
        """)
    List<Object[]> getDepartmentStatistics();
}