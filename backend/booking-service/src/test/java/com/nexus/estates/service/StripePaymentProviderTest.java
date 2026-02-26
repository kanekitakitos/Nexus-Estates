package com.nexus.estates.service;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.exception.PaymentProcessingException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntentCollection;
import com.stripe.model.Refund;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripePaymentProviderTest {

    private StripePaymentProvider stripePaymentProvider;

    @Mock
    private com.stripe.model.PaymentIntent stripePaymentIntent;

    @Mock
    private Refund stripeRefund;

    @BeforeEach
    void setUp() {
        stripePaymentProvider = new StripePaymentProvider();
    }

    @Test
    @DisplayName("Should create payment intent successfully")
    void shouldCreatePaymentIntentSuccessfully() throws StripeException {
        BigDecimal amount = new BigDecimal("300.00");
        String currency = "EUR";
        String referenceId = "booking-123";
        Map<String, Object> metadata = Map.of("propertyId", "10", "userId", "20");

        when(stripePaymentIntent.getId()).thenReturn("pi_123456");
        when(stripePaymentIntent.getStatus()).thenReturn("requires_payment_method");
        when(stripePaymentIntent.getCurrency()).thenReturn("eur");
        when(stripePaymentIntent.getAmount()).thenReturn(30000L);
        when(stripePaymentIntent.getClientSecret()).thenReturn("secret_123");

        try (MockedStatic<com.stripe.model.PaymentIntent> paymentIntentMock = mockStatic(com.stripe.model.PaymentIntent.class)) {
            paymentIntentMock.when(() -> com.stripe.model.PaymentIntent.create(any(com.stripe.param.PaymentIntentCreateParams.class)))
                    .thenReturn(stripePaymentIntent);

            PaymentIntent result = stripePaymentProvider.createPaymentIntent(amount, currency, referenceId, metadata);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo("pi_123456");
            assertThat(result.status()).isEqualTo(PaymentStatus.PENDING);
            assertThat(result.currency()).isEqualTo("eur");
            assertThat(result.amount()).isEqualByComparingTo(amount);

            ArgumentCaptor<com.stripe.param.PaymentIntentCreateParams> paramsCaptor = 
                    ArgumentCaptor.forClass(com.stripe.param.PaymentIntentCreateParams.class);
            paymentIntentMock.verify(() -> com.stripe.model.PaymentIntent.create(paramsCaptor.capture()));

            com.stripe.param.PaymentIntentCreateParams capturedParams = paramsCaptor.getValue();
            assertThat(capturedParams.getAmount()).isEqualTo(30000L);
            assertThat(capturedParams.getCurrency()).isEqualTo("eur");
        }
    }

    @Test
    @DisplayName("Should throw PaymentProcessingException when Stripe API fails")
    void shouldThrowPaymentProcessingExceptionWhenStripeApiFails() throws StripeException {
        BigDecimal amount = new BigDecimal("300.00");
        String currency = "EUR";
        String referenceId = "booking-123";
        Map<String, Object> metadata = Map.of("propertyId", "10");

        StripeException stripeException = new StripeException("API Error", "api_error", "code", 500) {};

        try (MockedStatic<com.stripe.model.PaymentIntent> paymentIntentMock = mockStatic(com.stripe.model.PaymentIntent.class)) {
            paymentIntentMock.when(() -> com.stripe.model.PaymentIntent.create(any(com.stripe.param.PaymentIntentCreateParams.class)))
                    .thenThrow(stripeException);

            assertThatThrownBy(() -> stripePaymentProvider.createPaymentIntent(amount, currency, referenceId, metadata))
                    .isInstanceOf(PaymentProcessingException.class)
                    .hasMessageContaining("Failed to create Stripe payment intent: API Error")
                    .hasCause(stripeException);
        }
    }

    @Test
    @DisplayName("Should confirm payment successfully")
    void shouldConfirmPaymentSuccessfully() throws StripeException {
        String paymentIntentId = "pi_123456";
        Map<String, Object> metadata = Map.of("bookingId", "123");

        // Removed unused stubbings on stripePaymentIntent since we use local mocks

        try (MockedStatic<com.stripe.model.PaymentIntent> paymentIntentMock = mockStatic(com.stripe.model.PaymentIntent.class)) {
            com.stripe.model.PaymentIntent retrievedIntent = mock(com.stripe.model.PaymentIntent.class);
            paymentIntentMock.when(() -> com.stripe.model.PaymentIntent.retrieve(paymentIntentId))
                    .thenReturn(retrievedIntent);

            com.stripe.model.PaymentIntent confirmedIntent = mock(com.stripe.model.PaymentIntent.class);
            when(retrievedIntent.confirm()).thenReturn(confirmedIntent);

            when(confirmedIntent.getId()).thenReturn(paymentIntentId);
            when(confirmedIntent.getStatus()).thenReturn("succeeded");
            // Removed unused stubbings for currency and amount as they are not checked in PaymentConfirmation result for this method

            PaymentConfirmation result = stripePaymentProvider.confirmPaymentIntent(paymentIntentId, metadata);

            assertThat(result).isNotNull();
            assertThat(result.transactionId()).isEqualTo(paymentIntentId);
            assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        }
    }

    @Test
    @DisplayName("Should retrieve payment intent successfully")
    void shouldRetrievePaymentIntentSuccessfully() throws StripeException {
        String paymentIntentId = "pi_123456";

        when(stripePaymentIntent.getId()).thenReturn(paymentIntentId);
        when(stripePaymentIntent.getStatus()).thenReturn("succeeded");
        when(stripePaymentIntent.getCurrency()).thenReturn("eur");
        when(stripePaymentIntent.getAmount()).thenReturn(30000L);
        when(stripePaymentIntent.getCreated()).thenReturn(System.currentTimeMillis() / 1000L);
        when(stripePaymentIntent.getMetadata()).thenReturn(Map.of());

        try (MockedStatic<com.stripe.model.PaymentIntent> paymentIntentMock = mockStatic(com.stripe.model.PaymentIntent.class)) {
            paymentIntentMock.when(() -> com.stripe.model.PaymentIntent.retrieve(paymentIntentId))
                    .thenReturn(stripePaymentIntent);

            TransactionDetails result = stripePaymentProvider.getTransactionDetails(paymentIntentId);

            assertThat(result).isNotNull();
            assertThat(result.transactionId()).isEqualTo(paymentIntentId);
            assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
            assertThat(result.currency()).isEqualTo("eur");
            assertThat(result.amount()).isEqualByComparingTo(new BigDecimal("300.00"));
        }
    }

    @Test
    @DisplayName("Should process refund successfully")
    void shouldProcessRefundSuccessfully() throws StripeException {
        String transactionId = "txn_123456";
        BigDecimal refundAmount = new BigDecimal("150.00");
        String reason = "Partial refund";
        Map<String, Object> metadata = Map.of();

        when(stripeRefund.getId()).thenReturn("refund_789");
        when(stripeRefund.getStatus()).thenReturn("succeeded");
        when(stripeRefund.getAmount()).thenReturn(15000L);
        when(stripeRefund.getCurrency()).thenReturn("eur");
        // Removed unused stubbings: getPaymentIntent, getCreated

        try (MockedStatic<Refund> refundMock = mockStatic(Refund.class)) {
            refundMock.when(() -> Refund.create(any(com.stripe.param.RefundCreateParams.class)))
                    .thenReturn(stripeRefund);

            RefundResult result = stripePaymentProvider.processRefund(transactionId, refundAmount, "EUR", Optional.of(reason), metadata);

            assertThat(result).isNotNull();
            assertThat(result.refundId()).isEqualTo("refund_789");
            assertThat(result.status()).isEqualTo(RefundStatus.SUCCEEDED);
            assertThat(result.refundedAmount()).isEqualByComparingTo(refundAmount);
            // originalTransactionId is passed from argument, not from stripeRefund in the implementation

            ArgumentCaptor<com.stripe.param.RefundCreateParams> paramsCaptor = 
                    ArgumentCaptor.forClass(com.stripe.param.RefundCreateParams.class);
            refundMock.verify(() -> Refund.create(paramsCaptor.capture()));

            com.stripe.param.RefundCreateParams capturedParams = paramsCaptor.getValue();
            assertThat(capturedParams.getPaymentIntent()).isEqualTo(transactionId);
            assertThat(capturedParams.getAmount()).isEqualTo(15000L);
            assertThat(capturedParams.getReason()).isEqualTo(com.stripe.param.RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER);
        }
    }

    @Test
    @DisplayName("Should retrieve transaction successfully")
    void shouldRetrieveTransactionSuccessfully() throws StripeException {
        String transactionId = "pi_123456";

        when(stripePaymentIntent.getId()).thenReturn(transactionId);
        when(stripePaymentIntent.getStatus()).thenReturn("succeeded");
        when(stripePaymentIntent.getCurrency()).thenReturn("eur");
        when(stripePaymentIntent.getAmount()).thenReturn(30000L);
        // when(stripePaymentIntent.getDescription()).thenReturn("Booking payment"); // Unused in TransactionDetails constructor? No, it is used.
        when(stripePaymentIntent.getCreated()).thenReturn(System.currentTimeMillis() / 1000L);
        when(stripePaymentIntent.getMetadata()).thenReturn(Map.of("reference_id", "booking-123"));

        try (MockedStatic<com.stripe.model.PaymentIntent> paymentIntentMock = mockStatic(com.stripe.model.PaymentIntent.class)) {
            paymentIntentMock.when(() -> com.stripe.model.PaymentIntent.retrieve(transactionId))
                    .thenReturn(stripePaymentIntent);

            TransactionDetails result = stripePaymentProvider.getTransactionDetails(transactionId);

            assertThat(result).isNotNull();
            assertThat(result.transactionId()).isEqualTo(transactionId);
            assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
            assertThat(result.amount()).isEqualByComparingTo(new BigDecimal("300.00"));
            assertThat(result.currency()).isEqualTo("eur");
        }
    }

    @Test
    @DisplayName("Should handle currency conversion correctly for different currencies")
    void shouldHandleCurrencyConversionCorrectly() throws StripeException {
        BigDecimal amount = new BigDecimal("123.45");
        String currency = "USD";
        String referenceId = "booking-456";
        Map<String, Object> metadata = Map.of();

        // Removed unused stubbings on stripePaymentIntent
        // The test verifies the parameters passed to create(), not the return value's properties (except via the mock return)
        // But createPaymentIntent returns a PaymentIntent object constructed from the stripePaymentIntent.
        // So we DO need to stub the properties accessed by the constructor.
        
        when(stripePaymentIntent.getId()).thenReturn("pi_789012");
        when(stripePaymentIntent.getStatus()).thenReturn("requires_payment_method");
        when(stripePaymentIntent.getCurrency()).thenReturn("usd");
        when(stripePaymentIntent.getAmount()).thenReturn(12345L);
        when(stripePaymentIntent.getClientSecret()).thenReturn("secret_456");

        try (MockedStatic<com.stripe.model.PaymentIntent> paymentIntentMock = mockStatic(com.stripe.model.PaymentIntent.class)) {
            paymentIntentMock.when(() -> com.stripe.model.PaymentIntent.create(any(com.stripe.param.PaymentIntentCreateParams.class)))
                    .thenReturn(stripePaymentIntent);

            PaymentIntent result = stripePaymentProvider.createPaymentIntent(amount, currency, referenceId, metadata);

            assertThat(result.amount()).isEqualByComparingTo(amount);
            assertThat(result.currency()).isEqualTo("usd");

            ArgumentCaptor<com.stripe.param.PaymentIntentCreateParams> paramsCaptor = 
                    ArgumentCaptor.forClass(com.stripe.param.PaymentIntentCreateParams.class);
            paymentIntentMock.verify(() -> com.stripe.model.PaymentIntent.create(paramsCaptor.capture()));

            com.stripe.param.PaymentIntentCreateParams capturedParams = paramsCaptor.getValue();
            assertThat(capturedParams.getAmount()).isEqualTo(12345L);
            assertThat(capturedParams.getCurrency()).isEqualTo("usd");
        }
    }
}