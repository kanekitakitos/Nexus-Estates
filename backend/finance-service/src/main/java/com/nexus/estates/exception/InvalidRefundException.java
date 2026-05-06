package com.nexus.estates.exception;

import java.math.BigDecimal;

/**
 * Exeção lançada quando uma operação de reembolso é rejeitada ou considerada inválida
 * <p>
 *     Este erro ocorre em cenários de violação de regras de negócio, como
 *     tentar reembolsar um valor superior ao disponível, tentar reembolsar um transação
 *     que não suporta estornos, ou quando o motivo fornecido não é válida
 * </p>
 * @author Nexus Estates Team
 * @version 1.0
 */
public class InvalidRefundException extends RuntimeException {

    private final String transactionId;
    private final BigDecimal requestedAmount;
    private final BigDecimal availableAmount;
    private final String refundReason;

    /**
     * Construtor básico com mensagem de erro
     * @param message Descrição do motivo pelo qual o reembolso é inválido
     */
    public InvalidRefundException(String message) {
        super(message);
        this.transactionId = null;
        this.requestedAmount = null;
        this.availableAmount = null;
        this.refundReason = null;
    }

    /**
     * Construtor co mensagem de erro e identificador da transação
     * @param message Descrição do erro
     * @param transactionId ID interno da transação
     */
    public InvalidRefundException(String message, String transactionId) {
        super(message);
        this.transactionId = transactionId;
        this.requestedAmount = null;
        this.availableAmount = null;
        this.refundReason = null;
    }

    /**
     * Construtor para erros de discrepância de valores (tentar reembolsar mais do que o permitido)
     * @param message Descrição do erro
     * @param transactionId ID da transação
     * @param requestedAmount O valor que foi pedido para reembolso
     * @param availableAmount O saldo máximo que esatva disponível para reembolso
     */
    public InvalidRefundException(String message, String transactionId, BigDecimal requestedAmount, BigDecimal availableAmount) {
        super(message);
        this.transactionId = transactionId;
        this.requestedAmount = requestedAmount;
        this.availableAmount = availableAmount;
        this.refundReason = null;
    }

    /**
     * Construtor completo com todos os detalhes do reembolso falhado
     * @param message Descrição do erro
     * @param transactionId ID da transação
     * @param requestedAmount Valor pedido
     * @param availableAmount Valor disponível
     * @param refundReason Motivo submetido no pedido de reembolso
     */
    public InvalidRefundException(String message, String transactionId, BigDecimal requestedAmount, BigDecimal availableAmount, String refundReason) {
        super(message);
        this.transactionId = transactionId;
        this.requestedAmount = requestedAmount;
        this.availableAmount = availableAmount;
        this.refundReason = refundReason;
    }

    /**
     * Construtor com mensagem e exceção causadora (Root cause)
     * @param message Descrição do erro
     * @param cause A exceção original que originou este erro
     */
    public InvalidRefundException(String message, Throwable cause) {
        super(message, cause);
        this.transactionId = null;
        this.requestedAmount = null;
        this.availableAmount = null;
        this.refundReason = null;
    }

    /**
     * @return O ID da transação ou null
     */
    public String getTransactionId() {
        return transactionId;
    }

    /**
     * @return O valor solicitado ou null
     */
    public BigDecimal getRequestedAmount() {
        return requestedAmount;
    }

    /**
     * @return O valor disponível para estirno ou null
     */
    public BigDecimal getAvailableAmount() {
        return availableAmount;
    }

    /**
     * @return O motivo do reembolso ou null
     */
    public String getRefundReason() {
        return refundReason;
    }

    /**
     * Verifica se o erro está relacionado com valores monetários incompatíveis
     * @return true se o valor pedido e o disponível estiverem preenchidos
     */
    public boolean hasAmountMismatch() {
        return requestedAmount != null && availableAmount != null;
    }
}
