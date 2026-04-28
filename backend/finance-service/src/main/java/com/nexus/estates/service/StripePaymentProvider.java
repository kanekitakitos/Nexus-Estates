package com.nexus.estates.service;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.exception.PaymentNotFoundException;
import com.nexus.estates.exception.PaymentProcessingException;
import com.nexus.estates.service.interfaces.PaymentGatewayProvider;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
public class StripePaymentProvider implements PaymentGatewayProvider {

    @Value("${stripe.publishable.key:}")
    private String stripePublishableKey;

    /**
     * Identificador do provider (Strategy).
     */
    @Override
    public String providerKey() {
        return "STRIPE";
    }

    @Override
    public PaymentResponse createPaymentIntent(BigDecimal amount, String currency, String referenceId, Map<String, Object> metadata) {
        try {
            long stripeAmount = amount.multiply(BigDecimal.valueOf(100)).longValue();
            String stripeCurrency = currency.toLowerCase(Locale.ROOT);

            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(stripeAmount)
                    .setCurrency(stripeCurrency)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                    );

            Map<String, String> stripeMetadata = new HashMap<>();
            stripeMetadata.put("reference_id", referenceId);
            if (metadata != null) {
                metadata.forEach((k, v) -> stripeMetadata.put(k, v != null ? String.valueOf(v) : ""));
            }
            paramsBuilder.putAllMetadata(stripeMetadata);

            PaymentIntent intent = PaymentIntent.create(paramsBuilder.build());
            return mapToPaymentResponse(intent);
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to create Stripe payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentResponse confirmPaymentIntent(String paymentIntentId, Map<String, Object> metadata) {
        try {
            PaymentIntent stripeIntent = PaymentIntent.retrieve(paymentIntentId);
            if ("requires_confirmation".equals(stripeIntent.getStatus())) {
                stripeIntent = stripeIntent.confirm();
            }
            return mapToPaymentResponse(stripeIntent);
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to confirm Stripe payment: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentResponse processDirectPayment(BigDecimal amount, String currency, String referenceId, PaymentMethod paymentMethod, Map<String, Object> metadata) {
        try {
            long stripeAmount = amount.multiply(BigDecimal.valueOf(100)).longValue();
            String stripeCurrency = currency.toLowerCase(Locale.ROOT);

            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(stripeAmount)
                    .setCurrency(stripeCurrency)
                    .setConfirm(true)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                    );

            Map<String, String> stripeMetadata = new HashMap<>();
            stripeMetadata.put("reference_id", referenceId);
            stripeMetadata.put("payment_method", paymentMethod != null ? paymentMethod.name() : "UNKNOWN");
            if (metadata != null) {
                metadata.forEach((k, v) -> stripeMetadata.put(k, v != null ? String.valueOf(v) : ""));
            }
            paramsBuilder.putAllMetadata(stripeMetadata);

            PaymentIntent intent = PaymentIntent.create(paramsBuilder.build());
            return mapToPaymentResponse(intent);
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to process Stripe direct payment: " + e.getMessage(), e);
        }
    }

    @Override
    public RefundResult processRefund(String transactionId, BigDecimal amount, String currency, Optional<String> reason, Map<String, Object> metadata) {
        try {
            RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                    .setPaymentIntent(transactionId);

            if (amount != null) {
                long stripeAmount = amount.multiply(BigDecimal.valueOf(100)).longValue();
                paramsBuilder.setAmount(stripeAmount);
            }

            if (reason != null && reason.isPresent()) {
                paramsBuilder.setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER);
            }

            if (metadata != null) {
                Map<String, String> stripeMetadata = new HashMap<>();
                metadata.forEach((k, v) -> stripeMetadata.put(k, v != null ? String.valueOf(v) : ""));
                paramsBuilder.putAllMetadata(stripeMetadata);
            }

            Refund refund = Refund.create(paramsBuilder.build());

            RefundStatus status = mapStripeRefundStatusToDto(refund.getStatus());
            BigDecimal refundedAmount = BigDecimal.valueOf(refund.getAmount()).divide(BigDecimal.valueOf(100));

            return new RefundResult(
                    refund.getId(),
                    refund.getId(),
                    transactionId,
                    refundedAmount,
                    refund.getCurrency(),
                    status,
                    LocalDateTime.now(),
                    reason != null ? reason.orElse(null) : null,
                    metadata != null ? metadata : Map.of(),
                    status == RefundStatus.FAILED ? "Refund failed" : null,
                    BigDecimal.ZERO
            );
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to process Stripe refund: " + e.getMessage(), e);
        }
    }

    @Override
    public TransactionInfo getTransactionDetails(String transactionId) {
        try {
            PaymentIntent stripeIntent = PaymentIntent.retrieve(transactionId);
            return mapToTransactionInfo(stripeIntent);
        } catch (StripeException e) {
            throw new PaymentNotFoundException("Transaction not found: " + transactionId);
        }
    }

    @Override
    public PaymentStatus getPaymentStatus(String transactionId) {
        try {
            PaymentIntent stripeIntent = PaymentIntent.retrieve(transactionId);
            return mapStripeStatusToDto(stripeIntent.getStatus());
        } catch (StripeException e) {
            throw new PaymentNotFoundException("Transaction not found: " + transactionId);
        }
    }

    @Override
    public List<TransactionInfo> getTransactionsByReference(String referenceId) {
        return Collections.emptyList();
    }

    @Override
    public boolean supportsPaymentMethod(PaymentMethod paymentMethod) {
        return paymentMethod == PaymentMethod.CREDIT_CARD ||
                paymentMethod == PaymentMethod.DEBIT_CARD ||
                paymentMethod == PaymentMethod.BANK_TRANSFER;
    }

    @Override
    public ProviderInfo getProviderInfo() {
        return new ProviderInfo(
                "Stripe",
                "0.1.0",
                "Payment processing via Stripe API",
                List.of(PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD, PaymentMethod.BANK_TRANSFER),
                List.of("EUR", "USD", "GBP"),
                Map.of("3ds", true, "automatic_tax", true, "publishableKey", stripePublishableKey),
                true,
                true,
                true,
                null,
                "2026-02-26",
                "production"
        );
    }

    private PaymentStatus mapStripeStatusToDto(String stripeStatus) {
        if (stripeStatus == null) return PaymentStatus.UNKNOWN;
        return switch (stripeStatus) {
            case "requires_payment_method", "requires_confirmation" -> PaymentStatus.PENDING;
            case "requires_action" -> PaymentStatus.REQUIRES_ACTION;
            case "processing" -> PaymentStatus.PROCESSING;
            case "requires_capture" -> PaymentStatus.REQUIRES_CAPTURE;
            case "succeeded" -> PaymentStatus.SUCCEEDED;
            case "canceled" -> PaymentStatus.CANCELLED;
            default -> PaymentStatus.UNKNOWN;
        };
    }

    private RefundStatus mapStripeRefundStatusToDto(String stripeStatus) {
        if (stripeStatus == null) return RefundStatus.UNKNOWN;
        return switch (stripeStatus) {
            case "pending" -> RefundStatus.PENDING;
            case "succeeded" -> RefundStatus.SUCCEEDED;
            case "failed" -> RefundStatus.FAILED;
            case "canceled" -> RefundStatus.CANCELLED;
            default -> RefundStatus.UNKNOWN;
        };
    }

    private PaymentResponse mapToPaymentResponse(PaymentIntent intent) {
        PaymentStatus status = mapStripeStatusToDto(intent.getStatus());

        return switch (status) {
            case SUCCEEDED -> new PaymentResponse.Success(
                    intent.getId(),
                    intent.getId(),
                    BigDecimal.valueOf(intent.getAmount()).divide(BigDecimal.valueOf(100)),
                    intent.getCurrency(),
                    status,
                    LocalDateTime.now(),
                    intent.getReceiptEmail(),
                    null,
                    BigDecimal.ZERO,
                    new PaymentResponse.PaymentMethodDetails("card", "****", "unknown"),
                    convertStripeMetadata(intent.getMetadata())
            );

            case REQUIRES_ACTION -> new PaymentResponse.RequiresAction(
                    intent.getId(),
                    status,
                    intent.getClientSecret(),
                    intent.getNextAction() != null ? intent.getNextAction().getType() : "unknown",
                    null,
                    convertStripeMetadata(intent.getMetadata())
            );

            case CANCELLED, UNKNOWN -> new PaymentResponse.Failure(
                    intent.getId(),
                    status,
                    intent.getLastPaymentError() != null ? intent.getLastPaymentError().getCode() : "error",
                    intent.getLastPaymentError() != null ? intent.getLastPaymentError().getMessage() : "Payment failed or canceled",
                    LocalDateTime.now(),
                    convertStripeMetadata(intent.getMetadata())
            );

            default -> new PaymentResponse.Intent(
                    intent.getId(),
                    intent.getClientSecret(),
                    BigDecimal.valueOf(intent.getAmount()).divide(BigDecimal.valueOf(100)),
                    intent.getCurrency(),
                    status,
                    convertStripeMetadata(intent.getMetadata())
            );
        };
    }

    private TransactionInfo mapToTransactionInfo(PaymentIntent intent) {
        PaymentStatus status = mapStripeStatusToDto(intent.getStatus());

        return new TransactionInfo(
                intent.getId(),
                intent.getId(),
                BigDecimal.valueOf(intent.getAmount()).divide(BigDecimal.valueOf(100)),
                intent.getCurrency(),
                status,
                LocalDateTime.ofInstant(java.time.Instant.ofEpochSecond(intent.getCreated()), ZoneId.systemDefault()),
                LocalDateTime.now(),
                intent.getMetadata().getOrDefault("reference_id", "unknown"),
                Optional.ofNullable(intent.getCustomer()),
                Optional.ofNullable(intent.getReceiptEmail()),
                Optional.empty(),
                PaymentMethod.CREDIT_CARD,
                new PaymentResponse.PaymentMethodDetails("card", "****", "unknown"),
                Optional.empty(),
                Optional.ofNullable(intent.getReceiptEmail()),
                Optional.empty(),
                BigDecimal.ZERO,
                true,
                Optional.of(BigDecimal.valueOf(intent.getAmount()).divide(BigDecimal.valueOf(100))),
                Optional.ofNullable(intent.getLastPaymentError() != null ? intent.getLastPaymentError().getMessage() : null),
                Optional.ofNullable(intent.getLastPaymentError() != null ? intent.getLastPaymentError().getCode() : null),
                convertStripeMetadata(intent.getMetadata())
        );
    }

    private Map<String, Object> convertStripeMetadata(Map<String, String> metadata) {
        if (metadata == null) return new HashMap<>();
        Map<String, Object> result = new HashMap<>();
        metadata.forEach(result::put);
        return result;
    }
}
