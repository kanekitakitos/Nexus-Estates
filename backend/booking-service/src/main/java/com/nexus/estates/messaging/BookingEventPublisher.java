package com.nexus.estates.messaging;

import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
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
 * @author Nexus Estates Team
 * @version 1.0
 */
@Service
public class BookingEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final BookingRepository bookingRepository;
    private final String bookingExchangeName;
    private final String bookingCreatedRoutingKey;

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
                                 @Value("${booking.events.routing-key.created:booking.created}") String bookingCreatedRoutingKey) {
        this.rabbitTemplate = rabbitTemplate;
        this.bookingRepository = bookingRepository;
        this.bookingExchangeName = bookingExchangeName;
        this.bookingCreatedRoutingKey = bookingCreatedRoutingKey;
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
     * Processa eventos assíncronos de atualização de estado de reserva.
     *
     * <p>
     * Sempre que uma mensagem é recebida na fila configurada, o serviço tenta
     * localizar a reserva correspondente e atualiza o seu {@link Booking} com
     * o novo {@link com.nexus.estates.entity.BookingStatus}.
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
