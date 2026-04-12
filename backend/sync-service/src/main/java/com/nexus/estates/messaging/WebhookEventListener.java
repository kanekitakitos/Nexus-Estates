package com.nexus.estates.messaging;

import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.service.chat.WebhookDispatcherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Escuta eventos do domínio no RabbitMQ e reencaminha-os para o motor de Webhooks.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebhookEventListener {

    private final WebhookDispatcherService dispatcherService;

    /**
     * Gatilho para quando uma nova reserva é criada.
     */
    @RabbitListener(queues = "${booking.events.queue.created:booking.created.queue}")
    public void onBookingCreated(BookingCreatedMessage message) {
        log.info("Evento capturado para Webhooks: booking.created (Reserva ID: {})", message.bookingId());

        // Passa o nome do evento e o objeto para o motor despachar
        dispatcherService.dispatch("booking.created", message);
    }

    /**
     * Gatilho para quando o estado de uma reserva muda (Confirmada/Cancelada).
     */
    @RabbitListener(queues = "${booking.events.queue.status-updated:booking.status.updated.queue}")
    public void onBookingStatusUpdated(BookingStatusUpdatedMessage message) {
        log.info("Evento capturado para Webhooks: booking.status.updated (Reserva ID: {} -> {})",
                message.bookingId(), message.status());

        dispatcherService.dispatch("booking.status.updated", message);
    }
}