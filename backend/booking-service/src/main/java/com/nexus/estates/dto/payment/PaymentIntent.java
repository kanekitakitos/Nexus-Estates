package com.nexus.estates.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Representa uma intenção de pagamento criada pelo provedor.
 * 
 * Esta classe contém todas as informações necessárias para processar
 * ou confirmar um pagamento posteriormente.
 */
public record PaymentIntent(
    String id,
    String providerId,
    BigDecimal amount,
    String currency,
    String referenceId,
    PaymentStatus status,
    String clientSecret,
    LocalDateTime createdAt,
    LocalDateTime expiresAt,
    Map<String, Object> metadata,
    String redirectUrl,
    boolean requiresAction,
    String nextActionType
) {
    /**
     * Verifica se a intenção expirou.
     * 
     * @return true se expirou, false caso contrário
     */
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Verifica se requer ação adicional do utilizador.
     * 
     * @return true se requer ação, false caso contrário
     */
    public boolean requiresUserAction() {
        return requiresAction && nextActionType != null;
    }
}