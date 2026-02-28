package com.nexus.estates.exception;

/**
 * Exceção lançada quando uma transação de pagamento não é encontrada.
 * <p>
 * Esta exceção é utilizada quando o sistema tenta recuperar ou manipular uma transação
 * que não existe no provedor de pagamento ou no banco de dados local.
 * </p>
 * 
 * <p><b>Cenários comuns:</b></p>
 * <ul>
 *   <li>Tentativa de confirmar um pagamento com um ID inválido.</li>
 *   <li>Consulta de status de uma transação expirada ou removida.</li>
 *   <li>Erro de sincronização entre o ID armazenado e o provedor.</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public class PaymentNotFoundException extends RuntimeException {
    
    private final String transactionId;
    private final String providerTransactionId;
    
    /**
     * Construtor básico com mensagem de erro.
     *
     * @param message Descrição do erro.
     */
    public PaymentNotFoundException(String message) {
        super(message);
        this.transactionId = null;
        this.providerTransactionId = null;
    }
    
    /**
     * Construtor com ID da transação interna.
     *
     * @param message Descrição do erro.
     * @param transactionId ID interno da transação não encontrada.
     */
    public PaymentNotFoundException(String message, String transactionId) {
        super(message);
        this.transactionId = transactionId;
        this.providerTransactionId = null;
    }
    
    /**
     * Construtor com ID da transação interna e do provedor.
     *
     * @param message Descrição do erro.
     * @param transactionId ID interno da transação.
     * @param providerTransactionId ID da transação no provedor de pagamento.
     */
    public PaymentNotFoundException(String message, String transactionId, String providerTransactionId) {
        super(message);
        this.transactionId = transactionId;
        this.providerTransactionId = providerTransactionId;
    }
    
    /**
     * Construtor com mensagem e causa raiz.
     *
     * @param message Descrição do erro.
     * @param cause A exceção original.
     */
    public PaymentNotFoundException(String message, Throwable cause) {
        super(message, cause);
        this.transactionId = null;
        this.providerTransactionId = null;
    }
    
    /**
     * Construtor com ID da transação e causa raiz.
     *
     * @param message Descrição do erro.
     * @param transactionId ID interno da transação.
     * @param cause A exceção original.
     */
    public PaymentNotFoundException(String message, String transactionId, Throwable cause) {
        super(message, cause);
        this.transactionId = transactionId;
        this.providerTransactionId = null;
    }
    
    /**
     * Obtém o ID interno da transação que não foi encontrada.
     *
     * @return O ID da transação ou null se não disponível.
     */
    public String getTransactionId() {
        return transactionId;
    }
    
    /**
     * Obtém o ID da transação no provedor de pagamento.
     *
     * @return O ID do provedor ou null se não disponível.
     */
    public String getProviderTransactionId() {
        return providerTransactionId;
    }
}