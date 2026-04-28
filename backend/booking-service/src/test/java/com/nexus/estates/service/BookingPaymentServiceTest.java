package com.nexus.estates.service;

import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.dto.payment.*;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.exception.PaymentNotFoundException;
import com.nexus.estates.messaging.BookingEventPublisher;
import com.nexus.estates.repository.BookingRepository;
import com.nexus.estates.common.messaging.BookingCancelledMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
    private NexusClients.PropertyClient propertyClient;

    @Mock
    private NexusClients.UserClient userClient;

    @Mock
    private NexusClients.FinanceClient financeClient;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingEventPublisher eventPublisher;

    private Proxy proxy;
    private BookingPaymentService bookingPaymentService;

    @BeforeEach
    void setUp() {
        proxy = new Proxy(propertyClient, userClient, financeClient);
        bookingPaymentService = new BookingPaymentService(proxy, bookingRepository, eventPublisher);
    }

    @Test
    @DisplayName("Should create payment intent successfully")
    void shouldCreatePaymentIntentSuccessfully() {
        Long bookingId = 1L;
        PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;
        Booking booking = createTestBooking(bookingId, BookingStatus.PENDING_PAYMENT);
        
        PaymentResponse.Intent expectedIntent = new PaymentResponse.Intent(
            "pi_123",
            "client_secret_123",
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.PENDING,
            Map.of()
        );

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(financeClient.createPaymentIntent(eq(bookingId), any(NexusClients.CreatePaymentIntentRequest.class))).thenReturn(expectedIntent);

        PaymentResponse result = bookingPaymentService.createPaymentIntent(bookingId, paymentMethod);

        assertThat(result).isNotNull();
        assertThat(result.transactionId()).isEqualTo("pi_123");
        verify(financeClient).createPaymentIntent(eq(bookingId), any(NexusClients.CreatePaymentIntentRequest.class));
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

        verifyNoInteractions(financeClient);
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

        verifyNoInteractions(financeClient);
    }

    @Test
    @DisplayName("Should confirm payment successfully")
    void shouldConfirmPaymentSuccessfully() {
        String paymentIntentId = "pi_123";

        PaymentResponse.Success confirmation = new PaymentResponse.Success(
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
            Map.of()
        );

        when(financeClient.confirmPayment(eq(1L), any(NexusClients.ConfirmPaymentRequest.class))).thenReturn(confirmation);

        PaymentResponse result = bookingPaymentService.confirmPayment(1L, paymentIntentId);

        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(PaymentResponse.Success.class);
        assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        verify(financeClient).confirmPayment(eq(1L), any(NexusClients.ConfirmPaymentRequest.class));
    }

    @Test
    @DisplayName("Should process direct payment successfully")
    void shouldProcessDirectPaymentSuccessfully() {
        Long bookingId = 1L;
        PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;
        Booking booking = createTestBooking(bookingId, BookingStatus.PENDING_PAYMENT);
        
        PaymentResponse.Success expectedResult = new PaymentResponse.Success(
            "tx_123",
            "tx_123",
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now(),
            "receipt_url",
            "auth_code",
            BigDecimal.ZERO,
            new PaymentResponse.PaymentMethodDetails("card", "4242", "visa"),
            Map.of()
        );

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(financeClient.processDirectPayment(eq(bookingId), any(NexusClients.DirectPaymentRequest.class))).thenReturn(expectedResult);

        PaymentResponse result = bookingPaymentService.processDirectPayment(bookingId, paymentMethod);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        verify(financeClient).processDirectPayment(eq(bookingId), any(NexusClients.DirectPaymentRequest.class));
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
        when(financeClient.refund(eq(bookingId), any(NexusClients.RefundRequest.class))).thenReturn(expectedResult);

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

        verifyNoInteractions(financeClient);
    }

    @Test
    @DisplayName("Should get transaction details successfully")
    void shouldGetTransactionDetailsSuccessfully() {
        String transactionId = "tx_123";
        
        TransactionInfo expectedDetails = new TransactionInfo(
            transactionId,
            transactionId,
            new BigDecimal("300.00"),
            "EUR",
            PaymentStatus.SUCCEEDED,
            LocalDateTime.now(),
            LocalDateTime.now(),
            "booking_1",
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

        when(financeClient.getTransactionDetails(transactionId)).thenReturn(expectedDetails);

        TransactionInfo result = bookingPaymentService.getTransactionDetails(transactionId);

        assertThat(result).isNotNull();
        assertThat(result.transactionId()).isEqualTo(transactionId);
    }

    @Test
    @DisplayName("Should throw PaymentNotFoundException when transaction not found")
    void shouldThrowExceptionWhenTransactionNotFound() {
        String transactionId = "tx_not_found";

        when(financeClient.getTransactionDetails(transactionId))
                .thenThrow(new RuntimeException("Transaction not found"));

        assertThatThrownBy(() -> bookingPaymentService.getTransactionDetails(transactionId))
            .isInstanceOf(PaymentNotFoundException.class)
            .hasMessage("Transaction not found: " + transactionId);
    }

    @Test
    @DisplayName("Should get payment status successfully")
    void shouldGetPaymentStatusSuccessfully() {
        String transactionId = "tx_123";

        when(financeClient.getPaymentStatus(transactionId)).thenReturn(PaymentStatus.SUCCEEDED);

        PaymentStatus result = bookingPaymentService.getPaymentStatus(transactionId);

        assertThat(result).isEqualTo(PaymentStatus.SUCCEEDED);
    }

    @Test
    @DisplayName("Should check if payment method is supported")
    void shouldCheckIfPaymentMethodIsSupported() {
        PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;

        when(financeClient.supportsPaymentMethod(paymentMethod)).thenReturn(Map.of("paymentMethod", paymentMethod.name(), "supported", true));

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

        when(financeClient.getPaymentProviderInfo()).thenReturn(expectedInfo);

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
