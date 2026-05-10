package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import java.time.LocalTime;

/**
 * Payload de atualização parcial das regras operacionais (PATCH).
 *
 * <p>Ao contrário do {@code PUT /rules} (substituição total do DTO), este contrato permite
 * atualizar apenas alguns campos, mantendo os restantes inalterados.</p>
 *
 * <p>Notas:</p>
 * <ul>
 *   <li>Campos {@code null} não são aplicados (sem alteração).</li>
 *   <li>As validações de consistência (ex.: minNights &lt;= maxNights) são avaliadas após aplicar o patch.</li>
 * </ul>
 */
@Schema(description = "Payload para atualização parcial das regras operacionais de uma propriedade.")
public record PropertyRulePatchRequest(
        @Schema(description = "Horário de início do check-in", example = "16:00", type = "string", format = "time")
        LocalTime checkInTime,

        @Schema(description = "Horário limite para check-out", example = "11:00", type = "string", format = "time")
        LocalTime checkOutTime,

        @Min(1)
        @Schema(description = "Número mínimo de noites permitido por estadia", example = "2", minimum = "1")
        Integer minNights,

        @Min(1)
        @Schema(description = "Número máximo de noites permitido por estadia", example = "30", minimum = "1")
        Integer maxNights,

        @Min(0)
        @Schema(description = "Antecedência mínima (em dias) para aceitar uma reserva. 0 significa reserva para o próprio dia.", example = "2", minimum = "0")
        Integer bookingLeadTimeDays
) {}

