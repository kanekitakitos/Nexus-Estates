package com.nexus.estates.exception;

import java.math.BigDecimal;

/**
 * Exceção lançada quando um reembolso é inválido ou não pode ser processado.
 * <p>
 * Esta exceção é utilizada para indicar que uma solicitação de reembolso viola as regras de negócio
 * ou as restrições do provedor de pagamento.
 * </p>
 * 
 * <p><b>Cenários comuns:</b></p>
 * <ul>
 *   <li>Tentativa de reembolsar um valor maior que o disponível na transação.</li>
 *   <li>Reembolso de uma transação que já foi totalmente reembolsada.</li>
 *   <li>Tentativa de reembolso fora do prazo permitido pelo provedor.</li>
 *   <li>Reembolso de uma transação que não permite estornos (ex: boleto pago).</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public class InvalidRefundException extends RuntimeException {
    
    private final String transactionId;
    private final BigDecimal requestedAmount;
    private final BigDecimal availableAmount;
    private final String refundReason;
    
    /**
     * Construtor básico com mensagem de erro.
     *
     * @param message Descrição do erro.
     */
    public InvalidRefundException(String message) {
        super(message);
        this.transactionId = null;
        this.requestedAmount = null;
        this.availableAmount = null;
        this.refundReason = null;
    }
    
    /**
     * Construtor com ID da transação.
     *
     * @param message Descrição do erro.
     * @param transactionId ID da transação associada ao reembolso inválido.
     */
    public InvalidRefundException(String message, String transactionId) {
        super(message);
        this.transactionId = transactionId;
        this.requestedAmount = null;
        this.availableAmount = null;
        this.refundReason = null;
    }
    
    /**
     * Construtor com detalhes do valor do reembolso.
     *
     * @param message Descrição do erro.
     * @param transactionId ID da transação.
     * @param requestedAmount Valor solicitado para reembolso.
     * @param availableAmount Valor disponível para reembolso na transação.
     */
    public InvalidRefundException(String message, String transactionId, BigDecimal requestedAmount, BigDecimal availableAmount) {
        super(message);
        this.transactionId = transactionId;
        this.requestedAmount = requestedAmount;
        this.availableAmount = availableAmount;
        this.refundReason = null;
    }
    
    /**
     * Construtor completo com motivo do reembolso.
     *
     * @param message Descrição do erro.
     * @param transactionId ID da transação.
     * @param requestedAmount Valor solicitado.
     * @param availableAmount Valor disponível.
     * @param refundReason Motivo do reembolso que causou o erro.
     */
    public InvalidRefundException(String message, String transactionId, BigDecimal requestedAmount, BigDecimal availableAmount, String refundReason) {
        super(message);
        this.transactionId = transactionId;
        this.requestedAmount = requestedAmount;
        this.availableAmount = availableAmount;
        this.refundReason = refundReason;
    }
    
    /**
     * Construtor com mensagem e causa raiz.
     *
     * @param message Descrição do erro.
     * @param cause A exceção original.
     */
    public InvalidRefundException(String message, Throwable cause) {
        super(message, cause);
        this.transactionId = null;
        this.requestedAmount = null;
        this.availableAmount = null;
        this.refundReason = null;
    }
    
    /**
     * Obtém o ID da transação associada ao reembolso.
     *
     * @return O ID da transação ou null se não disponível.
     */
    public String getTransactionId() {
        return transactionId;
    }
    
    /**
     * Obtém o valor que foi solicitado para reembolso.
     *
     * @return O valor solicitado ou null se não disponível.
     */
    public BigDecimal getRequestedAmount() {
        return requestedAmount;
    }
    
    /**
     * Obtém o valor que estava disponível para reembolso no momento do erro.
     *
     * @return O valor disponível ou null se não disponível.
     */
    public BigDecimal getAvailableAmount() {
        return availableAmount;
    }
    
    /**
     * Obtém o motivo do reembolso fornecido na solicitação.
     *
     * @return O motivo do reembolso ou null se não disponível.
     */
    public String getRefundReason() {
        return refundReason;
    }
    
    /**
     * Verifica se o erro foi causado por uma discrepância de valores.
     *
     * @return true se os valores solicitado e disponível estiverem presentes, false caso contrário.
     */
    public boolean hasAmountMismatch() {
        return requestedAmount != null && availableAmount != null;
    }
}