package com.nexus.estates.dto;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.entity.Booking;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de resposta contendo os detalhes de uma reserva confirmada.
 * <p>
 * Projetado para expor apenas os dados necessários ao frontend, ocultando detalhes internos
 * da entidade de persistência.
 * </p>
 *
 * @param id Identificador único da reserva.
 * @param propertyId ID da propriedade reservada.
 * @param userId ID do utilizador responsável.
 * @param checkInDate Data de entrada.
 * @param checkOutDate Data de saída.
 * @param guestCount Número de hóspedes.
 * @param totalPrice Preço total calculado.
 * @param currency Moeda do pagamento.
 * @param status Estado atual da reserva.
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Schema(
        name = "BookingResponse",
        description = "Representação de uma reserva exposta pela API para consumo do frontend."
)
public record BookingResponse(
        @Schema(description = "Identificador único da reserva", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        Long id,

        @Schema(description = "Identificador da propriedade reservada", example = "0f8fad5b-d9cb-469f-a165-70867728950e")
        Long propertyId,

        @Schema(description = "Identificador do utilizador responsável pela reserva", example = "7c9e6679-7425-40de-944b-e07fc1f90ae7")
        Long userId,

        @Schema(description = "Data de check-in da reserva", example = "2026-02-15")
        LocalDate checkInDate,

        @Schema(description = "Data de check-out da reserva", example = "2026-02-20")
        LocalDate checkOutDate,

        @Schema(description = "Número total de hóspedes incluídos na reserva", example = "2", minimum = "1")
        int guestCount,

        @Schema(description = "Valor total calculado para a estadia", example = "350.00")
        BigDecimal totalPrice,

        @Schema(description = "Moeda utilizada no pagamento", example = "EUR")
        String currency,

        @Schema(description = "Estado atual da reserva ao longo do seu ciclo de vida")
        BookingStatus status
) {

    /**
     * Construtor de conveniência para converter uma entidade {@link Booking} diretamente 
     * para o formato de resposta {@link BookingResponse}.
     *
     * @param booking A entidade de domínio contendo os dados persistidos da reserva.
     */
    public BookingResponse(Booking booking) {
        this(booking.getId(), booking.getPropertyId(), booking.getUserId(), booking.getCheckInDate(), booking.getCheckOutDate(), booking.getGuests(), booking.getTotalPrice(), booking.getCurrency(), booking.getStatus());
    }
}
