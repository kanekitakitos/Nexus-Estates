package com.nexus.estates.exception;

/**
 * Exceção lançada quando ocorre um erro no processamento de pagamento.
 * <p>
 * Esta exceção encapsula erros que ocorrem durante a comunicação com o provedor de pagamento
 * ou durante o processamento da transação. Ela fornece detalhes adicionais como o código de erro
 * do provedor e o ID da transação, facilitando o diagnóstico e a resolução de problemas.
 * </p>
 * 
 * <p><b>Cenários comuns:</b></p>
 * <ul>
 *   <li>Falha na comunicação com a API do gateway (timeout, erro 5xx).</li>
 *   <li>Recusa do pagamento pelo emissor do cartão.</li>
 *   <li>Dados de pagamento inválidos ou malformados.</li>
 *   <li>Erro interno na lógica de processamento.</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public class PaymentProcessingException extends RuntimeException {
    
    private final String providerErrorCode;
    private final String providerErrorMessage;
    private final String transactionId;
    
    /**
     * Construtor básico com mensagem de erro.
     *
     * @param message Descrição do erro ocorrido.
     */
    public PaymentProcessingException(String message) {
        super(message);
        this.providerErrorCode = null;
        this.providerErrorMessage = null;
        this.transactionId = null;
    }
    
    /**
     * Construtor com mensagem e causa raiz.
     *
     * @param message Descrição do erro.
     * @param cause A exceção original que causou este erro.
     */
    public PaymentProcessingException(String message, Throwable cause) {
        super(message, cause);
        this.providerErrorCode = null;
        this.providerErrorMessage = null;
        this.transactionId = null;
    }
    
    /**
     * Construtor com detalhes do erro do provedor.
     *
     * @param message Descrição do erro.
     * @param providerErrorCode Código de erro retornado pelo provedor de pagamento.
     * @param providerErrorMessage Mensagem de erro detalhada do provedor.
     */
    public PaymentProcessingException(String message, String providerErrorCode, String providerErrorMessage) {
        super(message);
        this.providerErrorCode = providerErrorCode;
        this.providerErrorMessage = providerErrorMessage;
        this.transactionId = null;
    }
    
    /**
     * Construtor completo com ID da transação.
     *
     * @param message Descrição do erro.
     * @param providerErrorCode Código de erro retornado pelo provedor.
     * @param providerErrorMessage Mensagem de erro detalhada do provedor.
     * @param transactionId ID da transação associada ao erro (se houver).
     */
    public PaymentProcessingException(String message, String providerErrorCode, String providerErrorMessage, String transactionId) {
        super(message);
        this.providerErrorCode = providerErrorCode;
        this.providerErrorMessage = providerErrorMessage;
        this.transactionId = transactionId;
    }
    
    /**
     * Construtor completo com causa raiz.
     *
     * @param message Descrição do erro.
     * @param providerErrorCode Código de erro retornado pelo provedor.
     * @param providerErrorMessage Mensagem de erro detalhada do provedor.
     * @param transactionId ID da transação associada.
     * @param cause A exceção original.
     */
    public PaymentProcessingException(String message, String providerErrorCode, String providerErrorMessage, String transactionId, Throwable cause) {
        super(message, cause);
        this.providerErrorCode = providerErrorCode;
        this.providerErrorMessage = providerErrorMessage;
        this.transactionId = transactionId;
    }
    
    /**
     * Obtém o código de erro específico do provedor de pagamento.
     *
     * @return O código de erro (ex: "card_declined") ou null se não disponível.
     */
    public String getProviderErrorCode() {
        return providerErrorCode;
    }
    
    /**
     * Obtém a mensagem de erro detalhada fornecida pelo provedor.
     *
     * @return A mensagem de erro do provedor ou null se não disponível.
     */
    public String getProviderErrorMessage() {
        return providerErrorMessage;
    }
    
    /**
     * Obtém o ID da transação onde ocorreu o erro.
     *
     * @return O ID da transação ou null se o erro ocorreu antes da criação da transação.
     */
    public String getTransactionId() {
        return transactionId;
    }
    
    /**
     * Verifica se a exceção contém detalhes de erro do provedor.
     *
     * @return true se houver código ou mensagem de erro do provedor, false caso contrário.
     */
    public boolean hasProviderError() {
        return providerErrorCode != null || providerErrorMessage != null;
    }
}