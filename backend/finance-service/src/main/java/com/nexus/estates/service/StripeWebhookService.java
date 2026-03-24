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

@Service
public class StripeWebhookService {

    private final PaymentRepository paymentRepository;
    private final ProcessedEventRepository processedEventRepository;
    private final Proxy proxy;
    private final InvoiceOrchestrator invoiceOrchestrator;

    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

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
