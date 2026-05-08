package com.nexus.estates.repository;

import com.nexus.estates.entity.RuleOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repositório Spring Data JPA para a gestão de exceções ás regras (Rule Overrides)
 * <p>
 *     Permite consultar e persistir bloqueios de calendário, alterações de preço ou requisitos de noites mínimas
 *     para períodos de tempo específicos que se sobrepôem ás regras gerais da propriedade
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface RuleOverrideRepository extends JpaRepository<RuleOverride, Long> {

    /**
     * Procura todas as sobreposições de regras que intersetam o intervalo de datas de uma reserva
     * <p>
     *     Utiliza a lógica de interseção de períodos (StartA <= EndB e EndA >= StartB) sob a forma negada
     *     na Query para garantir que qualquer regra excecional que toque no período da estadia seja aplicada no motor de cotação
     * </p>
     * @param propertyId O identificador único da propriedade a analisar
     * @param start A data de check-in pretendida pelo hóspede
     * @param end A data de check-out pretendida pelo hóspede
     * @return Uma lista de exceções de regras aplicáveis a esse período específico
     */
    @Query("SELECT r FROM RuleOverride r WHERE r.property.id = :propertyId " +
           "AND NOT (r.endDate < :start OR r.startDate > :end)")
    List<RuleOverride> findOverlappingOverrides(
            @Param("propertyId") Long propertyId, 
            @Param("start") LocalDate start, 
            @Param("end") LocalDate end);
}
