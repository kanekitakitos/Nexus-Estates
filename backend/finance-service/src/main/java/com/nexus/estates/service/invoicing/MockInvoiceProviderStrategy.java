package com.nexus.estates.service.invoicing;

import com.nexus.estates.entity.Invoice;
import com.nexus.estates.entity.Payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MockInvoiceProviderStrategy implements InvoiceProviderStrategy {

    private final String prefix;
    private final String baseUrl;

    public MockInvoiceProviderStrategy(
            @Value("${mock.invoice.prefix:FT}") String prefix,
            @Value("${mock.invoice.base-url:https://cdn.nexus-estates.local/mock}") String baseUrl
    ) {
        this.prefix = prefix;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    @Override
    public String providerKey() {
        return "MOCK";
    }

    @Override
    public InvoiceIssueResult issue(Invoice invoice, Payment payment) {
        String legalId = prefix + " " + LocalDateTime.now().getYear() + "/" + payment.getId();
        String pdfUrl = baseUrl + "/invoices/" + invoice.getId() + ".pdf";
        return new InvoiceIssueResult(providerKey(), "ISSUED", legalId, pdfUrl);
    }
}

