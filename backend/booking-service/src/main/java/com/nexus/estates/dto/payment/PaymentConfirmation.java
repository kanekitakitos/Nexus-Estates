package com.nexus.estates.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Confirmação de pagamento com detalhes do resultado.
 * 
 * Contém informações sobre o pagamento confirmado, incluindo
 * dados da transação e status final.
 */
public record PaymentConfirmation(
    String transactionId,
    String providerTransactionId,
    PaymentStatus status,
    LocalDateTime confirmedAt,
    String authorizationCode,
    String receiptUrl,
    Map<String, Object> metadata,
    BigDecimal fees,
    String paymentMethodType,
    String lastFourDigits,
    String brand,
    boolean requiresCapture
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
     * Verifica se requer captura manual.
     * 
     * @return true se requer captura, false caso contrário
     */
    public boolean requiresManualCapture() {
        return requiresCapture;
    }
}