package com.nexus.estates.client;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.PostExchange;

/**
 * Declaração de clientes HTTP internos (Spring Declarative HTTP) para comunicação
 * síncrona entre microserviços Nexus Estates.
 *
 * <p>Este módulo define apenas o cliente necessário para notificar o booking-service
 * da confirmação de pagamento, mantendo baixo acoplamento e contratos explícitos.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
public interface NexusClients {
    /**
     * Cliente para interagir com endpoints internos do booking-service relacionados com pagamentos.
     */
    interface BookingClient {
        /**
         * Notifica o booking-service que um pagamento foi concluído com sucesso,
         * permitindo que a reserva seja confirmada e o calendário trancado.
         *
         * @param bookingId ID da reserva
         * @param request  payload com identificadores da transação
         */
        @PostExchange("/api/bookings/{bookingId}/payments/succeeded")
        void markPaymentSucceeded(@PathVariable Long bookingId, @RequestBody PaymentSucceededRequest request);
    }

    /**
     * Payload de notificação de pagamento bem sucedido.
     *
     * @param transactionId ID interno da transação (PaymentIntent)
     * @param providerTransactionId ID da transação no provedor (ex: Stripe)
     */
    record PaymentSucceededRequest(String transactionId, String providerTransactionId) {}
}

