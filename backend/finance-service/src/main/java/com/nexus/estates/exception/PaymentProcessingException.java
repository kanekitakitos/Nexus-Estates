package com.nexus.estates.exception;

/**
 * Exceção lançada quando ocorre uma falha na comunicação ou processamento junto do Gateway de Pagamento
 * <p>
 *     Encapsula erros técnicos ou erros de negócios reportados diretamente pelo provedor
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public class PaymentProcessingException extends RuntimeException {

    private final String providerErrorCode;
    private final String providerErrorMessage;
    private final String transactionId;

    /**
     * Construtor básico para erros gerais
     * @param message Descrição do erro
     */
    public PaymentProcessingException(String message) {
        super(message);
        this.providerErrorCode = null;
        this.providerErrorMessage = null;
        this.transactionId = null;
    }

    /**
     * Construtor com causa técnica subjacente
     * @param message Descrição do erro
     * @param cause A exceção técnica original
     */
    public PaymentProcessingException(String message, Throwable cause) {
        super(message, cause);
        this.providerErrorCode = null;
        this.providerErrorMessage = null;
        this.transactionId = null;
    }

    /**
     * Construtor para erros reportados especificamente pelo provedor externo
     * @param message Mensagem interna do sistema
     * @param providerErrorCode Código de erro devolvido pelo porvedor
     * @param providerErrorMessage Mensagem legível devolvida pelo provedor
     */
    public PaymentProcessingException(String message, String providerErrorCode, String providerErrorMessage) {
        super(message);
        this.providerErrorCode = providerErrorCode;
        this.providerErrorMessage = providerErrorMessage;
        this.transactionId = null;
    }

    /**
     * Construtor com detalhes do provedor e identificador da transação falhada
     * @param message Mensagem interna
     * @param providerErrorCode Código do provedor
     * @param providerErrorMessage Mensagem do provedor
     * @param transactionId O ID da transação onde ocorreu a falha
     */
    public PaymentProcessingException(String message, String providerErrorCode, String providerErrorMessage, String transactionId) {
        super(message);
        this.providerErrorCode = providerErrorCode;
        this.providerErrorMessage = providerErrorMessage;
        this.transactionId = transactionId;
    }

    /**
     * Construtor completo com todos os detalhes e a causa técnica
     * @param message Mensagem interna
     * @param providerErrorCode Código do provedor
     * @param providerErrorMessage Mensagem do provedor
     * @param transactionId ID da transação
     * @param cause Exceção original
     */
    public PaymentProcessingException(String message, String providerErrorCode, String providerErrorMessage, String transactionId, Throwable cause) {
        super(message, cause);
        this.providerErrorCode = providerErrorCode;
        this.providerErrorMessage = providerErrorMessage;
        this.transactionId = transactionId;
    }

    /**
     * @return O código de erro devolvido pelo sistema externoi
     */
    public String getProviderErrorCode() {
        return providerErrorCode;
    }

    /**
     * @return A mensagem de erro devolvida pelo sistema externo
     */
    public String getProviderErrorMessage() {
        return providerErrorMessage;
    }

    /**
     * @return O ID da transação associada ao erro
     */
    public String getTransactionId() {
        return transactionId;
    }

    /**
     * Verifica se a exceção contém detalhes de erro específicos de uma provedor externo
     * @return true se o código ou a mensagem do provedor estiverem preenchidos
     */
    public boolean hasProviderError() {
        return providerErrorCode != null || providerErrorMessage != null;
    }
}
