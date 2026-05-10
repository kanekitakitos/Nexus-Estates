package com.nexus.estates.exception;

/**
 * Exceção lançada quando uma transação de pagamento não é encontrada
 * <p>
 *     Pode ocorrer quando se tenta consultar, confirmar ou reembolsar um pagamento
 *     que não existe na base de dados local ou no provedor externo
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public class PaymentNotFoundException extends RuntimeException {

    /**
     * O identificador interno (da base de dados local) da transação não encontrada
     */
    private final String transactionId;

    /**
     * O identificador externo (do gateway de pagamento, ex: Stripe) da transação não encontrada
     */
    private final String providerTransactionId;

    /**
     * Construtor basico
     * @param message Mensagem a explicar o erro
     */
    public PaymentNotFoundException(String message) {
        super(message);
        this.transactionId = null;
        this.providerTransactionId = null;
    }

    /**
     * Construtor completo com IDs do sistema e do provedor externo
     * @param message Mensagem de erro
     * @param transactionId ID que não foi enontrado
     */
    public PaymentNotFoundException(String message, String transactionId) {
        super(message);
        this.transactionId = transactionId;
        this.providerTransactionId = null;
    }

    /**
     * Construtor completo com IDs do sistema e do provedor externo
     * @param message Mensagem de erro
     * @param transactionId ID no sistema interno
     * @param providerTransactionId ID no gateway de pagamento
     */
    public PaymentNotFoundException(String message, String transactionId, String providerTransactionId) {
        super(message);
        this.transactionId = transactionId;
        this.providerTransactionId = providerTransactionId;
    }

    /**
     * Construtor com causa raiz
     * @param message Mensagem de erro
     * @param cause Exceção original
     */
    public PaymentNotFoundException(String message, Throwable cause) {
        super(message, cause);
        this.transactionId = null;
        this.providerTransactionId = null;
    }

    /**
     * Construtor com ID de transação e causa raiz
     * @param message Mensagem de erro
     * @param transactionId ID procurado
     * @param cause Exceção original
     */
    public PaymentNotFoundException(String message, String transactionId, Throwable cause) {
        super(message, cause);
        this.transactionId = transactionId;
        this.providerTransactionId = null;
    }

    /**
     * @return O ID de transação interno que gerou a falha
     */
    public String getTransactionId() {
        return transactionId;
    }

    /**
     * @return O ID da transação no provedor externo
     */
    public String getProviderTransactionId() {
        return providerTransactionId;
    }
}
