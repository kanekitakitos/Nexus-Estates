package com.nexus.estates.common.messaging;

import com.nexus.estates.common.enums.BookingStatus;

/**
 * Mensagem de integração recebida quando o estado de uma reserva é alterado.
 * <p>
 * Normalmente é emitida por serviços responsáveis por pagamentos ou
 * sincronização com plataformas externas, permitindo ao booking-service
 * atualizar o BookingStatus de forma assíncrona.
 * </p>
 * <p>
 * Tal como a mensagem de criação, pode ser encaminhada para uma Dead Letter
 * Queue ({@code booking.status.updated.dlq}) caso ocorra um erro durante o
 * processamento no consumidor.
 * </p>
 *
 * @param bookingId identificador único da reserva afetada.
 * @param status    novo estado da reserva após o processamento externo.
 * @param reason    motivo ou descrição adicional da alteração (ex.: "paid", "refunded").
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public record BookingStatusUpdatedMessage(
        Long bookingId,
        BookingStatus status,
        String reason
) {
}
