package com.nexus.estates.service.invoicing;

import com.nexus.estates.entity.Invoice;
import com.nexus.estates.entity.Payment;
import com.nexus.estates.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvoiceOrchestrator {

    private final InvoiceRepository invoiceRepository;
    private final String activeInvoiceProvider;
    private final InvoiceProviderStrategy invoiceProviderStrategy;

    /**
     * Seleciona a Strategy de faturação ativa e orquestra emissão/atualização de invoices.
     */
    public InvoiceOrchestrator(
            InvoiceRepository invoiceRepository,
            List<InvoiceProviderStrategy> invoiceProviderStrategies,
            @Value("${invoicing.provider:NONE}") String activeInvoiceProvider
    ) {
        this.invoiceRepository = invoiceRepository;
        this.activeInvoiceProvider = activeInvoiceProvider;
        this.invoiceProviderStrategy = invoiceProviderStrategies.stream()
                .filter(p -> p.providerKey() != null && p.providerKey().equalsIgnoreCase(activeInvoiceProvider))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No InvoiceProviderStrategy configured for key: " + activeInvoiceProvider));
    }

    @Transactional
    public Invoice ensureInvoiceForPayment(Payment payment) {
        Invoice invoice = invoiceRepository.findByPayment_IdAndProvider(payment.getId(), activeInvoiceProvider)
                .orElseGet(() -> {
                    Invoice newInvoice = new Invoice();
                    newInvoice.setPayment(payment);
                    newInvoice.setProvider(activeInvoiceProvider);
                    newInvoice.setStatus("PENDING");
                    return invoiceRepository.save(newInvoice);
                });
        if (!"NONE".equalsIgnoreCase(activeInvoiceProvider) && "PENDING".equalsIgnoreCase(invoice.getStatus())) {
            InvoiceIssueResult result = invoiceProviderStrategy.issue(invoice, payment);
            invoice.setStatus(result.status());
            invoice.setLegalId(result.legalId());
            invoice.setPdfUrl(result.pdfUrl());
            if ("ISSUED".equalsIgnoreCase(result.status())) {
                invoice.setIssuedAt(LocalDateTime.now());
            }
            return invoiceRepository.save(invoice);
        }
        return invoice;
    }
}
