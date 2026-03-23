package com.nexus.estates.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalTime;

/**
 * Objeto de Transferência de Dados (DTO) para as regras operacionais de uma propriedade.
 * <p>
 * Este record é partilhado entre o Property Service (que o produz) e o Booking Service (que o consome),
 * garantindo um contrato único para a definição de restrições de reserva.
 * </p>
 *
 * @param checkInTime Hora mais cedo permitida para check-in.
 * @param checkOutTime Hora limite para check-out.
 * @param minNights Número mínimo de noites por reserva.
 * @param maxNights Número máximo de noites por reserva.
 * @param bookingLeadTimeDays Antecedência mínima (em dias) requerida para efetuar uma reserva.
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Schema(description = "Regras operacionais e logísticas de uma propriedade")
public record PropertyRuleDTO(
        @Schema(description = "Horário de início do check-in", example = "16:00", type = "string", format = "time")
        LocalTime checkInTime,

        @Schema(description = "Horário limite para check-out", example = "11:00", type = "string", format = "time")
        LocalTime checkOutTime,

        @Schema(description = "Número mínimo de noites permitido por estadia", example = "2", minimum = "1")
        Integer minNights,

        @Schema(description = "Número máximo de noites permitido por estadia", example = "30")
        Integer maxNights,

        @Schema(description = "Antecedência mínima (em dias) para aceitar uma reserva. 0 significa reserva para o próprio dia.", example = "2", minimum = "0")
        Integer bookingLeadTimeDays
) {
}