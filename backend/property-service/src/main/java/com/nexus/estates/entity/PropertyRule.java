package com.nexus.estates.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * Entidade que define as regras operacionais de uma propriedade.
 * <p>
 * Estas regras são utilizadas pelo sistema para validar pedidos de reserva,
 * garantindo que cumprem os requisitos logísticos do proprietário, como
 * horários de check-in/out, duração da estadia e antecedência da reserva.
 * </p>
 * <p>
 * Existe uma relação <b>One-to-One</b> com a entidade {@link Property}.
 * </p>
 *
 * @author Nexus Estates Team
 */
@Entity
@Table(name = "property_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Define as regras operacionais de uma propriedade, como horários e duração da estadia.")
public class PropertyRule {

    /**
     * Identificador único da regra.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID único da regra", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    /**
     * A propriedade à qual esta regra pertence.
     * <p>
     * A relação é LAZY para otimizar o carregamento, uma vez que as regras
     * podem não ser necessárias em todos os contextos de carregamento da propriedade.
     * </p>
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @JsonIgnore
    private Property property;

    /**
     * Horário padrão para o check-in.
     */
    @Schema(description = "Horário padrão para o check-in (formato HH:mm)", example = "16:00")
    private LocalTime checkInTime;

    /**
     * Horário padrão para o check-out.
     */
    @Schema(description = "Horário padrão para o check-out (formato HH:mm)", example = "11:00")
    private LocalTime checkOutTime;

    /**
     * Número mínimo de noites permitido para uma reserva.
     */
    @Schema(description = "Número mínimo de noites permitido para uma reserva", example = "2")
    private Integer minNights;

    /**
     * Número máximo de noites permitido para uma reserva.
     */
    @Schema(description = "Número máximo de noites permitido para uma reserva", example = "30")
    private Integer maxNights;

    /**
     * Antecedência mínima, em dias, para que uma reserva possa ser efetuada.
     * <p>
     * Exemplo: Se o valor for 2, uma reserva para o dia 15 só pode ser feita
     * até ao final do dia 12.
     * </p>
     */
    @Schema(description = "Antecedência mínima, em dias, para efetuar uma reserva", example = "2")
    private Integer bookingLeadTimeDays;
}
