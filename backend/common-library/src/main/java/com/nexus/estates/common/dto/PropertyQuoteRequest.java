package com.nexus.estates.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO para solicitação de cotação e validação de reserva.
 *
 * @param checkInDate Data de entrada pretendida.
 * @param checkOutDate Data de saída pretendida.
 * @param guestCount Número de hóspedes.
 */
@Schema(description = "Pedido de validação e cotação de estadia")
public record PropertyQuoteRequest(
        @NotNull(message = "Check-in date is required")
        @FutureOrPresent
        @Schema(description = "Data de check-in", example = "2024-07-15")
        LocalDate checkInDate,

        @NotNull(message = "Check-out date is required")
        @Future
        @Schema(description = "Data de check-out", example = "2024-07-20")
        LocalDate checkOutDate,

        @Min(1)
        @Schema(description = "Número de hóspedes", example = "2")
        int guestCount
) {}