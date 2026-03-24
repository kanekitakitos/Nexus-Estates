package com.nexus.estates.exception;

public class PaymentProcessingException extends RuntimeException {

    private final String providerErrorCode;
    private final String providerErrorMessage;
    private final String transactionId;

    public PaymentProcessingException(String message) {
        super(message);
        this.providerErrorCode = null;
        this.providerErrorMessage = null;
        this.transactionId = null;
    }

    public PaymentProcessingException(String message, Throwable cause) {
        super(message, cause);
        this.providerErrorCode = null;
        this.providerErrorMessage = null;
        this.transactionId = null;
    }

    public PaymentProcessingException(String message, String providerErrorCode, String providerErrorMessage) {
        super(message);
        this.providerErrorCode = providerErrorCode;
        this.providerErrorMessage = providerErrorMessage;
        this.transactionId = null;
    }

    public PaymentProcessingException(String message, String providerErrorCode, String providerErrorMessage, String transactionId) {
        super(message);
        this.providerErrorCode = providerErrorCode;
        this.providerErrorMessage = providerErrorMessage;
        this.transactionId = transactionId;
    }

    public PaymentProcessingException(String message, String providerErrorCode, String providerErrorMessage, String transactionId, Throwable cause) {
        super(message, cause);
        this.providerErrorCode = providerErrorCode;
        this.providerErrorMessage = providerErrorMessage;
        this.transactionId = transactionId;
    }

    public String getProviderErrorCode() {
        return providerErrorCode;
    }

    public String getProviderErrorMessage() {
        return providerErrorMessage;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public boolean hasProviderError() {
        return providerErrorCode != null || providerErrorMessage != null;
    }
}
