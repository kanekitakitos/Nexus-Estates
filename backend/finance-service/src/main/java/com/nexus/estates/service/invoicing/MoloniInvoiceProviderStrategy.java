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

@Service
public class MoloniInvoiceProviderStrategy implements InvoiceProviderStrategy {

    private final RestClient restClient;
    private final String accessToken;
    private final Integer companyId;
    private final Integer documentSetId;
    private final Integer customerId;
    private final Integer paymentMethodId;
    private final Integer productId;

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

    @Override
    public String providerKey() {
        return "MOLONI";
    }

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

    private static Object firstNonNull(Map<?, ?> map, String... keys) {
        if (map == null) return null;
        for (String key : keys) {
            Object v = map.get(key);
            if (v != null) return v;
        }
        return null;
    }

    private static Integer asInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String asString(Object value) {
        if (value == null) return null;
        String s = value.toString();
        return s.isBlank() ? null : s;
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}

