package com.nexus.estates.service.invoicing;

import com.nexus.estates.entity.Invoice;
import com.nexus.estates.entity.Payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Provedor de faturação simulado (Mock) para ambientes de Teste e Desenvolvimento
 * <p>
 *     Gera números de fatura fictícios e URLs falsos para validar o Comportamento
 *     do Orquestrador sem fazer chamadas a APIs de faturação reais que custam dinheiro
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Service
public class MockInvoiceProviderStrategy implements InvoiceProviderStrategy {

    /**
     * O prefixo atribuído ás faturas ficticias
     */
    private final String prefix;

    /**
     * O URL base usado para simular o endereço de descarregamento do PDF
     */
    private final String baseUrl;

    /**
     * Construtor do provedor Mock
     * @param prefix Prefixo da fatura injetado via propriedades
     * @param baseUrl Endereço base para os URLs dos PDFs injetado via propriedades
     */
    public MockInvoiceProviderStrategy(
            @Value("${mock.invoice.prefix:FT}") String prefix,
            @Value("${mock.invoice.base-url:https://cdn.nexus-estates.local/mock}") String baseUrl
    ) {
        this.prefix = prefix;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }


    /**
     * Identificador do provedor simulado
     * @return A constante "MOCK"
     */
    @Override
    public String providerKey() {
        return "MOCK";
    }


    /**
     * Gera uma emissão fictícia de fatura
     * <p>
     *     Constrói um ID legal baseado no ano e no ID do pagamento, e forja um URL de PDF simulado
     * </p>
     * @param invoice A entidade de rascunho da fatura
     * @param payment Os detalhes do pagamento que originou esta fatura
     * @return O resultado da simulação indicando sucesso ("ISSUED")
     */
    @Override
    public InvoiceIssueResult issue(Invoice invoice, Payment payment) {
        String legalId = prefix + " " + LocalDateTime.now().getYear() + "/" + payment.getId();
        String pdfUrl = baseUrl + "/invoices/" + invoice.getId() + ".pdf";
        return new InvoiceIssueResult(providerKey(), "ISSUED", legalId, pdfUrl);
    }
}

