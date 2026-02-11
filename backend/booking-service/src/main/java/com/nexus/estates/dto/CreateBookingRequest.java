package com.nexus.estates.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO que representa o payload para criação de uma nova reserva.
 * <p>
 * Utiliza Java Records para imutabilidade e concisão. Inclui validações de Bean Validation
 * para garantir a integridade dos dados logo à entrada da API.
 * </p>
 *
 * @param propertyId ID da propriedade a reservar (Obrigatório).
 * @param userId ID do utilizador que efetua a reserva (Obrigatório).
 * @param checkInDate Data de entrada (Deve ser hoje ou no futuro).
 * @param checkOutDate Data de saída (Deve ser estritamente no futuro).
 * @param guestCount Número de hóspedes.
 *
 * @author Nexus Estates Team
 */
public record CreateBookingRequest(
        @NotNull(message = "Property ID is required")
        UUID propertyId,

        @NotNull(message = "User ID is required")
        UUID userId,

        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in must be today or in the future")
        LocalDate checkInDate,

        @NotNull(message = "Check-out date is required")
        @Future(message = "Check-out must be in the future")
        LocalDate checkOutDate,

        @Min(value = 1, message = "At least 1 guest is required")
        int guestCount
) {}