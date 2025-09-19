package com.rpa.chamados.repository;

import com.rpa.chamados.domain.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    List<Client> findByNameContainingIgnoreCase(String name);
    Optional<Client> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}