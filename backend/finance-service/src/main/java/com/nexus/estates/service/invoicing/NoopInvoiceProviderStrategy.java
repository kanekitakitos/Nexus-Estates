package com.nexus.estates.service.invoicing;

import com.nexus.estates.entity.Invoice;
import com.nexus.estates.entity.Payment;
import org.springframework.stereotype.Service;

@Service
public class NoopInvoiceProviderStrategy implements InvoiceProviderStrategy {
    @Override
    public String providerKey() {
        return "NONE";
    }

    @Override
    public InvoiceIssueResult issue(Invoice invoice, Payment payment) {
        return new InvoiceIssueResult(providerKey(), invoice.getStatus(), invoice.getLegalId(), invoice.getPdfUrl());
    }
}

