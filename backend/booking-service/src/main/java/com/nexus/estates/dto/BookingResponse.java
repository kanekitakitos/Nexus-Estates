package com.nexus.estates.dto;

import com.nexus.estates.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

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
public record BookingResponse(
        UUID id,
        UUID propertyId,
        UUID userId,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        int guestCount,
        BigDecimal totalPrice,
        String currency,
        BookingStatus status
) {}
