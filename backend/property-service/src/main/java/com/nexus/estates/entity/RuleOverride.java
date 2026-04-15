package com.nexus.estates.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

/**
 * Entidade que representa uma sobreposição de regras (Rule Override) para uma propriedade.
 * Permite definir regras específicas para períodos sazonais, anulando as regras base da propriedade.
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Entity
@Table(name = "rule_overrides")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Regras de sobreposição sazonais para uma propriedade")
public class RuleOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID único da sobreposição de regra", example = "1")
    private Long id;

    /**
     * Propriedade à qual esta sobreposição de regra se aplica.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    /**
     * Data de início do período em que esta regra de sobreposição está ativa.
     */
    @Column(name = "start_date", nullable = false)
    @Schema(description = "Data de início da validade da regra", example = "2024-08-01")
    private LocalDate startDate;

    /**
     * Data de fim do período em que esta regra de sobreposição está ativa.
     */
    @Column(name = "end_date", nullable = false)
    @Schema(description = "Data de fim da validade da regra", example = "2024-08-31")
    private LocalDate endDate;

    /**
     * Número mínimo de noites exigido para reservas neste período.
     * Se nulo, a regra base da propriedade é aplicada.
     */
    @Column(name = "min_nights_override")
    @Schema(description = "Número mínimo de noites (sobrepõe a regra base)", example = "7")
    private Integer minNightsOverride;

    /**
     * Conjunto de dias da semana permitidos para check-in neste período.
     * Se vazio ou nulo, todos os dias são permitidos (regra base).
     */
    @ElementCollection(targetClass = DayOfWeek.class)
    @CollectionTable(name = "rule_override_check_in_days", joinColumns = @JoinColumn(name = "rule_override_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    @Schema(description = "Dias da semana permitidos para check-in", example = "[\"SATURDAY\"]")
    private Set<DayOfWeek> allowedCheckInDays;

    /**
     * Conjunto de dias da semana permitidos para check-out neste período.
     * Se vazio ou nulo, todos os dias são permitidos (regra base).
     */
    @ElementCollection(targetClass = DayOfWeek.class)
    @CollectionTable(name = "rule_override_check_out_days", joinColumns = @JoinColumn(name = "rule_override_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    @Schema(description = "Dias da semana permitidos para check-out", example = "[\"SATURDAY\"]")
    private Set<DayOfWeek> allowedCheckOutDays;
}
