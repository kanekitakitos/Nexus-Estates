package com.nexus.estates.dto.payment;

import java.util.List;
import java.util.Map;

/**
 * DTO contendo metadados e informações de capacidade sobre um provedor de pagamento.
 * <p>
 * Utilizado para expor as funcionalidades suportadas pela implementação atual do gateway,
 * permitindo que o frontend adapte a interface (ex: mostrar ou esconder opção de reembolso parcial).
 * </p>
 * 
 * @param name Nome do provedor (ex: "Stripe").
 * @param version Versão da integração ou da API do provedor.
 * @param description Descrição amigável do provedor.
 * @param supportedPaymentMethods Lista de métodos de pagamento suportados.
 * @param supportedCurrencies Lista de moedas suportadas (códigos ISO).
 * @param capabilities Mapa de capacidades adicionais (ex: "3ds": true).
 * @param supportsRefunds Indica se o provedor suporta reembolsos.
 * @param supportsPartialRefunds Indica se o provedor suporta reembolsos parciais.
 * @param supportsWebhooks Indica se a integração utiliza webhooks.
 * @param webhookUrl URL do endpoint de webhook configurado (opcional).
 * @param apiVersion Versão da API do provedor utilizada.
 * @param environment Ambiente de execução (ex: "sandbox", "production").
 * 
 * @author Nexus Estates Team
 * @version 1.0
 * @see PaymentMethod
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
     * Verifica se o provedor suporta operações de reembolso.
     * @return true se suportado.
     */
    public boolean supportsRefunds() {
        return supportsRefunds;
    }

    /**
     * Verifica se o provedor suporta reembolsos parciais.
     * @return true se suportado.
     */
    public boolean supportsPartialRefunds() {
        return supportsPartialRefunds;
    }

    /**
     * Verifica se a integração com o provedor utiliza webhooks para atualizações de estado.
     * @return true se utiliza webhooks.
     */
    public boolean supportsWebhooks() {
        return supportsWebhooks;
    }

    /**
     * Verifica se um método de pagamento específico é suportado por este provedor.
     * 
     * @param paymentMethod O método a verificar.
     * @return true se o método estiver na lista de suportados.
     */
    public boolean supportsPaymentMethod(PaymentMethod paymentMethod) {
        return supportedPaymentMethods != null && supportedPaymentMethods.contains(paymentMethod);
    }
}