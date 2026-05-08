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

    /**
     * Identificador deste provedor nulo
     * @return A constante "NONE"
     */
    @Override
    public String providerKey() {
        return "NONE";
    }

    /**
     * Simula a emissão de uma fatura sem realizar qualquer operação real
     * @param invoice A entidade de rascunho da fatura
     * @param payment Os detalhes do pagamento que originou esta fatura
     * @return O resultado inalterado mantendo o estado, ID legal e URL atuais do rascunho
     */
    @Override
    public InvoiceIssueResult issue(Invoice invoice, Payment payment) {
        return new InvoiceIssueResult(providerKey(), invoice.getStatus(), invoice.getLegalId(), invoice.getPdfUrl());
    }
}

