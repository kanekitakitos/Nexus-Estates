package com.nexus.estates.common.messaging;

import java.time.LocalDateTime;

/**
 * Mensagem de evento disparada quando uma reserva é cancelada.
 * 
 * Este evento é publicado quando uma reserva é cancelada,
 * seja por iniciativa do utilizador, por reembolso ou por
 * outras razões de negócio.
 */
public record BookingCancelledMessage(
        Long bookingId,
        Long propertyId,
        Long userId,
        String reason,
        LocalDateTime cancelledAt
) {
    /**
     * Construtor que define automaticamente a data/hora atual.
     */
    public BookingCancelledMessage(Long bookingId, Long propertyId, Long userId, String reason) {
        this(bookingId, propertyId, userId, reason, LocalDateTime.now());
    }
}