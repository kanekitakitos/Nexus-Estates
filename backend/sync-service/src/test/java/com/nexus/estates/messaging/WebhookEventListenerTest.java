package com.nexus.estates.messaging;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.service.chat.WebhookDispatcherService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.eq;

/**
 * Suite de testes unitários para a classe {@link WebhookEventListener}.
 * <p>
 * Verifica se os eventos capturados via RabbitMQ são corretamente redirecionados
 * para o {@link WebhookDispatcherService} com o nome de evento (tópico) correto
 * e com o seu respetivo payload preservado.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2023-11-01
 */
@ExtendWith(MockitoExtension.class)
class WebhookEventListenerTest {

    @Mock
    private WebhookDispatcherService dispatcherService;

    @InjectMocks
    private WebhookEventListener listener;

    /**
     * Testa o encaminhamento da mensagem de nova reserva.
     * <p>
     * Garante que quando o listener recebe uma mensagem do tipo {@link BookingCreatedMessage},
     * ele delega a ação de dispatching utilizando explicitamente o evento "booking.created".
     * </p>
     */
    @Test
    void onBookingCreated_ShouldDispatchEvent() {
        BookingCreatedMessage message = new BookingCreatedMessage(1L, 1L, 1L, BookingStatus.PENDING_PAYMENT);

        listener.onBookingCreated(message);

        Mockito.verify(dispatcherService).dispatch(eq("booking.created"), eq(message));
    }

    /**
     * Testa o encaminhamento da mensagem de atualização de estado de reserva.
     * <p>
     * Garante que a receção de uma {@link BookingStatusUpdatedMessage} resulta
     * num despacho apontado para o evento "booking.status.updated".
     * </p>
     */
    @Test
    void onBookingStatusUpdated_ShouldDispatchEvent() {
        BookingStatusUpdatedMessage message = new BookingStatusUpdatedMessage(1L, BookingStatus.CONFIRMED, "si");

        listener.onBookingStatusUpdated(message);

        Mockito.verify(dispatcherService).dispatch(eq("booking.status.updated"), eq(message));
    }
}