package com.nexus.estates.repository;

import com.nexus.estates.entity.RuleOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RuleOverrideRepository extends JpaRepository<RuleOverride, Long> {

    /**
     * Procura todas as sobreposições de regras que intersetam o intervalo de datas da reserva.
     */
    @Query("SELECT r FROM RuleOverride r WHERE r.property.id = :propertyId " +
           "AND NOT (r.endDate < :start OR r.startDate > :end)")
    List<RuleOverride> findOverlappingOverrides(
            @Param("propertyId") Long propertyId, 
            @Param("start") LocalDate start, 
            @Param("end") LocalDate end);
}
