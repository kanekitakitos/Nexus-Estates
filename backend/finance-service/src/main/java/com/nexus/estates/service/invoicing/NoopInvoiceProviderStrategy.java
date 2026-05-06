package com.nexus.estates.service.invoicing;

import com.nexus.estates.entity.Invoice;
import com.nexus.estates.entity.Payment;
import org.springframework.stereotype.Service;

/**
 * Provedor de faturação nulo (No Operation)
 * <p>
 *     Usando quando a emissão de faturas está explicitamente desativada na configuração ({@code invoicing.provider=NONE})
 *     Não realiza qualquer comunicação e mantém as faturas no estado original
 * </p>
 * @author Nexus Estates Team
 * @version 1.0
 */
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

