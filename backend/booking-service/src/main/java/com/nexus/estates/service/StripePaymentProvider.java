package com.nexus.estates.service;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.exception.PaymentProcessingException;
import com.nexus.estates.exception.PaymentNotFoundException;
import com.nexus.estates.service.interfaces.PaymentGatewayProvider;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementação do provedor de pagamentos Stripe.
 * <p>
 * Esta classe adapta a API oficial do Stripe para a interface genérica {@link PaymentGatewayProvider},
 * utilizando os novos DTOs baseados em Sealed Interfaces ({@link PaymentResponse}) e Records ({@link TransactionInfo}).
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @see PaymentGatewayProvider
 */
@Service
public class StripePaymentProvider implements PaymentGatewayProvider {

    @Override
    public PaymentResponse createPaymentIntent(BigDecimal amount, String currency, String referenceId, Map<String, Object> metadata) {
        try {
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
            
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency.toLowerCase())
                    .setDescription("Booking payment for reference: " + referenceId)
                    .putAllMetadata(convertMetadata(metadata))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    );
            
            PaymentIntent stripeIntent = PaymentIntent.create(paramsBuilder.build());
            return mapToPaymentResponse(stripeIntent);
            
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to create Stripe payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentResponse confirmPaymentIntent(String paymentIntentId, Map<String, Object> metadata) {
        try {
            PaymentIntent stripeIntent = PaymentIntent.retrieve(paymentIntentId);
            PaymentIntent confirmedIntent = stripeIntent.confirm();
            return mapToPaymentResponse(confirmedIntent);
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to confirm Stripe payment: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentResponse processDirectPayment(BigDecimal amount, String currency, String referenceId, PaymentMethod paymentMethod, Map<String, Object> metadata) {
        try {
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
                    .setCurrency(currency.toLowerCase())
                    .setDescription("Direct payment for reference: " + referenceId)
                    .putAllMetadata(convertMetadata(metadata))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    );
            
            PaymentIntent stripeIntent = PaymentIntent.create(paramsBuilder.build());
            PaymentIntent confirmedIntent = stripeIntent.confirm();
            return mapToPaymentResponse(confirmedIntent);
            
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to process direct payment: " + e.getMessage(), e);
        }
    }

    @Override
    public RefundResult processRefund(String transactionId, BigDecimal amount, String currency, Optional<String> reason, Map<String, Object> metadata) {
        try {
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
            
            RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                    .setPaymentIntent(transactionId)
                    .setAmount(amountInCents)
                    .setReason(mapRefundReason(reason.orElse(null)));
            
            Refund stripeRefund = Refund.create(paramsBuilder.build());
            
            return new RefundResult(
                    stripeRefund.getId(),
                    stripeRefund.getId(),
                    transactionId,
                    BigDecimal.valueOf(stripeRefund.getAmount()).divide(BigDecimal.valueOf(100)),
                    stripeRefund.getCurrency(),
                    mapStripeRefundStatusToDto(stripeRefund.getStatus()),
                    LocalDateTime.now(),
                    reason.orElse("requested_by_customer"),
                    metadata,
                    stripeRefund.getFailureReason(),
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
        // Stripe doesn't support direct filtering by metadata without Search API
        // Returning empty list as per original implementation
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
                Map.of("3ds", true, "automatic_tax", true),
                true,
                true,
                true,
                null,
                "2026-02-26",
                "production"
        );
    }

    // --- Helper Methods ---

    private Map<String, String> convertMetadata(Map<String, Object> metadata) {
        if (metadata == null) return new HashMap<>();
        return metadata.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().toString()
                ));
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
    
    private RefundCreateParams.Reason mapRefundReason(String reason) {
        if (reason == null || reason.isEmpty()) {
            return RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER;
        }
        String lowerReason = reason.toLowerCase();
        if (lowerReason.contains("fraud")) {
            return RefundCreateParams.Reason.FRAUDULENT;
        } else if (lowerReason.contains("duplicate")) {
            return RefundCreateParams.Reason.DUPLICATE;
        } else {
            return RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER;
        }
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
                LocalDateTime.now(), // Stripe doesn't return confirmed_at on intent easily
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
            PaymentMethod.CREDIT_CARD, // Defaulting for now
            new PaymentResponse.PaymentMethodDetails("card", "****", "unknown"),
            Optional.empty(),
            Optional.ofNullable(intent.getReceiptEmail()), // approximate receipt url
            Optional.empty(),
            BigDecimal.ZERO, // refunded amount needs separate check
            true, // isRefundable
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
