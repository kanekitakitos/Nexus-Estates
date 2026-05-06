package com.nexus.estates.service.invoicing;

import com.nexus.estates.entity.Invoice;
import com.nexus.estates.entity.Payment;

/**
 * Strategy para provedores de faturação (Moloni/Vendus/Mock).
 *<p>
 *     Define o contrato obrigatório para a emissão automática de faturas e recibos
 *</p>
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
public interface InvoiceProviderStrategy {
    /**
     * Devolve a cahve úncia que identifica este software de faturação
     * @return String contendo o identificador (ex: "MOLONI", "MOCK", "NONE")
     */
    String providerKey();

    /**
     * Comunica cok o software de faturação para emitir um documento com validade legal referente a um pagamento confirmado
     * @param invoice A entidade de rascunho da fatura criada pelo sistema
     * @param payment Os detalhes do pagamento que originou esta fatura
     * @return {@link InvoiceIssueResult} contendo o ID legal e o link para o PDF gerado
     */
    InvoiceIssueResult issue(Invoice invoice, Payment payment);
}
