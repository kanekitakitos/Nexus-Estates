package com.nexus.estates.common.messaging;

import java.time.LocalDateTime;

/**
 * Mensagem de evento disparada quando uam reserva é cancelada
 * <p>
 *     Este enevento é publicado quando uma reserva é cancelada, seja por iniciativa do utilziador,
 *     por reembolso ou por outras razões de negócio
 * </p>
 * @param bookingId O identificador único de reserva cancelada
 * @param propertyId O identificador da propriedade associada
 * @param userId O identificador do utilizador que tinha a reserva
 * @param reason O motivo do cancelamento
 * @param cancelledAt A data e hora exatas em que o cancelamento ocorreu
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public record BookingCancelledMessage(
        Long bookingId,
        Long propertyId,
        Long userId,
        String reason,
        LocalDateTime cancelledAt
) {

    /**
     * Construtor auxilair que define automaticamente a dta/gora atual do cancelamento
     *
     * @param bookingId o identificador da reserva
     * @param propertyId O identificador da propriedade
     * @param userId O identificador do utilizador
     * @param reason O motivo do cancelamento
     */
    public BookingCancelledMessage(Long bookingId, Long propertyId, Long userId, String reason) {
        this(bookingId, propertyId, userId, reason, LocalDateTime.now());
    }
}