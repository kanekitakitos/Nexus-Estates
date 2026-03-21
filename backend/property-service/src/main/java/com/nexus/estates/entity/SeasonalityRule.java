package com.nexus.estates.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * Entidade que representa uma regra de precificação dinâmica para uma propriedade.
 * <p>
 * Esta classe encapsula as regras de negócio para ajustes de preço baseados em:
 * <ul>
 *     <li><b>Sazonalidade:</b> Intervalos de datas (ex: Época Alta, Natal).</li>
 *     <li><b>Recorrência Semanal:</b> Dias específicos (ex: Fins de semana mais caros).</li>
 *     <li><b>Canais de Venda:</b> Ajustes para comissões de OTAs (ex: Airbnb, Booking).</li>
 * </ul>
 * </p>
 *
 * @author Nexus Estates Team
 */
@Entity
@Table(name = "seasonality_rules")
@Getter
@Setter
@Schema(description = "Regra de precificação dinâmica baseada em sazonalidade ou outros fatores")
public class SeasonalityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID único da regra", example = "1")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @NotNull(message = "A regra deve estar associada a uma propriedade")
    private Property property;

    @Schema(description = "Data de início da aplicação da regra", example = "2024-06-01")
    @Column(nullable = false)
    @NotNull(message = "A data de início é obrigatória")
    private LocalDate startDate;

    @Schema(description = "Data de fim da aplicação da regra", example = "2024-08-31")
    @Column(nullable = false)
    @NotNull(message = "A data de fim é obrigatória")
    private LocalDate endDate;

    @Schema(description = "Multiplicador a ser aplicado sobre o preço base (ex: 1.5 para +50%)", example = "1.5")
    @Column(nullable = false, precision = 5, scale = 2)
    @NotNull(message = "O modificador de preço é obrigatório")
    @DecimalMin(value = "0.01", message = "O modificador deve ser positivo")
    private BigDecimal priceModifier;

    @Enumerated(EnumType.STRING)
    @Schema(description = "Dia da semana específico para a regra (opcional)", example = "SATURDAY")
    private DayOfWeek dayOfWeek; // Opcional: para regras de fim de semana

    @Schema(description = "Canal de venda específico para a regra (opcional)", example = "Airbnb")
    private String channel; // Opcional: para regras por canal

    /**
     * Valida se o intervalo de datas é consistente.
     * <p>Este método é chamado automaticamente pelo JPA antes de persistir ou atualizar a entidade.</p>
     *
     * @throws IllegalStateException se a data de fim for anterior à data de início.
     */
    @PrePersist
    @PreUpdate
    private void validateDateRange() {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalStateException("A data de fim não pode ser anterior à data de início.");
        }
    }

    /**
     * Verifica se a regra é aplicável numa determinada data.
     *
     * @param date Data a verificar.
     * @return true se a data estiver dentro do intervalo e (se definido) corresponder ao dia da semana.
     */
    public boolean isActiveOn(LocalDate date) {
        if (date == null) return false;
        
        boolean inDateRange = !date.isBefore(startDate) && !date.isAfter(endDate);
        boolean matchesDayOfWeek = (dayOfWeek == null) || (date.getDayOfWeek() == dayOfWeek);
        
        return inDateRange && matchesDayOfWeek;
    }

    /**
     * Verifica se a regra é aplicável a um canal específico.
     *
     * @param targetChannel Nome do canal (ex: "Airbnb").
     * @return true se a regra não tiver canal definido (aplica a todos) ou se corresponder ao canal alvo.
     */
    public boolean matchesChannel(String targetChannel) {
        if (this.channel == null || this.channel.isEmpty()) {
            return true; // Regra genérica, aplica-se a todos os canais
        }
        return targetChannel != null && this.channel.equalsIgnoreCase(targetChannel);
    }
}