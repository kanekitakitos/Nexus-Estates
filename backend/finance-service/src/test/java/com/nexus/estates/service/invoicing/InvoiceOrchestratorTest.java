package com.nexus.estates.service.invoicing;

import com.nexus.estates.entity.Invoice;
import com.nexus.estates.entity.Payment;
import com.nexus.estates.repository.InvoiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceOrchestratorTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoiceProviderStrategy invoiceProviderStrategy;

    @Test
    void ensureInvoiceForPayment_createsPendingInvoiceWhenMissing_andIssuesWhenProviderEnabled() {
        Payment payment = new Payment();
        payment.setId(10L);
        payment.setBookingId(99L);
        payment.setProvider("STRIPE");
        payment.setPaymentIntentId("pi_123");
        payment.setCurrency("EUR");
        payment.setAmount(new BigDecimal("150.00"));
        payment.setStatus("SUCCEEDED");

        when(invoiceProviderStrategy.providerKey()).thenReturn("MOCK");
        when(invoiceRepository.findByPayment_IdAndProvider(10L, "MOCK")).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceProviderStrategy.issue(any(Invoice.class), any(Payment.class)))
                .thenReturn(new InvoiceIssueResult("MOCK", "ISSUED", "FT 2026/10", "https://cdn.example/invoices/1.pdf"));

        InvoiceOrchestrator orchestrator = new InvoiceOrchestrator(invoiceRepository, List.of(invoiceProviderStrategy), "MOCK");
        Invoice result = orchestrator.ensureInvoiceForPayment(payment);

        assertThat(result.getProvider()).isEqualTo("MOCK");
        assertThat(result.getStatus()).isEqualTo("ISSUED");
        assertThat(result.getLegalId()).isEqualTo("FT 2026/10");
        assertThat(result.getPdfUrl()).isEqualTo("https://cdn.example/invoices/1.pdf");
        assertThat(result.getIssuedAt()).isNotNull();

        ArgumentCaptor<Invoice> invoiceCaptor = ArgumentCaptor.forClass(Invoice.class);
        verify(invoiceRepository, atLeastOnce()).save(invoiceCaptor.capture());
        verify(invoiceProviderStrategy).issue(any(Invoice.class), eq(payment));
    }

    @Test
    void ensureInvoiceForPayment_createsPendingInvoiceAndDoesNotIssueWhenProviderNone() {
        Payment payment = new Payment();
        payment.setId(11L);
        payment.setBookingId(100L);
        payment.setProvider("STRIPE");
        payment.setPaymentIntentId("pi_456");
        payment.setCurrency("EUR");
        payment.setAmount(new BigDecimal("200.00"));
        payment.setStatus("SUCCEEDED");

        when(invoiceProviderStrategy.providerKey()).thenReturn("NONE");
        when(invoiceRepository.findByPayment_IdAndProvider(11L, "NONE")).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InvoiceOrchestrator orchestrator = new InvoiceOrchestrator(invoiceRepository, List.of(invoiceProviderStrategy), "NONE");
        Invoice result = orchestrator.ensureInvoiceForPayment(payment);

        assertThat(result.getProvider()).isEqualTo("NONE");
        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getIssuedAt()).isNull();

        verify(invoiceProviderStrategy, never()).issue(any(), any());
    }
}

