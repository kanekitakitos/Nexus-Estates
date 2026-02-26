package com.nexus.estates.service;

import com.nexus.estates.dto.payment.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentGatewayProviderTest {

    @Mock
    private PaymentGatewayProvider paymentGatewayProvider;

    @Test
    @DisplayName("Should create payment intent successfully")
    void shouldCreatePaymentIntentSuccessfully() {
        BigDecimal amount = new BigDecimal("300.00");
        String currency = "EUR";
        String referenceId = "booking-123";
        Map<String, Object> metadata = Map.of("propertyId", "10", "userId", "20");
        
        PaymentIntent expectedIntent = new PaymentIntent(
            "pi_123456",
            "Stripe",
            amount,
            currency,
            referenceId,
            PaymentStatus.PENDING,
            "client_secret_123",
            LocalDateTime.now(),
            null,
            metadata,
            null,
            false,
            null
        );
        
        when(paymentGatewayProvider.createPaymentIntent(amount, currency, referenceId, metadata))
            .thenReturn(expectedIntent);
        
        PaymentIntent result = paymentGatewayProvider.createPaymentIntent(amount, currency, referenceId, metadata);
        
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo("pi_123456");
        assertThat(result.status()).isEqualTo(PaymentStatus.PENDING);
        assertThat(result.currency()).isEqualTo(currency);
        assertThat(result.amount()).isEqualByComparingTo(amount);
        
        verify(paymentGatewayProvider).createPaymentIntent(amount, currency, referenceId, metadata);
    }

    @Test
    @DisplayName("Should confirm payment successfully")
    void shouldConfirmPaymentSuccessfully() {
        String paymentIntentId = "pi_123456";
        Map<String, Object> metadata = Map.of("cardToken", "tok_visa");
        
        PaymentConfirmation confirmedIntent = new PaymentConfirmation(
            paymentIntentId,
            paymentIntentId,
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now(),
            "auth_code",
            "receipt_url",
            metadata,
            BigDecimal.ZERO,
            "card",
            "4242",
            "visa",
            false
        );
        
        when(paymentGatewayProvider.confirmPaymentIntent(paymentIntentId, metadata))
            .thenReturn(confirmedIntent);
        
        PaymentConfirmation result = paymentGatewayProvider.confirmPaymentIntent(paymentIntentId, metadata);
        
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        verify(paymentGatewayProvider).confirmPaymentIntent(paymentIntentId, metadata);
    }

    @Test
    @DisplayName("Should process refund successfully")
    void shouldProcessRefundSuccessfully() {
        String transactionId = "txn_123456";
        BigDecimal refundAmount = new BigDecimal("150.00");
        String reason = "Partial refund";
        Map<String, Object> metadata = Map.of();
        
        RefundResult refundResult = new RefundResult(
            "refund_789",
            "refund_789",
            transactionId,
            refundAmount,
            "EUR",
            RefundStatus.SUCCEEDED,
            LocalDateTime.now(),
            reason,
            metadata,
            null,
            BigDecimal.ZERO
        );
        
        when(paymentGatewayProvider.processRefund(transactionId, refundAmount, "EUR", Optional.of(reason), metadata))
            .thenReturn(refundResult);
        
        RefundResult result = paymentGatewayProvider.processRefund(transactionId, refundAmount, "EUR", Optional.of(reason), metadata);
        
        assertThat(result).isNotNull();
        assertThat(result.refundId()).isEqualTo("refund_789");
        assertThat(result.status()).isEqualTo(RefundStatus.SUCCEEDED);
        assertThat(result.refundedAmount()).isEqualByComparingTo(refundAmount);
        assertThat(result.originalTransactionId()).isEqualTo(transactionId);
        verify(paymentGatewayProvider).processRefund(transactionId, refundAmount, "EUR", Optional.of(reason), metadata);
    }

    @Test
    @DisplayName("Should retrieve transaction successfully")
    void shouldRetrieveTransactionSuccessfully() {
        String transactionId = "txn_123456";
        
        TransactionDetails transaction = new TransactionDetails(
            transactionId,
            transactionId,
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now(),
            LocalDateTime.now(),
            "booking-123",
            "cust_123",
            "test@test.com",
            "Test User",
            PaymentMethod.CREDIT_CARD,
            "card",
            "4242",
            "visa",
            "auth_code",
            "receipt_url",
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            null,
            null,
            Map.of(),
            true,
            new BigDecimal("300.00")
        );
        
        when(paymentGatewayProvider.getTransactionDetails(transactionId))
            .thenReturn(transaction);
        
        TransactionDetails result = paymentGatewayProvider.getTransactionDetails(transactionId);
        
        assertThat(result).isNotNull();
        assertThat(result.transactionId()).isEqualTo(transactionId);
        assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        verify(paymentGatewayProvider).getTransactionDetails(transactionId);
    }

    @Test
    @DisplayName("Should retrieve transactions by reference")
    void shouldRetrieveTransactionsByReference() {
        String referenceId = "booking-123";
        
        TransactionSummary transaction1 = new TransactionSummary(
            "txn_111",
            "txn_111",
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now().minusHours(2),
            referenceId,
            PaymentMethod.CREDIT_CARD,
            "4242",
            "visa",
            BigDecimal.ZERO
        );
        
        TransactionSummary transaction2 = new TransactionSummary(
            "txn_222",
            "txn_222",
            new BigDecimal("150.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now().minusHours(1),
            referenceId,
            PaymentMethod.CREDIT_CARD,
            "4242",
            "visa",
            BigDecimal.ZERO
        );

        when(paymentGatewayProvider.getTransactionsByReference(referenceId))
            .thenReturn(List.of(transaction1, transaction2));
        
        List<TransactionSummary> result = paymentGatewayProvider.getTransactionsByReference(referenceId);
        
        assertThat(result).hasSize(2);
        assertThat(result.get(0).referenceId()).isEqualTo(referenceId);
        assertThat(result.get(1).referenceId()).isEqualTo(referenceId);
        verify(paymentGatewayProvider).getTransactionsByReference(referenceId);
    }
}