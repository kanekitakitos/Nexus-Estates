package com.nexus.estates.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Resultado de um pagamento direto processado.
 * 
 * Contém informações completas sobre o resultado do pagamento,
 * incluindo sucesso, falha ou estado pendente.
 */
public record PaymentResult(
    String transactionId,
    String providerTransactionId,
    BigDecimal amount,
    String currency,
    PaymentStatus status,
    LocalDateTime processedAt,
    String authorizationCode,
    String receiptUrl,
    Map<String, Object> metadata,
    String failureReason,
    String failureCode,
    BigDecimal fees,
    String paymentMethodType,
    boolean requiresAction,
    String nextActionType
) {
    /**
     * Verifica se o pagamento foi bem sucedido.
     * 
     * @return true se sucedido, false caso contrário
     */
    public boolean isSuccessful() {
        return status == PaymentStatus.SUCCEEDED;
    }

    /**
     * Verifica se o pagamento falhou.
     * 
     * @return true se falhou, false caso contrário
     */
    public boolean isFailed() {
        return status == PaymentStatus.FAILED;
    }

    /**
     * Verifica se requer ação adicional.
     * 
     * @return true se requer ação, false caso contrário
     */
    public boolean requiresUserAction() {
        return requiresAction && nextActionType != null;
    }
}