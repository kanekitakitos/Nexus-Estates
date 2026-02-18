package com.nexus.estates.messaging;

import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.service.ExternalSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Consumidor principal de eventos no Sync Service.
 * Escuta mensagens de criação de reserva, aciona a integração externa e
 * publica o resultado de volta na fila de atualização de status.
 * <p>
 * Em caso de erro não tratado durante o processamento, a mensagem é rejeitada
 * sem requeue pelo container configurado em {@link com.nexus.estates.config.RabbitMQConfig},
 * permitindo que o RabbitMQ a encaminhe automaticamente para a Dead Letter Queue
 * associada.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SyncConsumer {

    private final ExternalSyncService externalSyncService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${booking.events.exchange:booking.exchange}")
    private String bookingExchangeName;

    @Value("${booking.events.routing-key.status-updated:booking.status.updated}")
    private String bookingStatusUpdatedRoutingKey;

    /**
     * Processa o evento booking.created.
     *
     * @param message mensagem contendo os dados da reserva criada.
     */
    @RabbitListener(queues = "${booking.events.queue.created:booking.created.queue}")
    public void handleBookingCreated(BookingCreatedMessage message) {
        log.info("Recebido evento de criação de reserva: {}", message);

        // Processa (Simula integração externa)
        BookingStatusUpdatedMessage resultMessage = externalSyncService.processBooking(message);

        // Publica resultado (Status Updated)
        log.info("Publicando atualização de status: {} -> {}", resultMessage.bookingId(), resultMessage.status());
        rabbitTemplate.convertAndSend(bookingExchangeName, bookingStatusUpdatedRoutingKey, resultMessage);
    }
}
