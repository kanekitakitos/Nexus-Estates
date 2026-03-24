package com.nexus.estates.service;

import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.dto.payment.PaymentResponse;
import com.nexus.estates.dto.payment.PaymentStatus;
import com.nexus.estates.repository.PaymentRepository;
import com.nexus.estates.service.invoicing.InvoiceOrchestrator;
import com.nexus.estates.service.interfaces.PaymentGatewayProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancePaymentServiceTest {

    @Mock
    private PaymentGatewayProvider paymentGatewayProvider;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private Proxy proxy;

    @Mock
    private NexusClients.BookingClient bookingClient;

    @Mock
    private InvoiceOrchestrator invoiceOrchestrator;

    @Test
    void confirmPayment_whenSuccess_notifiesBookingAndEnsuresInvoice() {
        when(paymentGatewayProvider.providerKey()).thenReturn("STRIPE");
        when(proxy.bookingClient()).thenReturn(bookingClient);

        PaymentResponse.Success success = new PaymentResponse.Success(
                "pi_123",
                "pi_123",
                new BigDecimal("300.00"),
                "EUR",
                PaymentStatus.SUCCEEDED,
                LocalDateTime.now(),
                null,
                null,
                BigDecimal.ZERO,
                new PaymentResponse.PaymentMethodDetails("card", "4242", "visa"),
                Map.of()
        );

        when(paymentGatewayProvider.confirmPaymentIntent(eq("pi_123"), any(Map.class))).thenReturn(success);

        com.nexus.estates.entity.Payment stored = new com.nexus.estates.entity.Payment();
        stored.setId(1L);
        stored.setPaymentIntentId("pi_123");
        stored.setProvider("STRIPE");
        stored.setCurrency("EUR");
        stored.setAmount(new BigDecimal("300.00"));
        stored.setStatus(PaymentStatus.SUCCEEDED.name());
        when(paymentRepository.findByPaymentIntentId("pi_123")).thenReturn(Optional.of(stored));

        when(paymentRepository.save(any(com.nexus.estates.entity.Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FinancePaymentService service = new FinancePaymentService(
                List.of(paymentGatewayProvider),
                "STRIPE",
                paymentRepository,
                proxy,
                invoiceOrchestrator
        );

        PaymentResponse response = service.confirmPayment(10L, "pi_123", Map.of("bookingId", "10"));

        assertThat(response.status()).isEqualTo(PaymentStatus.SUCCEEDED);

        verify(invoiceOrchestrator).ensureInvoiceForPayment(eq(stored));
        verify(bookingClient).markPaymentSucceeded(eq(10L), any(NexusClients.PaymentSucceededRequest.class));
    }

    @Test
    void createPaymentIntent_persistsPaymentRecord() {
        when(paymentGatewayProvider.providerKey()).thenReturn("STRIPE");

        PaymentResponse.Intent intent = new PaymentResponse.Intent(
                "pi_999",
                "secret",
                new BigDecimal("120.00"),
                "EUR",
                PaymentStatus.PENDING,
                Map.of()
        );

        when(paymentGatewayProvider.createPaymentIntent(eq(new BigDecimal("120.00")), eq("EUR"), eq("77"), any(Map.class))).thenReturn(intent);
        when(paymentRepository.save(any(com.nexus.estates.entity.Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FinancePaymentService service = new FinancePaymentService(
                List.of(paymentGatewayProvider),
                "STRIPE",
                paymentRepository,
                proxy,
                invoiceOrchestrator
        );

        PaymentResponse response = service.createPaymentIntent(77L, new BigDecimal("120.00"), "EUR", null, Map.of("bookingId", "77"));

        assertThat(response.transactionId()).isEqualTo("pi_999");

        ArgumentCaptor<com.nexus.estates.entity.Payment> captor = ArgumentCaptor.forClass(com.nexus.estates.entity.Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertThat(captor.getValue().getBookingId()).isEqualTo(77L);
        assertThat(captor.getValue().getProvider()).isEqualTo("STRIPE");
        assertThat(captor.getValue().getPaymentIntentId()).isEqualTo("pi_999");
        assertThat(captor.getValue().getStatus()).isEqualTo(PaymentStatus.PENDING.name());
    }
}

