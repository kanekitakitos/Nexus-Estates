package com.nexus.estates.service;

import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.dto.payment.PaymentStatus;
import com.nexus.estates.entity.Payment;
import com.nexus.estates.entity.ProcessedEvent;
import com.nexus.estates.exception.PaymentProcessingException;
import com.nexus.estates.repository.PaymentRepository;
import com.nexus.estates.repository.ProcessedEventRepository;
import com.nexus.estates.service.invoicing.InvoiceOrchestrator;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Serviço responsável por capturar, validar e reagir aos eventos (Webhooks) enviados pelo Stripe
 * <p>
 *     Implementa verificações de segurança obrigatórias (validação de assinaturas cripotográficas)
 *     e garante a <b>Idempotência</b> das operações de rede: verifica na tabela {@code processed_events}
 *     se o evento já foi tratado, ignorando avisos duplicados e evitando cobranças/faturação dupla
 * </p>
 * @author Nexus Estates Team
 * @version 1.0
 */
@Service
public class StripeWebhookService {

    /**
     * Repositório para acesso e manipulação do estado dos pagamentos na base de dados
     */
    private final PaymentRepository paymentRepository;

    /**
     * Repositório dedicado à gestão do ciclo de vida dos eventos recebidos (tabela de idempotência)
     */
    private final ProcessedEventRepository processedEventRepository;

    /**
     * Fachada para comunicação interna com outros microsserviços (como o booking-service)
     */
    private final Proxy proxy;

    /**
     * Orquestrador que gere a emissão de documentos fiscais após a validação do pagamento
     */
    private final InvoiceOrchestrator invoiceOrchestrator;

    /**
     * Segredo criptográfico do Webhook do Stripe (injetado via configuração)
     */
    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

    /**
     * Construtor principal para o serviço de Webhooks
     * @param paymentRepository Repositório de pagamentos
     * @param processedEventRepository Repositório de idempotência
     * @param proxy Proxy para chamadas a clientes HTTP (BookingClient)
     * @param invoiceOrchestrator Orquestrador de faturas
     */
    public StripeWebhookService(
            PaymentRepository paymentRepository,
            ProcessedEventRepository processedEventRepository,
            Proxy proxy,
            InvoiceOrchestrator invoiceOrchestrator
    ) {
        this.paymentRepository = paymentRepository;
        this.processedEventRepository = processedEventRepository;
        this.proxy = proxy;
        this.invoiceOrchestrator = invoiceOrchestrator;
    }


    /**
     * Interceta e processa o webhook recebido
     * <p>
     *     Controi o evento de forma segura e, dependendo do tipo, delega para os tratadores internos
     *     que atualizam a base de dados e faturam o cliente
     * </p>
     * @param payload O corpo bruto em JSON enviado pelo Stripe
     * @param signatureHeader O cabeçalho de assinatura do Stripe para validação criptográfica
     * @throws PaymentProcessingException Se a assinatura for inválida ou o JSON for maformado
     */
    @Transactional
    public void handleStripeWebhook(String payload, String signatureHeader) {
        Event event;
        try {
            event = constructEvent(payload, signatureHeader);
        } catch (SignatureVerificationException e) {
            throw new PaymentProcessingException("Invalid Stripe webhook signature", e);
        } catch (Exception e) {
            throw new PaymentProcessingException("Failed to parse Stripe webhook event", e);
        }

        if (!saveProcessedEventIfNew(event)) {
            return;
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentIntentFailed(event);
            default -> {
            }
        }
    }


    /**
     * Constrói e verifica a assinatura do evento do Stripe utilizando o SDK nativo
     * @param payload O corpo do pedido
     * @param signatureHeader O cabeçalho de assinatura criptográfica
     * @return O evento validado
     * @throws SignatureVerificationException Caso a assinatura não seja autêntica
     */
    protected Event constructEvent(String payload, String signatureHeader) throws SignatureVerificationException {
        return Webhook.constructEvent(payload, signatureHeader, stripeWebhookSecret);
    }

    /**
     * Trata eventos de sucesso de PaymentIntent: atualiza pagamento, cria/atualiza invoice e
     * notifica o booking-service.
     */
    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent intent = extractPaymentIntent(event);
        String bookingIdValue = intent.getMetadata() != null ? intent.getMetadata().get("bookingId") : null;
        if (bookingIdValue == null || bookingIdValue.isBlank()) {
            return;
        }

        Long bookingId = Long.parseLong(bookingIdValue);
        Payment payment = upsertPaymentFromStripeIntent(bookingId, intent, PaymentStatus.SUCCEEDED);
        invoiceOrchestrator.ensureInvoiceForPayment(payment);

        proxy.bookingClient().markPaymentSucceeded(
                bookingId,
                new NexusClients.PaymentSucceededRequest(intent.getId(), intent.getId())
        );
    }

    /**
     * Trata eventos de falha de PaymentIntent: atualiza estado do pagamento.
     */
    private void handlePaymentIntentFailed(Event event) {
        PaymentIntent intent = extractPaymentIntent(event);
        String bookingIdValue = intent.getMetadata() != null ? intent.getMetadata().get("bookingId") : null;
        if (bookingIdValue == null || bookingIdValue.isBlank()) {
            return;
        }

        Long bookingId = Long.parseLong(bookingIdValue);
        upsertPaymentFromStripeIntent(bookingId, intent, PaymentStatus.FAILED);
    }

    /**
     * Extrai {@link PaymentIntent} do evento Stripe.
     */
    private PaymentIntent extractPaymentIntent(Event event) {
        return event.getDataObjectDeserializer()
                .getObject()
                .map(obj -> (PaymentIntent) obj)
                .orElseThrow(() -> new PaymentProcessingException("Stripe webhook event has no PaymentIntent payload"));
    }

    /**
     * Regista evento processado para garantir idempotência.
     * @return true se o evento foi novo; false se duplicado
     */
    private boolean saveProcessedEventIfNew(Event event) {
        ProcessedEvent processedEvent = new ProcessedEvent();
        processedEvent.setProvider("STRIPE");
        processedEvent.setEventId(event.getId());
        processedEvent.setEventType(event.getType());

        try {
            processedEventRepository.save(processedEvent);
            return true;
        } catch (DataIntegrityViolationException e) {
            return false;
        }
    }

    /**
     * Atualiza/insere registo de pagamento com dados do {@link PaymentIntent}.
     */
    private Payment upsertPaymentFromStripeIntent(Long bookingId, PaymentIntent intent, PaymentStatus status) {
        BigDecimal amount = BigDecimal.valueOf(intent.getAmount()).divide(BigDecimal.valueOf(100));

        Payment payment = paymentRepository.findByPaymentIntentId(intent.getId()).orElseGet(Payment::new);
        payment.setBookingId(bookingId);
        payment.setProvider("STRIPE");
        payment.setPaymentIntentId(intent.getId());
        payment.setCurrency(intent.getCurrency());
        payment.setAmount(amount);
        payment.setStatus(status.name());
        return paymentRepository.save(payment);
    }
}
