package com.nexus.estates.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Detalhes completos de uma transação de pagamento.
 * 
 * Contém todas as informações relevantes sobre uma transação,
 * incluindo dados do pagador, método de pagamento e histórico.
 */
public record TransactionDetails(
    String transactionId,
    String providerTransactionId,
    BigDecimal amount,
    String currency,
    PaymentStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    String referenceId,
    String customerId,
    String customerEmail,
    String customerName,
    PaymentMethod paymentMethod,
    String paymentMethodDetails,
    String lastFourDigits,
    String brand,
    String authorizationCode,
    String receiptUrl,
    BigDecimal fees,
    BigDecimal refundedAmount,
    String failureReason,
    String failureCode,
    Map<String, Object> metadata,
    boolean isRefundable,
    BigDecimal maximumRefundAmount
) {
    /**
     * Verifica se a transação pode ser reembolsada.
     * 
     * @return true se pode ser reembolsada, false caso contrário
     */
    public boolean canBeRefunded() {
        return isRefundable && maximumRefundAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Verifica se é um pagamento bem sucedido.
     * 
     * @return true se sucedido, false caso contrário
     */
    public boolean isSuccessful() {
        return status == PaymentStatus.SUCCEEDED;
    }
}