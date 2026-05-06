package com.nexus.estates.service;

import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.dto.payment.PaymentMethod;
import com.nexus.estates.dto.payment.PaymentResponse;
import com.nexus.estates.dto.payment.PaymentStatus;
import com.nexus.estates.dto.payment.ProviderInfo;
import com.nexus.estates.dto.payment.RefundResult;
import com.nexus.estates.dto.payment.TransactionInfo;
import com.nexus.estates.entity.Payment;
import com.nexus.estates.repository.PaymentRepository;
import com.nexus.estates.service.invoicing.InvoiceOrchestrator;
import com.nexus.estates.service.interfaces.PaymentGatewayProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Serviço central de orquestração financeira da Nexus Estates
 * <p>
 *     Responsável por atuar como intermediário entre os controladores REST e a
 *     implementação concreta do gateway de pagamento (Strategy Pattern). Este serviço
 *     gerre o ciclo de vida dos pagamentos, persistindo os seus estados na base de dados
 *     e acionando o {@link InvoiceOrchestrator} para emissão automática de faturas
 * </p>
 */
@Service
public class FinancePaymentService {

    private final PaymentGatewayProvider paymentGatewayProvider;
    private final PaymentRepository paymentRepository;
    private final Proxy proxy;
    private final InvoiceOrchestrator invoiceOrchestrator;

    /**
     * Seleciona o provider ativo (Strategy) e orquestra operações de pagamento.
     *
     * @param paymentGatewayProviders lista de implementações disponíveis
     * @param activeProviderKey chave do provider ativo (ex: STRIPE)
     * @param paymentRepository repositório de pagamentos
     * @param proxy proxy para chamar serviços internos (booking-service)
     * @param invoiceOrchestrator orquestrador de faturação
     */
    public FinancePaymentService(
            List<PaymentGatewayProvider> paymentGatewayProviders,
            @Value("${payments.provider:STRIPE}") String activeProviderKey,
            PaymentRepository paymentRepository,
            Proxy proxy,
            InvoiceOrchestrator invoiceOrchestrator
    ) {
        this.paymentGatewayProvider = paymentGatewayProviders.stream()
                .filter(p -> p.providerKey() != null && p.providerKey().equalsIgnoreCase(activeProviderKey))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No PaymentGatewayProvider configured for key: " + activeProviderKey));
        this.paymentRepository = paymentRepository;
        this.proxy = proxy;
        this.invoiceOrchestrator = invoiceOrchestrator;
    }

    /**
     * Cria uma intenção de pagamento assíncrona (PaymentIntent)
     * <p>
     *     Utilizado para fluxos em que o utilizador vai preencher os dados do cartão no fronted
     * </p>
     * @param bookingId O ID da reserva a ser paga
     * @param amount O valor total da cobrança
     * @param currency A moeda da transação
     * @param paymentMethod O método de pagamento escolhido pelo utilizador
     * @param metadata metadata Informação extra para anexar á transação
     * @return {@link PaymentResponse} contendo o segredo do cliente para o fronted
     */
    @Transactional
    public PaymentResponse createPaymentIntent(Long bookingId, BigDecimal amount, String currency, PaymentMethod paymentMethod, Map<String, Object> metadata) {
        Map<String, Object> normalizedMetadata = metadata == null ? Map.of() : metadata;
        PaymentResponse response = paymentGatewayProvider.createPaymentIntent(amount, currency, bookingId.toString(), normalizedMetadata);

        Payment payment = new Payment();
        payment.setBookingId(bookingId);
        payment.setProvider(paymentGatewayProvider.providerKey());
        payment.setPaymentIntentId(response.transactionId());
        payment.setCurrency(currency);
        payment.setAmount(amount);
        payment.setStatus(response.status().name());
        paymentRepository.save(payment);

        return response;
    }


    /**
     * Confirma um pagamento que foi validado com sucesso pelo cliente
     * <p>
     *     Se o pagamento for bem sucedido, aciona a emissão de faturas e notifica
     *     o booking-service para trancar a reserva
     * </p>
     * @param bookingId O ID da reserva
     * @param paymentIntentId O ID da transação no gateway
     * @param metadata Dados adicionais da confirmação
     * @return O estado final atualizado da transação
     */
    @Transactional
    public PaymentResponse confirmPayment(Long bookingId, String paymentIntentId, Map<String, Object> metadata) {
        Map<String, Object> normalizedMetadata = metadata == null ? Map.of() : metadata;
        PaymentResponse response = paymentGatewayProvider.confirmPaymentIntent(paymentIntentId, normalizedMetadata);

        upsertPaymentFromResponse(bookingId, paymentIntentId, response);

        if (response instanceof PaymentResponse.Success success) {
            paymentRepository.findByPaymentIntentId(paymentIntentId)
                    .ifPresent(invoiceOrchestrator::ensureInvoiceForPayment);
            proxy.bookingClient().markPaymentSucceeded(
                    bookingId,
                    new NexusClients.PaymentSucceededRequest(success.transactionId(), success.providerTransactionId())
            );
        }

        return response;
    }


