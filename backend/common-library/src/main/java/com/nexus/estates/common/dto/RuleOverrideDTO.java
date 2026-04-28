package com.nexus.estates.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

/**
 * DTO para sobreposição de regras em períodos específicos.
 *
 * @author Nexus Estates Team
 */
@Schema(description = "Sobreposição de regras para um período específico")
public record RuleOverrideDTO(
        @Schema(description = "ID da regra (apenas para leitura)", example = "1")
        Long id,

        @Schema(description = "Data de início do período", example = "2024-08-01")
        LocalDate startDate,

        @Schema(description = "Data de fim do período", example = "2024-08-31")
        LocalDate endDate,

        @Schema(description = "Número mínimo de noites (Override)", example = "7")
        Integer minNightsOverride,

        @Schema(description = "Dias da semana permitidos para Check-in", example = "[\"SATURDAY\"]")
        Set<DayOfWeek> allowedCheckInDays,

        @Schema(description = "Dias da semana permitidos para Check-out", example = "[\"SATURDAY\"]")
        Set<DayOfWeek> allowedCheckOutDays
) {}