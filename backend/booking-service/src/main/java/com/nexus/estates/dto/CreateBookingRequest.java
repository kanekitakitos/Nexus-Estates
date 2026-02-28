package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.entity.Booking;

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
 * @version 1.0
 */
@Schema(
        name = "CreateBookingRequest",
        description = "Payload de entrada utilizado para solicitar a criação de uma nova reserva."
)
public record CreateBookingRequest(
        @Schema(description = "Identificador único da propriedade a ser reservada", example = "0f8fad5b-d9cb-469f-a165-70867728950e")
        @NotNull(message = "Property ID is required")
        Long propertyId,

        @Schema(description = "Identificador único do utilizador que efetua a reserva", example = "7c9e6679-7425-40de-944b-e07fc1f90ae7")
        @NotNull(message = "User ID is required")
        Long userId,

        @Schema(description = "Data de check-in (hoje ou uma data futura)", example = "2026-02-15")
        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in must be today or in the future")
        LocalDate checkInDate,

        @Schema(description = "Data de check-out (deve ser estritamente no futuro)", example = "2026-02-20")
        @NotNull(message = "Check-out date is required")
        @Future(message = "Check-out must be in the future")
        LocalDate checkOutDate,

        @Schema(description = "Número total de hóspedes para a reserva", example = "2", minimum = "1")
        @Min(value = 1, message = "At least 1 guest is required")
        int guestCount
) {


    /**
     * Converte um pedido de criação de reserva numa entidade {@link Booking}.
     * <p>
     * Define o estado inicial da reserva como {@code PENDING_PAYMENT}.
     * </p>
     *
     * @return A entidade {@link Booking} pronta a ser persistida (sem ID gerado ainda).
     */
    public Booking toEntity()
    {
                return Booking.builder()
                        .propertyId(this.propertyId())
                        .userId(this.userId())
                        .checkInDate(this.checkInDate())
                        .checkOutDate(this.checkOutDate())
                        .guests(this.guestCount())
                        .status(BookingStatus.PENDING_PAYMENT) // Estado inicial obrigatório
                        .build();
    }
}
