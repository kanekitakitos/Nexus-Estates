package com.nexus.estates.repository;

import com.nexus.estates.entity.SeasonalityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repositório JPA para a gestão da entidade {@link SeasonalityRule}.
 * <p>
 * Fornece métodos otimizados para consultar regras de precificação dinâmica,
 * permitindo ao serviço de cálculo carregar apenas as regras relevantes para
 * um determinado contexto de reserva.
 * </p>
 *
 * @author Nexus Estates Team
 */
@Repository
public interface SeasonalityRuleRepository extends JpaRepository<SeasonalityRule, Long> {

    /**
     * Encontra todas as regras de sazonalidade aplicáveis a uma propriedade num determinado intervalo de datas.
     *
     * <p>Esta query implementa a lógica de deteção de sobreposição de intervalos (Interval Overlap).
     * Uma regra é considerada relevante se o seu intervalo [Start, End] intersetar
     * o intervalo da reserva [CheckIn, CheckOut] em pelo menos um dia.</p>
     *
     * <p>Fórmula de sobreposição: {@code Rule.Start <= CheckOut AND Rule.End >= CheckIn}</p>
     *
     * @param propertyId ID da propriedade a consultar.
     * @param start      Data de início da reserva (Check-in).
     * @param end        Data de fim da reserva (Check-out).
     * @return Lista de regras aplicáveis, ordenadas por data de início para facilitar o processamento.
     */
    @Query("SELECT r FROM SeasonalityRule r WHERE r.property.id = :propertyId " +
           "AND r.startDate <= :end AND r.endDate >= :start " +
           "ORDER BY r.startDate ASC")
    List<SeasonalityRule> findByPropertyIdAndDateRange(@Param("propertyId") Long propertyId,
                                                       @Param("start") LocalDate start,
                                                       @Param("end") LocalDate end);
}