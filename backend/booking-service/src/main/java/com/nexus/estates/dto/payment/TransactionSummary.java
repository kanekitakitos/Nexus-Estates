package com.nexus.estates.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Resumo de uma transação de pagamento.
 * 
 * Versão simplificada dos detalhes da transação,
 * útil para listagens e visões gerais.
 */
public record TransactionSummary(
    String transactionId,
    String providerTransactionId,
    BigDecimal amount,
    String currency,
    PaymentStatus status,
    LocalDateTime createdAt,
    String referenceId,
    PaymentMethod paymentMethod,
    String lastFourDigits,
    String brand,
    BigDecimal refundedAmount
) {
    /**
     * Verifica se é uma transação bem sucedida.
     * 
     * @return true se sucedida, false caso contrário
     */
    public boolean isSuccessful() {
        return status == PaymentStatus.SUCCEEDED;
    }

    /**
     * Verifica se foi parcialmente reembolsada.
     * 
     * @return true se parcialmente reembolsada, false caso contrário
     */
    public boolean isPartiallyRefunded() {
        return refundedAmount != null && refundedAmount.compareTo(BigDecimal.ZERO) > 0 && refundedAmount.compareTo(amount) < 0;
    }

    /**
     * Verifica se foi totalmente reembolsada.
     * 
     * @return true se totalmente reembolsada, false caso contrário
     */
    public boolean isFullyRefunded() {
        return refundedAmount != null && refundedAmount.compareTo(amount) == 0;
    }
}