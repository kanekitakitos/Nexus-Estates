package com.nexus.estates.messaging;

import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.common.messaging.BookingUpdatedMessage;
import com.nexus.estates.common.messaging.BookingCancelledMessage;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.repository.BookingRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Componente responsável por orquestrar a comunicação de reservas com o RabbitMQ.
 *
 * <p>
 * Encapsula tanto o envio de eventos de criação de reserva
 * ({@link BookingCreatedMessage}) como a receção de atualizações de estado
 * ({@link BookingStatusUpdatedMessage}), atuando como uma fachada entre a
 * camada de domínio e a infraestrutura de mensageria.
 * </p>
 *
 * <p>
 * Em conjunto com a configuração de filas e Dead Letter Queues definida em
 * {@link com.nexus.estates.config.RabbitMQConfig}, garante que falhas de
 * processamento de mensagens de atualização de estado podem ser encaminhadas
 * para DLQ sem impactar o fluxo síncrono da API.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Service
public class BookingEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final BookingRepository bookingRepository;
    private final String bookingExchangeName;
    private final String bookingCreatedRoutingKey;
    private final String bookingUpdatedRoutingKey;
    private final String bookingCancelledRoutingKey;

    /**
     * Construtor principal utilizado pelo Spring para injeção de dependências.
     *
     * @param rabbitTemplate        cliente AMQP configurado com conversor JSON.
     * @param bookingRepository     repositório de acesso às reservas persistidas.
     * @param bookingExchangeName   nome lógico da exchange utilizada para eventos de reserva.
     * @param bookingCreatedRoutingKey routing key associada ao evento {@code booking.created}.
     */
    public BookingEventPublisher(RabbitTemplate rabbitTemplate,
                                 BookingRepository bookingRepository,
                                 @Value("${booking.events.exchange:booking.exchange}") String bookingExchangeName,
                                 @Value("${booking.events.routing-key.created:booking.created}") String bookingCreatedRoutingKey,
                                 @Value("${booking.events.routing-key.updated:booking.updated}") String bookingUpdatedRoutingKey,
                                 @Value("${booking.events.routing-key.cancelled:booking.cancelled}") String bookingCancelledRoutingKey) {
        this.rabbitTemplate = rabbitTemplate;
        this.bookingRepository = bookingRepository;
        this.bookingExchangeName = bookingExchangeName;
        this.bookingCreatedRoutingKey = bookingCreatedRoutingKey;
        this.bookingUpdatedRoutingKey = bookingUpdatedRoutingKey;
        this.bookingCancelledRoutingKey = bookingCancelledRoutingKey;
    }

    /**
     * Publica um evento indicando que uma nova reserva foi criada.
     *
     * @param message payload imutável contendo os identificadores essenciais da reserva.
     */
    public void publishBookingCreated(BookingCreatedMessage message) {
        rabbitTemplate.convertAndSend(bookingExchangeName, bookingCreatedRoutingKey, message);
    }

    /**
     * Publica um evento indicando que uma reserva foi atualizada.
     *
     * @param message payload imutável contendo os dados da atualização.
     */
    public void publishBookingUpdated(BookingUpdatedMessage message) {
        rabbitTemplate.convertAndSend(bookingExchangeName, bookingUpdatedRoutingKey, message);
    }

    /**
     * Publica um evento indicando que uma reserva foi cancelada.
     *
     * @param message payload imutável contendo os dados do cancelamento.
     */
    public void publishBookingCancelled(BookingCancelledMessage message) {
        rabbitTemplate.convertAndSend(bookingExchangeName, bookingCancelledRoutingKey, message);
    }

    /**
     * Processa eventos assíncronos de atualização de estado de reserva.
     *
     * <p>
     * Sempre que uma mensagem é recebida na fila configurada, o serviço tenta
     * localizar a reserva correspondente e atualiza o seu {@link Booking} com
     * o novo {@link com.nexus.estates.common.enums.BookingStatus}.
     * </p>
     *
     * @param message mensagem contendo o identificador da reserva e o novo estado.
     */
    @RabbitListener(queues = "${booking.events.queue.status-updated:booking.status.updated.queue}")
    public void handleStatusUpdated(BookingStatusUpdatedMessage message) {
        Optional<Booking> bookingOptional = bookingRepository.findById(message.bookingId());
        bookingOptional.ifPresent(booking -> {
            booking.setStatus(message.status());
            bookingRepository.save(booking);
        });
    }
}
