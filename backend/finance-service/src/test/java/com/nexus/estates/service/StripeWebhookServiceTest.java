package com.nexus.estates.service;

import com.nexus.estates.client.Proxy;
import com.nexus.estates.repository.PaymentRepository;
import com.nexus.estates.repository.ProcessedEventRepository;
import com.nexus.estates.service.invoicing.InvoiceOrchestrator;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeWebhookServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ProcessedEventRepository processedEventRepository;

    @Mock
    private Proxy proxy;

    @Mock
    private InvoiceOrchestrator invoiceOrchestrator;

    @Test
    void handleStripeWebhook_whenDuplicateEvent_doesNotProcessFurther() {
        StripeWebhookService service = new StripeWebhookService(paymentRepository, processedEventRepository, proxy, invoiceOrchestrator) {
            @Override
            protected Event constructEvent(String payload, String signatureHeader) {
                Event event = mock(Event.class);
                when(event.getId()).thenReturn("evt_1");
                when(event.getType()).thenReturn("payment_intent.succeeded");
                return event;
            }
        };

        when(processedEventRepository.save(any())).thenThrow(new DataIntegrityViolationException("duplicate"));

        service.handleStripeWebhook("{}", "sig");

        verifyNoInteractions(paymentRepository);
        verifyNoInteractions(proxy);
        verifyNoInteractions(invoiceOrchestrator);
    }

    @Test
    void handleStripeWebhook_whenSignatureInvalid_throwsPaymentProcessingException() {
        StripeWebhookService service = new StripeWebhookService(paymentRepository, processedEventRepository, proxy, invoiceOrchestrator) {
            @Override
            protected Event constructEvent(String payload, String signatureHeader) throws SignatureVerificationException {
                throw new SignatureVerificationException("invalid", "sig");
            }
        };

        assertThatThrownBy(() -> service.handleStripeWebhook("{}", "sig"))
                .isInstanceOf(com.nexus.estates.exception.PaymentProcessingException.class)
                .hasMessageContaining("Invalid Stripe webhook signature");

        verifyNoInteractions(processedEventRepository);
    }
}

