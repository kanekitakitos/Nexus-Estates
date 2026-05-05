package com.nexus.estates.common.messaging;

import com.nexus.estates.common.enums.BookingStatus;
import java.time.LocalDateTime;

/**
 * Mensagem de evento disparada quando uma reserva é atualizada
 * <p>
 *     Este evento é publicado quando ocorre uma alteração significativa no estado de uma reserva,
 *     como confirmação de pagamento ou alteração nas datas
 * </p>
 * @param bookingId O identificador único da reserva atualizada
 * @param propertyId O identificador da propriedade associada
 * @param userId O identificador do hóspede
 * @param status O novo estado atualizado da reserva
 * @param reason O motivo que levou á atualização
 * @param updatedAt o timestamp exato de quando a atualização ocorreu
 *
 * @author Nexus Estates Team
 * @version 1.0
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
     * Construtor auxiliar que define automaticamente a data/hora atual da atulização
     * @param bookingId O identificador da reserva
     * @param propertyId O identificador da propriedade
     * @param userId O identificador do utilizador
     * @param status O novo estado da reserva
     * @param reason O motivo da alteração
     */
    public BookingUpdatedMessage(Long bookingId, Long propertyId, Long userId, BookingStatus status, String reason) {
        this(bookingId, propertyId, userId, status, reason, LocalDateTime.now());
    }
}