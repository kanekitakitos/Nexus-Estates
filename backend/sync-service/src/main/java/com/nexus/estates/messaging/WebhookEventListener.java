package com.nexus.estates.messaging;

import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.service.chat.WebhookDispatcherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Listener de mensagens AMQP (RabbitMQ) que atua como porta de entrada de eventos
 * de domínio gerados por outros microserviços (por exemplo, booking-service) para
 * o sistema de Webhooks.
 * <p>
 * Ouve ativamente filas pré-definidas (ou fallback configurado via propriedades)
 * e redireciona os Data Transfer Objects de mensagens diretamente para o motor de
 * dispatching {@link WebhookDispatcherService}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2023-11-01
 * @see com.nexus.estates.service.chat.WebhookDispatcherService
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebhookEventListener {

    private final WebhookDispatcherService dispatcherService;

    /**
     * Gatilho acionado de forma assíncrona pelo broker de mensagens (RabbitMQ)
     * quando uma nova reserva acaba de ser criada e persistida por outro serviço.
     * <p>
     * Capta o evento a partir da fila especificada pela propriedade
     * {@code booking.events.queue.created} (assumindo um default caso não esteja definida),
     * extrai o conteúdo (já desserializado para {@link BookingCreatedMessage}) e
     * informa o Dispatcher que o evento "booking.created" ocorreu.
     * </p>
     *
     * @param message O objeto com os detalhes base da reserva criada.
     */
    @RabbitListener(queues = "${booking.webhooks.queue.created:booking.webhooks.created.queue}")
    public void onBookingCreated(BookingCreatedMessage message) {
        log.info("Evento capturado para Webhooks: booking.created (Reserva ID: {})", message.bookingId());

        // Passa o nome explícito do evento e o objeto para o motor despachar
        dispatcherService.dispatch("booking.created", message);
    }

    /**
     * Gatilho acionado de forma assíncrona quando ocorre uma mudança de estado de
     * uma reserva existente no sistema (ex.: CONFIRMADA, CANCELADA, etc.).
     * <p>
     * Ouve a fila configurada em {@code booking.events.queue.status-updated} e,
     * utilizando a mensagem {@link BookingStatusUpdatedMessage}, notifica o
     * Dispatcher Service sob o evento "booking.status.updated".
     * </p>
     *
     * @param message A mensagem contendo o ID da reserva afetada e o seu novo estado final.
     */
    @RabbitListener(queues = "${booking.webhooks.queue.status-updated:booking.webhooks.status.updated.queue}")
    public void onBookingStatusUpdated(BookingStatusUpdatedMessage message) {
        log.info("Evento capturado para Webhooks: booking.status.updated (Reserva ID: {} -> {})",
                message.bookingId(), message.status());

        dispatcherService.dispatch("booking.status.updated", message);
    }
}
