package com.rpa.chamados.repository;

import com.rpa.chamados.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    List<User> findByDepartment(String department);
    
    List<User> findByCompany(String company);
    
    List<User> findByIsActive(Boolean isActive);
    
    @Query("SELECT DISTINCT u.department FROM User u")
    List<String> findDistinctDepartments();

    @Query("SELECT DISTINCT u.company FROM User u")
    List<String> findDistinctCompanies();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = :isActive")
    long countByIsActive(@Param("isActive") Boolean isActive);

    @Query("SELECT COUNT(u) FROM User u WHERE u.joinedAt >= :startOfMonth")
    long countByCreatedAtGreaterThanEqual(@Param("startOfMonth") LocalDateTime startOfMonth);

    @Query("SELECT u.department as department, COUNT(u) as userCount FROM User u WHERE u.department IS NOT NULL GROUP BY u.department ORDER BY COUNT(u) DESC")
    List<Object[]> getDepartmentUserCounts();

    @Query("""
        SELECT u.department as department,
               COUNT(DISTINCT u.id) as userCount,
               COUNT(r.id) as requestCount
        FROM User u
        LEFT JOIN Request r ON r.user.id = u.id
        WHERE u.department IS NOT NULL
        GROUP BY u.department
        ORDER BY COUNT(r.id) DESC, COUNT(DISTINCT u.id) DESC
        """)
    List<Object[]> getDepartmentStatistics();
}