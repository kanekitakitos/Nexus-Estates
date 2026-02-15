package com.nexus.estates.messaging;

import com.nexus.estates.entity.BookingStatus;

import java.util.UUID;

/**
 * Mensagem de integração emitida quando uma nova reserva é criada.
 *
 * <p>
 * Contém apenas os identificadores essenciais para que outros serviços possam
 * processar o fluxo assíncrono (pagamentos, sincronização externa, etc.) sem
 * depender da representação completa da entidade {@code Booking}.
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
        UUID bookingId,
        UUID propertyId,
        UUID userId,
        BookingStatus status
) {
}

