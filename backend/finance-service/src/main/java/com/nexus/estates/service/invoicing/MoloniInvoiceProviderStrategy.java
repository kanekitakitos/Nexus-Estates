package com.nexus.estates.service.invoicing;

import com.nexus.estates.entity.Invoice;
import com.nexus.estates.entity.Payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Implementação da integração com o software de faturação Moloni
 * <p>
 *     Utiliza o {@link org.springframework.web.client.RestClient} para comunicar com a API v1 do Moloni
 *     Transforma os detalhes do pagamento e da reserva num payload aceitável pelo Molini
 *     para inserir um "Invoice Receipt" (Fatura-Recibo) válido para a Autoridade Tributária
 * </p>
 * @author Nexus Estates Team
 * @version 1.0
 */
@Service
public class MoloniInvoiceProviderStrategy implements InvoiceProviderStrategy {

    /**
     * Cliente HTTP síncrono para efetuar chamadas à API do Moloni
     */
    private final RestClient restClient;

    /**
     * Token de acesso estático para autenticação na API (Developer mode/Client mode)
     */
    private final String accessToken;

    /**
     * Identificador interno da empresa registada no Moloni
     */
    private final Integer companyId;

    /**
     * Série documental na qual as faturas-recibo serão inseridas
     */
    private final Integer documentSetId;

    /**
     * ID do cliente genérico associado às faturas ao consumidor final (B2C)
     */
    private final Integer customerId;

    /**
     * ID que mapeia o método de pagamento no sistema Moloni
     */
    private final Integer paymentMethodId;

    /**
     * Identificador do artigo/produto genérico a faturar
     */
    private final Integer productId;

    /**
     * Construtor da integração Moloni
     * Inicializa as credenciais de API, os identificadores internos do Moloni e configura o cliente HTTP
     * @param restClientBuilder Builder injetado pelo Spring
     * @param baseUrl URL base da API do Moloni
     * @param accessToken Token OAuth2 ou Developer Token
     * @param companyId Identificador da empresa no Moloni
     * @param documentSetId Série documental para a emissão
     * @param customerId ID do cliente de destino
     * @param paymentMethodId Método de pagamento Moloni
     * @param productId Produto a apresentar na linha de faturaçã
     */
    public MoloniInvoiceProviderStrategy(
            RestClient.Builder restClientBuilder,
            @Value("${moloni.base-url:https://api.moloni.pt/v1}") String baseUrl,
            @Value("${moloni.access-token:${moloni.api-key:}}") String accessToken,
            @Value("${moloni.company-id:#{null}}") Integer companyId,
            @Value("${moloni.document-set-id:#{null}}") Integer documentSetId,
            @Value("${moloni.customer-id:#{null}}") Integer customerId,
            @Value("${moloni.payment-method-id:#{null}}") Integer paymentMethodId,
            @Value("${moloni.product-id:#{null}}") Integer productId
    ) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.accessToken = accessToken;
        this.companyId = companyId;
        this.documentSetId = documentSetId;
        this.customerId = customerId;
        this.paymentMethodId = paymentMethodId;
        this.productId = productId;
    }

    /**
     * Identificador do provedor Moloni
     * @return A constante "MOLONI"
     */
    @Override
    public String providerKey() {
        return "MOLONI";
    }


    /**
     * Processa a criação efetiva de uma Fatura-Recibo através de chamadas à API do Moloni
     * <p>
     *     A operação é dividida em dois passos: inserção do documento no Moloni e subsequente recuperação do URL do PDF original
     * </p>
     * @param invoice A entidade de rascunho da fatura
     * @param payment Os detalhes do pagamento que originou esta fatura
     * @return O resultado da operação indicando sucesso (ISSUED) ou falha (FAILED)
     */
    @Override
    public InvoiceIssueResult issue(Invoice invoice, Payment payment) {
        if (isBlank(accessToken) || companyId == null || documentSetId == null || customerId == null || paymentMethodId == null || productId == null) {
            return new InvoiceIssueResult(providerKey(), "FAILED", null, null);
        }

        try {
            LocalDate today = LocalDate.now();
            DateTimeFormatter moloniDateTime = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            Map<String, Object> payload = Map.of(
                    "company_id", companyId,
                    "date", today.toString(),
                    "expiration_date", today.toString(),
                    "document_set_id", documentSetId,
                    "customer_id", customerId,
                    "products", List.of(
                            Map.of(
                                    "product_id", productId,
                                    "name", "Alojamento Local",
                                    "summary", "Reserva " + payment.getBookingId(),
                                    "qty", 1,
                                    "price", payment.getAmount().doubleValue(),
                                    "discount", 0
                            )
                    ),
                    "payments", List.of(
                            Map.of(
                                    "payment_method_id", paymentMethodId,
                                    "date", LocalDateTime.now().format(moloniDateTime),
                                    "value", payment.getAmount().doubleValue(),
                                    "notes", "Stripe"
                            )
                    ),
                    "status", 1
            );

            Map<?, ?> insertResponse = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/invoiceReceipts/insert/")
                            .queryParam("access_token", accessToken)
                            .build())
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            Integer documentId = asInteger(firstNonNull(insertResponse, "document_id", "documentId", "id", "document"));
            String legalId = asString(firstNonNull(insertResponse, "number", "document_number", "documentNumber", "name", "reference"));

            String pdfUrl = null;
            if (documentId != null) {
                Map<String, Object> pdfRequest = Map.of(
                        "company_id", companyId,
                        "document_id", documentId,
                        "signed", 0
                );

                Map<?, ?> pdfResponse = restClient.post()
                        .uri(uriBuilder -> uriBuilder
                                .path("/documents/getPDFLink/")
                                .queryParam("access_token", accessToken)
                                .build())
                        .body(pdfRequest)
                        .retrieve()
                        .body(Map.class);

                pdfUrl = asString(firstNonNull(pdfResponse, "url", "link"));
            }

            if (legalId == null && documentId != null) {
                legalId = documentId.toString();
            }

            return new InvoiceIssueResult(providerKey(), "ISSUED", legalId, pdfUrl);
        } catch (Exception e) {
            return new InvoiceIssueResult(providerKey(), "FAILED", null, null);
        }
    }


    /**
     * Utilitário para recuperar o primeiro valor não nulo de um mapa, percorrendo uma lista de chaves
     * @param map O mapa origem de dados
     * @param keys A sequência de chaves a procurar
     * @return O primeiro valor encontrado, ou nulo se não encontrar correspondência
     */
    private static Object firstNonNull(Map<?, ?> map, String... keys) {
        if (map == null) return null;
        for (String key : keys) {
            Object v = map.get(key);
            if (v != null) return v;
        }
        return null;
    }


    /**
     * Utilitário para garantir a conversão segura de um Objeto genérico para Inteiro
     * @param value O valor a converter
     * @return O valor numérico, ou nulo se for incompatível
     */
    private static Integer asInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception ignored) {
            return null;
        }
    }

    /**
     * Utilitário para garantir a extração segura de uma String a partir de um Objeto
     * @param value O valor a converter
     * @return A string extraída, ou nulo se for vazia ou nula
     */
    private static String asString(Object value) {
        if (value == null) return null;
        String s = value.toString();
        return s.isBlank() ? null : s;
    }

    /**
     * Utilitário para interpretar dinamicamente um valor como Booleano
     * Suporta inteiros (1=true, 0=false), Strings ("true", "1") ou literais booleanos
     * @param value O valor a avaliar
     * @return O booleano resultante
     */
    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}

