package com.nexus.estates.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

/**
 * DTO para sobreposição de regras em períodos específicos
 * <p>
 *     permite definir exceções ás regras normais de uma propriedade
 *     (ex: exigir um mínimo de 7 noites no mês de Agosto, ou permitir check-in apenas aos Sábados)
 * </p>
 * @param id O identificador único da regra de sobreposição (apenas para leitura)
 * @param startDate A data a apartir da qual esta sobreposição entra em vigor
 * @param endDate A data em que esta sobreposição deixa de ter efeito
 * @param minNightsOverride O novo número mínimo de noites exigido para este período específico
 * @param allowedCheckInDays Conjunto de dias da semana em que o check-in é permitido
 * @param allowedCheckOutDays Conjunto de dias da semana em que o check-out é permitido
 *
 * @author Nexus EStates Team
 * @version 1.0
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