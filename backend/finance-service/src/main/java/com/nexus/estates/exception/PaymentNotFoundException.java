package com.nexus.estates.exception;

public class PaymentNotFoundException extends RuntimeException {

    private final String transactionId;
    private final String providerTransactionId;

    public PaymentNotFoundException(String message) {
        super(message);
        this.transactionId = null;
        this.providerTransactionId = null;
    }

    public PaymentNotFoundException(String message, String transactionId) {
        super(message);
        this.transactionId = transactionId;
        this.providerTransactionId = null;
    }

    public PaymentNotFoundException(String message, String transactionId, String providerTransactionId) {
        super(message);
        this.transactionId = transactionId;
        this.providerTransactionId = providerTransactionId;
    }

    public PaymentNotFoundException(String message, Throwable cause) {
        super(message, cause);
        this.transactionId = null;
        this.providerTransactionId = null;
    }

    public PaymentNotFoundException(String message, String transactionId, Throwable cause) {
        super(message, cause);
        this.transactionId = transactionId;
        this.providerTransactionId = null;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getProviderTransactionId() {
        return providerTransactionId;
    }
}
