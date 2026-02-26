package com.nexus.estates.dto.payment;

import java.util.List;
import java.util.Map;

/**
 * Informações sobre o provedor de pagamento.
 * 
 * Contém metadados sobre o provedor, incluindo
 * nome, versão, capacidades e métodos suportados.
 */
public record ProviderInfo(
    String name,
    String version,
    String description,
    List<PaymentMethod> supportedPaymentMethods,
    List<String> supportedCurrencies,
    Map<String, Object> capabilities,
    boolean supportsRefunds,
    boolean supportsPartialRefunds,
    boolean supportsWebhooks,
    String webhookUrl,
    String apiVersion,
    String environment
) {
    /**
     * Verifica se suporta reembolsos.
     * 
     * @return true se suporta reembolsos, false caso contrário
     */
    public boolean supportsRefunds() {
        return supportsRefunds;
    }

    /**
     * Verifica se suporta reembolsos parciais.
     * 
     * @return true se suporta reembolsos parciais, false caso contrário
     */
    public boolean supportsPartialRefunds() {
        return supportsPartialRefunds;
    }

    /**
     * Verifica se suporta webhooks.
     * 
     * @return true se suporta webhooks, false caso contrário
     */
    public boolean supportsWebhooks() {
        return supportsWebhooks;
    }

    /**
     * Verifica se suporta um método de pagamento específico.
     * 
     * @param paymentMethod Método de pagamento a verificar
     * @return true se suportado, false caso contrário
     */
    public boolean supportsPaymentMethod(PaymentMethod paymentMethod) {
        return supportedPaymentMethods != null && supportedPaymentMethods.contains(paymentMethod);
    }
}