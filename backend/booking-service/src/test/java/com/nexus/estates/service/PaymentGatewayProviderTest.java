package com.nexus.estates.service;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.service.interfaces.PaymentGatewayProvider;
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
        
        PaymentResponse.Intent expectedIntent = new PaymentResponse.Intent(
            "pi_123456",
            "client_secret_123",
            amount,
            currency,
            PaymentStatus.PENDING,
            metadata
        );
        
        when(paymentGatewayProvider.createPaymentIntent(amount, currency, referenceId, metadata))
            .thenReturn(expectedIntent);
        
        PaymentResponse result = paymentGatewayProvider.createPaymentIntent(amount, currency, referenceId, metadata);
        
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(PaymentResponse.Intent.class);
        
        PaymentResponse.Intent intent = (PaymentResponse.Intent) result;
        assertThat(intent.transactionId()).isEqualTo("pi_123456");
        assertThat(intent.status()).isEqualTo(PaymentStatus.PENDING);
        assertThat(intent.currency()).isEqualTo(currency);
        assertThat(intent.amount()).isEqualByComparingTo(amount);
        
        verify(paymentGatewayProvider).createPaymentIntent(amount, currency, referenceId, metadata);
    }

    @Test
    @DisplayName("Should confirm payment successfully")
    void shouldConfirmPaymentSuccessfully() {
        String paymentIntentId = "pi_123456";
        Map<String, Object> metadata = Map.of("cardToken", "tok_visa");
        
        PaymentResponse.Success confirmedIntent = new PaymentResponse.Success(
            paymentIntentId,
            paymentIntentId,
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now(),
            "receipt_url",
            "auth_code",
            BigDecimal.ZERO,
            new PaymentResponse.PaymentMethodDetails("card", "4242", "visa"),
            metadata
        );
        
        when(paymentGatewayProvider.confirmPaymentIntent(paymentIntentId, metadata))
            .thenReturn(confirmedIntent);
        
        PaymentResponse result = paymentGatewayProvider.confirmPaymentIntent(paymentIntentId, metadata);
        
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(PaymentResponse.Success.class);
        
        PaymentResponse.Success success = (PaymentResponse.Success) result;
        assertThat(success.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        assertThat(success.transactionId()).isEqualTo(paymentIntentId);
        
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
        
        TransactionInfo transaction = new TransactionInfo(
            transactionId,
            transactionId,
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now(),
            LocalDateTime.now(),
            "booking-123",
            Optional.of("cust_123"),
            Optional.of("test@test.com"),
            Optional.of("Test User"),
            PaymentMethod.CREDIT_CARD,
            new PaymentResponse.PaymentMethodDetails("card", "4242", "visa"),
            Optional.of("auth_code"),
            Optional.of("receipt_url"),
            Optional.of(BigDecimal.ZERO),
            BigDecimal.ZERO,
            true,
            Optional.of(new BigDecimal("300.00")),
            Optional.empty(),
            Optional.empty(),
            Map.of()
        );
        
        when(paymentGatewayProvider.getTransactionDetails(transactionId))
            .thenReturn(transaction);
        
        TransactionInfo result = paymentGatewayProvider.getTransactionDetails(transactionId);
        
        assertThat(result).isNotNull();
        assertThat(result.transactionId()).isEqualTo(transactionId);
        assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        verify(paymentGatewayProvider).getTransactionDetails(transactionId);
    }

    @Test
    @DisplayName("Should retrieve transactions by reference")
    void shouldRetrieveTransactionsByReference() {
        String referenceId = "booking-123";
        
        TransactionInfo transaction1 = new TransactionInfo(
            "txn_111",
            "txn_111",
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now().minusHours(2),
            LocalDateTime.now().minusHours(2),
            referenceId,
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            PaymentMethod.CREDIT_CARD,
            new PaymentResponse.PaymentMethodDetails("card", "4242", "visa"),
            Optional.empty(),
            Optional.empty(),
            Optional.of(BigDecimal.ZERO),
            BigDecimal.ZERO,
            true,
            Optional.of(new BigDecimal("300.00")),
            Optional.empty(),
            Optional.empty(),
            Map.of()
        );
        
        TransactionInfo transaction2 = new TransactionInfo(
            "txn_222",
            "txn_222",
            new BigDecimal("150.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now().minusHours(1),
            LocalDateTime.now().minusHours(1),
            referenceId,
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            PaymentMethod.CREDIT_CARD,
            new PaymentResponse.PaymentMethodDetails("card", "4242", "visa"),
            Optional.empty(),
            Optional.empty(),
            Optional.of(BigDecimal.ZERO),
            BigDecimal.ZERO,
            true,
            Optional.of(new BigDecimal("150.00")),
            Optional.empty(),
            Optional.empty(),
            Map.of()
        );

        when(paymentGatewayProvider.getTransactionsByReference(referenceId))
            .thenReturn(List.of(transaction1, transaction2));
        
        List<TransactionInfo> result = paymentGatewayProvider.getTransactionsByReference(referenceId);
        
        assertThat(result).hasSize(2);
        assertThat(result.get(0).referenceId()).isEqualTo(referenceId);
        assertThat(result.get(1).referenceId()).isEqualTo(referenceId);
        verify(paymentGatewayProvider).getTransactionsByReference(referenceId);
    }
}
