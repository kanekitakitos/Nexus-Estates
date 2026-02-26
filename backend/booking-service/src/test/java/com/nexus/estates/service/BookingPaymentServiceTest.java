package com.nexus.estates.service;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.exception.PaymentNotFoundException;
import com.nexus.estates.exception.PaymentProcessingException;
import com.nexus.estates.messaging.BookingEventPublisher;
import com.nexus.estates.repository.BookingRepository;
import com.nexus.estates.common.messaging.BookingUpdatedMessage;
import com.nexus.estates.common.messaging.BookingCancelledMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingPaymentServiceTest {

    @Mock
    private PaymentGatewayProvider paymentGatewayProvider;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingEventPublisher eventPublisher;

    @InjectMocks
    private BookingPaymentService bookingPaymentService;

    @Test
    @DisplayName("Should create payment intent successfully")
    void shouldCreatePaymentIntentSuccessfully() {
        Long bookingId = 1L;
        PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;
        Booking booking = createTestBooking(bookingId, BookingStatus.PENDING_PAYMENT);
        
        PaymentIntent expectedIntent = new PaymentIntent(
            "pi_123",
            "Stripe",
            new BigDecimal("300.00"),
            "EUR",
            bookingId.toString(),
            PaymentStatus.PENDING,
            "client_secret_123",
            LocalDateTime.now(),
            null,
            Map.of(),
            null,
            false,
            null
        );

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(paymentGatewayProvider.createPaymentIntent(any(), any(), any(), any())).thenReturn(expectedIntent);

        PaymentIntent result = bookingPaymentService.createPaymentIntent(bookingId, paymentMethod);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo("pi_123");
        verify(paymentGatewayProvider).createPaymentIntent(
            eq(new BigDecimal("300.00")),
            eq("EUR"),
            eq(bookingId.toString()),
            any(Map.class)
        );
    }

    @Test
    @DisplayName("Should throw exception when creating payment intent for confirmed booking")
    void shouldThrowExceptionWhenCreatingPaymentIntentForConfirmedBooking() {
        Long bookingId = 1L;
        PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;
        Booking booking = createTestBooking(bookingId, BookingStatus.CONFIRMED);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingPaymentService.createPaymentIntent(bookingId, paymentMethod))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("Booking is already confirmed and paid");

        verifyNoInteractions(paymentGatewayProvider);
    }

    @Test
    @DisplayName("Should throw exception when creating payment intent for cancelled booking")
    void shouldThrowExceptionWhenCreatingPaymentIntentForCancelledBooking() {
        Long bookingId = 1L;
        PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;
        Booking booking = createTestBooking(bookingId, BookingStatus.CANCELLED);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingPaymentService.createPaymentIntent(bookingId, paymentMethod))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("Cannot process payment for cancelled booking");

        verifyNoInteractions(paymentGatewayProvider);
    }

    @Test
    @DisplayName("Should confirm payment successfully")
    void shouldConfirmPaymentSuccessfully() {
        String paymentIntentId = "pi_123";
        Map<String, Object> metadata = Map.of("bookingId", "1");
        
        PaymentConfirmation confirmation = new PaymentConfirmation(
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
        
        Booking booking = createTestBooking(1L, BookingStatus.PENDING_PAYMENT);

        when(paymentGatewayProvider.confirmPaymentIntent(paymentIntentId, metadata)).thenReturn(confirmation);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        PaymentConfirmation result = bookingPaymentService.confirmPayment(paymentIntentId, metadata);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        verify(eventPublisher).publishBookingUpdated(any(BookingUpdatedMessage.class));
    }

    @Test
    @DisplayName("Should process direct payment successfully")
    void shouldProcessDirectPaymentSuccessfully() {
        Long bookingId = 1L;
        PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;
        Booking booking = createTestBooking(bookingId, BookingStatus.PENDING_PAYMENT);
        
        PaymentResult expectedResult = new PaymentResult(
            "tx_123",
            "tx_123",
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now(),
            "auth_code",
            "receipt_url",
            Map.of(),
            null,
            null,
            BigDecimal.ZERO,
            "card",
            false,
            null
        );

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(paymentGatewayProvider.processDirectPayment(any(), any(), any(), any(), any())).thenReturn(expectedResult);

        PaymentResult result = bookingPaymentService.processDirectPayment(bookingId, paymentMethod);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        verify(eventPublisher).publishBookingUpdated(any(BookingUpdatedMessage.class));
    }

    @Test
    @DisplayName("Should process refund successfully")
    void shouldProcessRefundSuccessfully() {
        Long bookingId = 1L;
        BigDecimal refundAmount = new BigDecimal("300.00");
        String reason = "Customer request";
        Booking booking = createTestBooking(bookingId, BookingStatus.CONFIRMED);
        booking.setPaymentIntentId("pi_123");
        
        RefundResult expectedResult = new RefundResult(
            "ref_123",
            "ref_123",
            "pi_123",
            refundAmount,
            "EUR",
            RefundStatus.SUCCEEDED,
            LocalDateTime.now(),
            reason,
            Map.of(),
            null,
            BigDecimal.ZERO
        );

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(paymentGatewayProvider.processRefund(any(), any(), any(), any(), any())).thenReturn(expectedResult);

        RefundResult result = bookingPaymentService.processRefund(bookingId, refundAmount, reason);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(RefundStatus.SUCCEEDED);
        verify(eventPublisher).publishBookingCancelled(any(BookingCancelledMessage.class));
    }

    @Test
    @DisplayName("Should throw exception when processing refund for non-confirmed booking")
    void shouldThrowExceptionWhenProcessingRefundForNonConfirmedBooking() {
        Long bookingId = 1L;
        BigDecimal refundAmount = new BigDecimal("300.00");
        String reason = "Customer request";
        Booking booking = createTestBooking(bookingId, BookingStatus.PENDING_PAYMENT);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingPaymentService.processRefund(bookingId, refundAmount, reason))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("Can only refund confirmed bookings");

        verifyNoInteractions(paymentGatewayProvider);
    }

    @Test
    @DisplayName("Should get transaction details successfully")
    void shouldGetTransactionDetailsSuccessfully() {
        String transactionId = "tx_123";
        
        TransactionDetails expectedDetails = new TransactionDetails(
            transactionId,
            transactionId,
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now(),
            LocalDateTime.now(),
            "booking_1",
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

        when(paymentGatewayProvider.getTransactionDetails(transactionId)).thenReturn(expectedDetails);

        TransactionDetails result = bookingPaymentService.getTransactionDetails(transactionId);

        assertThat(result).isNotNull();
        assertThat(result.transactionId()).isEqualTo(transactionId);
    }

    @Test
    @DisplayName("Should throw PaymentNotFoundException when transaction not found")
    void shouldThrowExceptionWhenTransactionNotFound() {
        String transactionId = "tx_not_found";

        when(paymentGatewayProvider.getTransactionDetails(transactionId))
            .thenThrow(new RuntimeException("Transaction not found"));

        assertThatThrownBy(() -> bookingPaymentService.getTransactionDetails(transactionId))
            .isInstanceOf(PaymentNotFoundException.class)
            .hasMessage("Transaction not found: " + transactionId);
    }

    @Test
    @DisplayName("Should get payment status successfully")
    void shouldGetPaymentStatusSuccessfully() {
        String transactionId = "tx_123";

        when(paymentGatewayProvider.getPaymentStatus(transactionId)).thenReturn(PaymentStatus.SUCCEEDED);

        PaymentStatus result = bookingPaymentService.getPaymentStatus(transactionId);

        assertThat(result).isEqualTo(PaymentStatus.SUCCEEDED);
    }

    @Test
    @DisplayName("Should check if payment method is supported")
    void shouldCheckIfPaymentMethodIsSupported() {
        PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;

        when(paymentGatewayProvider.supportsPaymentMethod(paymentMethod)).thenReturn(true);

        boolean result = bookingPaymentService.supportsPaymentMethod(paymentMethod);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should get provider info successfully")
    void shouldGetProviderInfoSuccessfully() {
        ProviderInfo expectedInfo = new ProviderInfo(
            "Stripe",
            "1.0.0",
            "Description",
            java.util.List.of(PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD),
            java.util.List.of("EUR", "USD"),
            Map.of(),
            true,
            true,
            true,
            null,
            "v1",
            "prod"
        );

        when(paymentGatewayProvider.getProviderInfo()).thenReturn(expectedInfo);

        ProviderInfo result = bookingPaymentService.getProviderInfo();

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Stripe");
    }

    // Helper method to create test booking
    private Booking createTestBooking(Long id, BookingStatus status) {
        Booking booking = new Booking();
        booking.setId(id);
        booking.setPropertyId(10L);
        booking.setUserId(20L);
        booking.setCheckInDate(LocalDate.now().plusDays(1));
        booking.setCheckOutDate(LocalDate.now().plusDays(4));
        booking.setGuests(2);
        booking.setStatus(status);
        booking.setTotalPrice(new BigDecimal("300.00"));
        return booking;
    }
}