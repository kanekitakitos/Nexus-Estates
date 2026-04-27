package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO que representa o payload para criação de uma Reserva Técnica (Bloqueio Manual).
 * <p>
 * Um bloqueio é uma reserva sem transação financeira, criado pelo proprietário para
 * impedir que determinadas datas fiquem disponíveis para reserva. Pode ser usado para:
 * <ul>
 *   <li>Uso pessoal do proprietário.</li>
 *   <li>Manutenção ou obras na propriedade.</li>
 *   <li>Qualquer outro motivo que impeça ocupação por hóspedes.</li>
 * </ul>
 * </p>
 * <p>
 * Ao contrário de {@link CreateBookingRequest}, não requer dados de hóspede nem
 * passa pelo fluxo de cotação do property-service, pois não existe pagamento envolvido.
 * O estado inicial é sempre {@code BLOCKED}.
 * </p>
 *
 * @param propertyId ID da propriedade a bloquear (Obrigatório).
 * @param checkInDate Data de início do bloqueio (hoje ou futuro).
 * @param checkOutDate Data de fim do bloqueio (estritamente futuro).
 * @param reason Motivo do bloqueio (opcional, para referência interna do proprietário).
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Schema(
        name = "CreateBlockRequest",
        description = "Payload para criação de uma Reserva Técnica (bloqueio manual sem transação financeira)."
)
public record CreateBlockRequest(

        @Schema(description = "ID da propriedade a bloquear", example = "42")
        @NotNull(message = "Property ID is required")
        Long propertyId,

        @Schema(description = "Data de início do bloqueio (hoje ou futura)", example = "2026-08-01")
        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in must be today or in the future")
        LocalDate checkInDate,

        @Schema(description = "Data de fim do bloqueio (estritamente futura)", example = "2026-08-15")
        @NotNull(message = "Check-out date is required")
        @Future(message = "Check-out must be in the future")
        LocalDate checkOutDate,

        @Schema(description = "Motivo do bloqueio (uso interno do proprietário)", example = "Obras de renovação")
        String reason
) {}
