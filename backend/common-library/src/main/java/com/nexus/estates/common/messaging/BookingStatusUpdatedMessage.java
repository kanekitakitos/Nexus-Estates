package com.nexus.estates.common.messaging;

import com.nexus.estates.common.enums.BookingStatus;
import java.util.UUID;

/**
 * Mensagem de integração recebida quando o estado de uma reserva é alterado.
 * <p>
 * Normalmente é emitida por serviços responsáveis por pagamentos ou
 * sincronização com plataformas externas, permitindo ao booking-service
 * atualizar o BookingStatus de forma assíncrona.
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
        UUID bookingId,
        BookingStatus status,
        String reason
) {
}
