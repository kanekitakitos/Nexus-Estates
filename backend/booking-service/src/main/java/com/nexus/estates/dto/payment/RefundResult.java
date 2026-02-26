package com.nexus.estates.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Resultado de um reembolso processado.
 * 
 * Contém informações sobre o reembolso, incluindo
 * status, valor e detalhes da transação.
 */
public record RefundResult(
    String refundId,
    String providerRefundId,
    String originalTransactionId,
    BigDecimal refundedAmount,
    String currency,
    RefundStatus status,
    LocalDateTime processedAt,
    String reason,
    Map<String, Object> metadata,
    String failureReason,
    BigDecimal refundFees
) {
    /**
     * Verifica se o reembolso foi bem sucedido.
     * 
     * @return true se sucedido, false caso contrário
     */
    public boolean isSuccessful() {
        return status == RefundStatus.SUCCEEDED;
    }

    /**
     * Verifica se o reembolso falhou.
     * 
     * @return true se falhou, false caso contrário
     */
    public boolean isFailed() {
        return status == RefundStatus.FAILED;
    }
}