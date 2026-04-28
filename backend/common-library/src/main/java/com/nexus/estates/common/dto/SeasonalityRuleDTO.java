package com.nexus.estates.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * DTO para exposição controlada de regras de sazonalidade.
 *
 * <p>Este contrato é consumido por outros serviços (ex: Booking Service) e pelo frontend,
 * evitando o acoplamento direto à entidade JPA.</p>
 *
 * @param id ID único da regra.
 * @param startDate Data de início.
 * @param endDate Data de fim.
 * @param priceModifier Multiplicador de preço (ex: 1.25 = +25%).
 * @param dayOfWeek Dia da semana opcional (ex: SATURDAY).
 * @param channel Canal opcional (ex: Airbnb).
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Schema(description = "Regra de sazonalidade aplicada ao cálculo de preço")
public record SeasonalityRuleDTO(
        @Schema(description = "ID da regra", example = "10")
        Long id,

        @Schema(description = "Data de início", example = "2026-06-01")
        LocalDate startDate,

        @Schema(description = "Data de fim", example = "2026-08-31")
        LocalDate endDate,

        @Schema(description = "Multiplicador de preço", example = "1.20")
        BigDecimal priceModifier,

        @Schema(description = "Dia da semana (opcional)", example = "SATURDAY")
        DayOfWeek dayOfWeek,

        @Schema(description = "Canal (opcional)", example = "Airbnb")
        String channel
) {}

