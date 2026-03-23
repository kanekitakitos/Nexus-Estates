package com.nexus.estates.client;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.PostExchange;

import java.math.BigDecimal;
import java.util.Map;

import com.nexus.estates.dto.payment.PaymentMethod;
import com.nexus.estates.dto.payment.PaymentResponse;
import com.nexus.estates.dto.payment.PaymentStatus;
import com.nexus.estates.dto.payment.ProviderInfo;
import com.nexus.estates.dto.payment.RefundResult;
import com.nexus.estates.dto.payment.TransactionInfo;

/**
 * Definição centralizada das interfaces de comunicação HTTP com microsserviços externos.
 * <p>
 * Esta classe utiliza o recurso de <i>Declarative HTTP Clients</i> do Spring 6.
 * O ‘framework’ emprega o <b>Proxy Pattern</b> para gerar dinamicamente,
 * em tempo de execução, a implementação concreta destas ‘interfaces’, abstraindo a complexidade
 * das chamadas rede (REST).
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public interface NexusClients {


    /**
     * Cliente responsável pela comunicação com o serviço de Propriedades.
     */
    interface PropertyClient {

        /**
         * Obtém o preço atual de uma propriedade.
         * <p>
         * A implementação deste método é provida via Proxy pelo Spring Boot.
         * </p>
         *
         * @param id Identificador único da propriedade.
         * @return O preço da propriedade (BigDecimal).
         */
        @GetExchange("/api/properties/{id}/price")
        BigDecimal getPropertyPrice(@PathVariable Long id);

    }

    interface UserClient {

        /**
         * Obtém o e-mail de um utilizador específico.
         *
         * @param id Identificador único do utilizador.
         * @return O endereço de e-mail do utilizador.
         */
        @GetExchange("/api/users/{id}")
        String getUserEmail(@PathVariable("id") Long id);
    }

    /**
     * Cliente responsável pela comunicação com o finance-service.
     *
     * <p>O booking-service não processa pagamentos diretamente. Em vez disso, delega a criação,
     * confirmação e reembolsos ao finance-service, mantendo o domínio de reservas focado em:
     * disponibilidade, estado da reserva e publicação de eventos.</p>
     */
    interface FinanceClient {
        /**
         * Cria uma intenção de pagamento para uma reserva.
         *
         * @param bookingId ID da reserva
         * @param request payload de criação
         * @return resposta unificada do provider de pagamentos
         */
        @PostExchange("/api/finance/bookings/{bookingId}/payments/intent")
        PaymentResponse createPaymentIntent(@PathVariable Long bookingId, @RequestBody CreatePaymentIntentRequest request);

        /**
         * Confirma um PaymentIntent e, em caso de sucesso, dispara confirmação da reserva via callback interno.
         *
         * @param bookingId ID da reserva
         * @param request payload de confirmação
         * @return resposta unificada do provider de pagamentos
         */
        @PostExchange("/api/finance/bookings/{bookingId}/payments/confirm")
        PaymentResponse confirmPayment(@PathVariable Long bookingId, @RequestBody ConfirmPaymentRequest request);

        /**
         * Processa um pagamento direto (confirm imediato) para a reserva.
         *
         * @param bookingId ID da reserva
         * @param request payload de pagamento direto
         * @return resposta unificada do provider de pagamentos
         */
        @PostExchange("/api/finance/bookings/{bookingId}/payments/direct")
        PaymentResponse processDirectPayment(@PathVariable Long bookingId, @RequestBody DirectPaymentRequest request);

        /**
         * Processa reembolso no provider.
         *
         * @param bookingId ID da reserva
         * @param request payload de reembolso
         * @return resultado do reembolso
         */
        @PostExchange("/api/finance/bookings/{bookingId}/payments/refund")
        RefundResult refund(@PathVariable Long bookingId, @RequestBody RefundRequest request);

        /**
         * Retorna informação do provider de pagamento ativo.
         */
        @GetExchange("/api/finance/payments/provider")
        ProviderInfo getPaymentProviderInfo();

        /**
         * Obtém detalhes de uma transação no provider.
         *
         * @param transactionId ID da transação (ex: Stripe PaymentIntent)
         */
        @GetExchange("/api/finance/payments/transactions/{transactionId}")
        TransactionInfo getTransactionDetails(@PathVariable String transactionId);

        /**
         * Obtém o estado de uma transação no provider.
         */
        @GetExchange("/api/finance/payments/transactions/{transactionId}/status")
        PaymentStatus getPaymentStatus(@PathVariable String transactionId);

        /**
         * Verifica se um método é suportado pelo provider ativo.
         */
        @GetExchange("/api/finance/payments/methods/{paymentMethod}/supported")
        Map<String, Object> supportsPaymentMethod(@PathVariable PaymentMethod paymentMethod);
    }

    /**
     * Request para criar PaymentIntent no finance-service.
     */
    record CreatePaymentIntentRequest(BigDecimal amount, String currency, PaymentMethod paymentMethod, Map<String, Object> metadata) {}

    /**
     * Request para confirmar PaymentIntent no finance-service.
     */
    record ConfirmPaymentRequest(String paymentIntentId, Map<String, Object> metadata) {}

    /**
     * Request para pagamento direto no finance-service.
     */
    record DirectPaymentRequest(BigDecimal amount, String currency, PaymentMethod paymentMethod, Map<String, Object> metadata) {}

    /**
     * Request para reembolso no finance-service.
     */
    record RefundRequest(String transactionId, BigDecimal amount, String currency, String reason, Map<String, Object> metadata) {}
}
