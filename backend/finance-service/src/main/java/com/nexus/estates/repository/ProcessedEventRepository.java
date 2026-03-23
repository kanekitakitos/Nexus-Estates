package com.nexus.estates.repository;

import com.nexus.estates.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para eventos processados (idempotência).
 */
@Repository
public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, Long> {
}
