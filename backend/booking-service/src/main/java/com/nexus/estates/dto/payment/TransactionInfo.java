package com.nexus.estates.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * DTO que encapsula todas as informações detalhadas sobre uma transação de pagamento.
 * <p>
 * Este registro serve como uma visão unificada e completa de uma transação, agregando dados
 * financeiros, informações do cliente, método de pagamento e histórico de status.
 * É utilizado principalmente para consultas de detalhes de transações e relatórios.
 * </p>
 * 
 * @param transactionId ‘ID’ interno da transação no sistema.
 * @param providerTransactionId ‘ID’ da transação no provedor de pagamento.
 * @param amount Valor original da transação.
 * @param currency Moeda da transação.
 * @param status Estado atual da transação.
 * @param createdAt Data e hora de criação.
 * @param updatedAt Data e hora da última atualização.
 * @param referenceId ‘ID’ de referência interno (ex: ‘ID’ da reserva).
 * @param customerId ID do cliente no provedor (opcional).
 * @param customerEmail Email do cliente (opcional).
 * @param customerName Nome do cliente (opcional).
 * @param paymentMethod Tipo do método de pagamento utilizado.
 * @param paymentMethodDetails Detalhes específicos do método (ex: últimos 4 dígitos).
 * @param authorizationCode Código de autorização (opcional).
 * @param receiptUrl URL do recibo (opcional).
 * @param fees Taxas de processamento (opcional).
 * @param refundedAmount Valor total já reembolsado.
 * @param isRefundable Indica se a transação pode ser reembolsada.
 * @param maximumRefundAmount Valor máximo disponível para reembolso.
 * @param failureReason Motivo da falha, se houver.
 * @param failureCode Código de erro da falha, se houver.
 * @param metadata Metadados adicionais armazenados com a transação.
 * 
 * @author Nexus Estates Team
 * @version 1.0
 * @see PaymentStatus
 * @see PaymentMethod
 */
public record TransactionInfo(
    String transactionId,
    String providerTransactionId,
    BigDecimal amount,
    String currency,
    PaymentStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    String referenceId,
    
    Optional<String> customerId,
    Optional<String> customerEmail,
    Optional<String> customerName,
    
    PaymentMethod paymentMethod,
    PaymentResponse.PaymentMethodDetails paymentMethodDetails,
    
    Optional<String> authorizationCode,
    Optional<String> receiptUrl,
    Optional<BigDecimal> fees,
    
    BigDecimal refundedAmount,
    boolean isRefundable,
    Optional<BigDecimal> maximumRefundAmount,
    
    Optional<String> failureReason,
    Optional<String> failureCode,
    
    Map<String, Object> metadata
) {
    
    /**
     * Verifica se a transação foi concluída com sucesso.
     * @return true se o status for SUCCEEDED.
     */
    public boolean isSuccessful() {
        return status == PaymentStatus.SUCCEEDED;
    }
    
    /**
     * Verifica se a transação é elegível para reembolso.
     * @return true se for reembolsável e houver saldo disponível.
     */
    public boolean canBeRefunded() {
        return isRefundable && maximumRefundAmount.map(max -> max.compareTo(BigDecimal.ZERO) > 0).orElse(false);
    }
    
    /**
     * Verifica se a transação sofreu um reembolso parcial.
     * @return true se houver valor reembolsado mas menor que o total.
     */
    public boolean isPartiallyRefunded() {
        return refundedAmount != null && refundedAmount.compareTo(BigDecimal.ZERO) > 0 && refundedAmount.compareTo(amount) < 0;
    }
    
    /**
     * Verifica se a transação foi totalmente reembolsada.
     * @return true se o valor reembolsado for igual ao valor original.
     */
    public boolean isFullyRefunded() {
        return refundedAmount != null && refundedAmount.compareTo(amount) == 0;
    }
}