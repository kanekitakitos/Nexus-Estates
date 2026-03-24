package com.nexus.estates.exception;

import java.math.BigDecimal;

public class InvalidRefundException extends RuntimeException {

    private final String transactionId;
    private final BigDecimal requestedAmount;
    private final BigDecimal availableAmount;
    private final String refundReason;

    public InvalidRefundException(String message) {
        super(message);
        this.transactionId = null;
        this.requestedAmount = null;
        this.availableAmount = null;
        this.refundReason = null;
    }

    public InvalidRefundException(String message, String transactionId) {
        super(message);
        this.transactionId = transactionId;
        this.requestedAmount = null;
        this.availableAmount = null;
        this.refundReason = null;
    }

    public InvalidRefundException(String message, String transactionId, BigDecimal requestedAmount, BigDecimal availableAmount) {
        super(message);
        this.transactionId = transactionId;
        this.requestedAmount = requestedAmount;
        this.availableAmount = availableAmount;
        this.refundReason = null;
    }

    public InvalidRefundException(String message, String transactionId, BigDecimal requestedAmount, BigDecimal availableAmount, String refundReason) {
        super(message);
        this.transactionId = transactionId;
        this.requestedAmount = requestedAmount;
        this.availableAmount = availableAmount;
        this.refundReason = refundReason;
    }

    public InvalidRefundException(String message, Throwable cause) {
        super(message, cause);
        this.transactionId = null;
        this.requestedAmount = null;
        this.availableAmount = null;
        this.refundReason = null;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public BigDecimal getRequestedAmount() {
        return requestedAmount;
    }

    public BigDecimal getAvailableAmount() {
        return availableAmount;
    }

    public String getRefundReason() {
        return refundReason;
    }

    public boolean hasAmountMismatch() {
        return requestedAmount != null && availableAmount != null;
    }
}
