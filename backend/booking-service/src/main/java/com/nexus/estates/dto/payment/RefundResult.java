package com.nexus.estates.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO que representa o resultado de uma operação de reembolso.
 * <p>
 * Contém os detalhes do reembolso processado, incluindo identificadores, valores,
 * status e metadados associados.
 * </p>
 * 
 * @param refundId ‘ID’ interno do reembolso.
 * @param providerRefundId ID do reembolso no provedor de pagamento.
 * @param originalTransactionId ‘ID’ da transação original reembolsada.
 * @param refundedAmount Valor reembolsado nesta operação.
 * @param currency Moeda do reembolso.
 * @param status Estado atual do reembolso.
 * @param processedAt Data e hora do processamento.
 * @param reason Motivo do reembolso.
 * @param metadata Metadados adicionais.
 * @param failureReason Motivo da falha, se o reembolso não foi bem sucedido.
 * @param refundFees Taxas associadas ao reembolso (se houver).
 * 
 * @author Nexus Estates Team
 * @version 1.0
 * @see RefundStatus
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
     * Verifica se o reembolso foi processado com sucesso.
     * @return true se o status for SUCCEEDED.
     */
    public boolean isSuccessful() {
        return status == RefundStatus.SUCCEEDED;
    }

    /**
     * Verifica se a operação de reembolso falhou.
     * @return true se o status for FAILED.
     */
    public boolean isFailed() {
        return status == RefundStatus.FAILED;
    }
}