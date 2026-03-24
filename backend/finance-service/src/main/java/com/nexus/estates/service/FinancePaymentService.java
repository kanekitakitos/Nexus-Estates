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

    public RefundResult processRefund(String transactionId, BigDecimal amount, String currency, Optional<String> reason, Map<String, Object> metadata) {
        return paymentGatewayProvider.processRefund(transactionId, amount, currency, reason, metadata);
    }

    public TransactionInfo getTransactionDetails(String transactionId) {
        return paymentGatewayProvider.getTransactionDetails(transactionId);
    }

    public PaymentStatus getPaymentStatus(String transactionId) {
        return paymentGatewayProvider.getPaymentStatus(transactionId);
    }

    public boolean supportsPaymentMethod(PaymentMethod paymentMethod) {
        return paymentGatewayProvider.supportsPaymentMethod(paymentMethod);
    }

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