    /**
     * Processa um pagamento direto de forma síncrona
     * @param bookingId O ID da reserva
     * @param amount Valor a cobrar
     * @param currency Moeda a utilizar
     * @param paymentMethod Método de cobrança direto
     * @param metadata Informação extra
     * @return O resultado imediato (sucesso ou falha) da cobrança
     */
    @Transactional
    public PaymentResponse processDirectPayment(Long bookingId, BigDecimal amount, String currency, PaymentMethod paymentMethod, Map<String, Object> metadata) {
        Map<String, Object> normalizedMetadata = metadata == null ? Map.of() : metadata;
        PaymentResponse response = paymentGatewayProvider.processDirectPayment(amount, currency, bookingId.toString(), paymentMethod, normalizedMetadata);

        upsertPaymentFromResponse(bookingId, response.transactionId(), response);

        if (response instanceof PaymentResponse.Success success) {
            paymentRepository.findByPaymentIntentId(success.transactionId())
                    .ifPresent(invoiceOrchestrator::ensureInvoiceForPayment);
            proxy.bookingClient().markPaymentSucceeded(
                    bookingId,
                    new NexusClients.PaymentSucceededRequest(success.transactionId(), success.providerTransactionId())
            );
        }

        return response;
    }


    /**
     * Aciona o processo de reembolso no gateway de pagamentos
     * @param transactionId O ID da transação original
     * @param amount O montante a reembolsar (nulo para reembolso total)
     * @param currency A moeda associada
     * @param reason O motivo justificado para o estorno
     * @param metadata Dados extra para histórico
     * @return Resultado detalhado da operação de devolução de fundos
     */
    public RefundResult processRefund(String transactionId, BigDecimal amount, String currency, Optional<String> reason, Map<String, Object> metadata) {
        return paymentGatewayProvider.processRefund(transactionId, amount, currency, reason, metadata);
    }

    /**
     * Consulta todos os detalhes financeiros de uma transação diretamente no provedor
     * @param transactionId O ID da transação
     * @return {@link TransactionInfo} com os dados consolidados (cliente, montante, estado)
     */
    public TransactionInfo getTransactionDetails(String transactionId) {
        return paymentGatewayProvider.getTransactionDetails(transactionId);
    }


    /**
     * Consulta rápida do estado atual de uma transação
     * @param transactionId O ID único da transação
     * @return O estado atual {@link PaymentStatus}
     */
    public PaymentStatus getPaymentStatus(String transactionId) {
        return paymentGatewayProvider.getPaymentStatus(transactionId);
    }


    /**
     * Verifica se o gateway de pagamento atual suporta o método de pagamento pretendido
     * @param paymentMethod O método de pagamento a avaliar
     * @return true se o provedor ativo suportar este método
     */
    public boolean supportsPaymentMethod(PaymentMethod paymentMethod) {
        return paymentGatewayProvider.supportsPaymentMethod(paymentMethod);
    }


    /**
     * Obtém metadados gerais sobre o provedor ativo
     * <p>
     *     Útil para expor ao fronted capacidades como se suporta reembolsos ou qual a chave pública
     * </p>
     * @return {@link ProviderInfo} com detalhes técnicos do gateway em uso
     */
    public ProviderInfo getProviderInfo() {
        return paymentGatewayProvider.getProviderInfo();
    }

    /**
     * Atualiza/insere registo de pagamento com dados provenientes da resposta do provider.
     */
    private void upsertPaymentFromResponse(Long bookingId, String paymentIntentId, PaymentResponse response) {
        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId).orElseGet(Payment::new);
        payment.setBookingId(bookingId);
        payment.setProvider(paymentGatewayProvider.providerKey());
        payment.setPaymentIntentId(paymentIntentId);
        payment.setStatus(response.status().name());
        if (payment.getCurrency() == null) {
            String currency = extractCurrency(response);
            if (currency != null) {
                payment.setCurrency(currency);
            }
        }
        if (payment.getAmount() == null) {
            BigDecimal amount = extractAmount(response);
            if (amount != null) {
                payment.setAmount(amount);
            }
        }
        if (payment.getCurrency() == null || payment.getAmount() == null) {
            TransactionInfo transactionInfo = paymentGatewayProvider.getTransactionDetails(paymentIntentId);
            if (payment.getCurrency() == null) {
                payment.setCurrency(transactionInfo.currency());
            }
            if (payment.getAmount() == null) {
                payment.setAmount(transactionInfo.amount());
            }
        }
        paymentRepository.save(payment);
    }

    /**
     * Extrai a moeda do {@link PaymentResponse}, quando disponível.
     */
    private String extractCurrency(PaymentResponse response) {
        if (response instanceof PaymentResponse.Intent intent) return intent.currency();
        if (response instanceof PaymentResponse.Success success) return success.currency();
        return null;
    }

    /**
     * Extrai o montante do {@link PaymentResponse}, quando disponível.
     */
    private BigDecimal extractAmount(PaymentResponse response) {
        if (response instanceof PaymentResponse.Intent intent) return intent.amount();
        if (response instanceof PaymentResponse.Success success) return success.amount();
        return null;
    }
}
