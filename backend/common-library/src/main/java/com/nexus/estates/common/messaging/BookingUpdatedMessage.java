package com.nexus.estates.common.messaging;

import com.nexus.estates.common.enums.BookingStatus;
import java.time.LocalDateTime;

/**
 * Mensagem de evento disparada quando uma reserva é atualizada.
 * 
 * Este evento é publicado quando ocorre uma alteração significativa
 * no estado de uma reserva, como confirmação de pagamento ou alterações
 * nas datas.
 */
public record BookingUpdatedMessage(
        Long bookingId,
        Long propertyId,
        Long userId,
        BookingStatus status,
        String reason,
        LocalDateTime updatedAt
) {
    /**
     * Construtor que define automaticamente a data/hora atual.
     */
    public BookingUpdatedMessage(Long bookingId, Long propertyId, Long userId, BookingStatus status, String reason) {
        this(bookingId, propertyId, userId, status, reason, LocalDateTime.now());
    }
}