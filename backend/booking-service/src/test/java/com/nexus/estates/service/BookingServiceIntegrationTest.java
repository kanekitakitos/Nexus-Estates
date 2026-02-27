package com.nexus.estates.service;

import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.dto.payment.PaymentResponse;
import com.nexus.estates.dto.payment.PaymentStatus;
import com.nexus.estates.dto.payment.RefundResult;
import com.nexus.estates.dto.payment.RefundStatus;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.messaging.BookingEventPublisher;
import com.nexus.estates.repository.BookingRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceIntegrationTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingEventPublisher bookingEventPublisher;

    @Mock
    private BookingPaymentService bookingPaymentService;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("Should create booking and payment intent in integrated flow")
    void shouldCreateBookingAndPaymentIntentInIntegratedFlow() {
        // Arrange
        CreateBookingRequest request = new CreateBookingRequest(
                10L,
                20L,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(4),
                2
        );

        // Criamos o objeto que o repositório irá retornar
        Booking savedBooking = new Booking();
        savedBooking.setId(1L);
        savedBooking.setPropertyId(request.propertyId());
        savedBooking.setUserId(request.userId());
        savedBooking.setCheckInDate(request.checkInDate());
        savedBooking.setCheckOutDate(request.checkOutDate());
        savedBooking.setGuests(request.guestCount());
        savedBooking.setTotalPrice(new BigDecimal("300.00"));
        savedBooking.setCurrency("EUR");
        savedBooking.setStatus(BookingStatus.PENDING_PAYMENT);

        // Mock comportamentos
        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        // Act
        BookingResponse actualResponse = bookingService.createBooking(request);

        // Assert
        assertThat(actualResponse).isNotNull();
        assertThat(actualResponse.totalPrice()).isEqualByComparingTo("300.00");
        assertThat(actualResponse.status()).isEqualTo(BookingStatus.PENDING_PAYMENT);

        // Verify interações
        verify(bookingRepository).save(any(Booking.class));
        verify(bookingEventPublisher).publishBookingCreated(any());
    }

    @Test
    @DisplayName("Should confirm booking when payment is successful")
    void shouldConfirmBookingWhenPaymentIsSuccessful() {
        // Arrange
        Long bookingId = 1L;
        String paymentIntentId = "pi_123456";
        
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

        // Mock comportamentos
        when(bookingPaymentService.confirmPayment(eq(paymentIntentId), any()))
                .thenReturn(confirmation);

        // Act
        PaymentResponse result = bookingService.confirmPayment(bookingId, paymentIntentId);

        // Assert
        assertThat(result.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        
        // Verify interações
        verify(bookingPaymentService).confirmPayment(eq(paymentIntentId), any());
    }

    @Test
    @DisplayName("Should process refund successfully")
    void shouldProcessRefundSuccessfully() {
        // Arrange
        Long bookingId = 1L;
        String reason = "Customer request";
        BigDecimal amount = new BigDecimal("300.00");
        
        RefundResult refundResult = new RefundResult(
            "refund_123",
            "refund_123",
            "txn_123",
            amount,
            "EUR",
            RefundStatus.SUCCEEDED,
            LocalDateTime.now(),
            reason,
            Map.of(),
            null,
            BigDecimal.ZERO
        );

        // Mock comportamentos
        when(bookingPaymentService.processRefund(bookingId, amount, reason))
                .thenReturn(refundResult);

        // Act
        RefundResult result = bookingService.processRefund(bookingId, amount, reason);

        // Assert
        assertThat(result.status()).isEqualTo(RefundStatus.SUCCEEDED);
        
        // Verify interações
        verify(bookingPaymentService).processRefund(bookingId, amount, reason);
    }
}
