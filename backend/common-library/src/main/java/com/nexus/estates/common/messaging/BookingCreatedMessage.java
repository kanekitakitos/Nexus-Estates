package com.nexus.estates.common.messaging;

import com.nexus.estates.common.enums.BookingStatus;

/**
 * Mensagem de integração emitida quando uma nova reserva é criada.
 * <p>
 * Contém apenas os identificadores essenciais para que outros serviços possam
 * processar o fluxo assíncrono (pagamentos, sincronização externa, etc.) sem
 * depender da representação completa da entidade Booking.
 * </p>
 * <p>
 * Esta mensagem é publicada inicialmente na fila principal de trabalho
 * ({@code booking.created.queue}) e, em caso de falha de processamento,
 * pode ser automaticamente encaminhada pelo broker para a respetiva
 * Dead Letter Queue ({@code booking.created.dlq}).
 * </p>
 *
 * @param bookingId  identificador único da reserva.
 * @param propertyId identificador da propriedade (casa) associada à reserva.
 * @param userId     identificador do utilizador que efetuou a reserva.
 * @param status     estado atual da reserva no momento da emissão do evento.
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public record BookingCreatedMessage(
        Long bookingId,
        Long propertyId,
        Long userId,
        BookingStatus status
) {
}
