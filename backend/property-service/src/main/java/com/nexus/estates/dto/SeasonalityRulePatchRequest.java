package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * Payload de atualização parcial de uma regra de sazonalidade (PATCH).
 *
 * <p>Permite ajustar apenas campos específicos (ex.: datas ou multiplicador),
 * evitando substituir toda a lista de sazonalidade da propriedade.</p>
 *
 * <p>Campos {@code null} não são aplicados (mantém-se o valor atual).</p>
 */
@Schema(description = "Payload para atualização parcial de uma regra de sazonalidade.")
public record SeasonalityRulePatchRequest(
        @Schema(description = "Data de início", example = "2026-06-01", type = "string", format = "date")
        LocalDate startDate,

        @Schema(description = "Data de fim", example = "2026-08-31", type = "string", format = "date")
        LocalDate endDate,

        @DecimalMin(value = "0.01")
        @Schema(description = "Multiplicador de preço", example = "1.20")
        BigDecimal priceModifier,

        @Schema(description = "Dia da semana (opcional)", example = "SATURDAY")
        DayOfWeek dayOfWeek,

        @Schema(description = "Canal (opcional)", example = "Airbnb")
        String channel
) {}

