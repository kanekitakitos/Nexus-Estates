package com.nexus.estates.service.invoicing;

import com.nexus.estates.entity.Invoice;
import com.nexus.estates.entity.Payment;

/**
 * Strategy para provedores de faturação (Moloni/Vendus/Mock).
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
public interface InvoiceProviderStrategy {
    String providerKey();

    InvoiceIssueResult issue(Invoice invoice, Payment payment);
}
