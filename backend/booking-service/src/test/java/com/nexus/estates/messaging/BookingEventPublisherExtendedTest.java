package com.nexus.estates.messaging;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCancelledMessage;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.common.messaging.BookingUpdatedMessage;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingEventPublisherExtendedTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private BookingRepository bookingRepository;

    private BookingEventPublisher bookingEventPublisher;

    @BeforeEach
    void setUp() {
        bookingEventPublisher = new BookingEventPublisher(
                rabbitTemplate,
                bookingRepository,
                "booking.exchange",
                "booking.created",
                "booking.updated",
                "booking.cancelled"
        );
    }

    @Test
    @DisplayName("Should publish booking updated event successfully")
    void shouldPublishBookingUpdatedEventSuccessfully() {
        // Arrange
        BookingUpdatedMessage message = new BookingUpdatedMessage(
                1L,
                10L,
                20L,
                BookingStatus.CONFIRMED,
                "Updated check-in details"
        );

        // Act
        bookingEventPublisher.publishBookingUpdated(message);

        // Assert
        verify(rabbitTemplate).convertAndSend(
                eq("booking.exchange"),
                eq("booking.updated"),
                eq(message)
        );
    }

    @Test
    @DisplayName("Should publish booking cancelled event successfully")
    void shouldPublishBookingCancelledEventSuccessfully() {
        // Arrange
        BookingCancelledMessage message = new BookingCancelledMessage(
                1L,
                10L,
                20L,
                "Customer request",
                LocalDateTime.now()
        );

        // Act
        bookingEventPublisher.publishBookingCancelled(message);

        // Assert
        verify(rabbitTemplate).convertAndSend(
                eq("booking.exchange"),
                eq("booking.cancelled"),
                eq(message)
        );
    }

    @Test
    @DisplayName("Should handle status updated event and update booking")
    void shouldHandleStatusUpdatedEventAndUpdateBooking() {
        // Arrange
        Long bookingId = 2L;
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);

        BookingStatusUpdatedMessage message = new BookingStatusUpdatedMessage(
                bookingId,
                BookingStatus.CONFIRMED,
                "Payment confirmed"
        );

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // Act
        bookingEventPublisher.handleStatusUpdated(message);

        // Assert
        verify(bookingRepository).findById(bookingId);
        verify(bookingRepository).save(booking);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    @DisplayName("Should handle event when booking not found")
    void shouldHandleEventWhenBookingNotFound() {
        // Arrange
        Long bookingId = 999L;
        BookingStatusUpdatedMessage message = new BookingStatusUpdatedMessage(
                bookingId,
                BookingStatus.CONFIRMED,
                "paid"
        );

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        // Act
        bookingEventPublisher.handleStatusUpdated(message);

        // Assert
        verify(bookingRepository).findById(bookingId);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should handle RabbitTemplate exception gracefully")
    void shouldHandleRabbitTemplateExceptionGracefully() {
        // Arrange
        BookingCreatedMessage message = new BookingCreatedMessage(
                1L,
                10L,
                20L,
                BookingStatus.PENDING_PAYMENT
        );

        // Fix: Use specific matchers or cast to Object to resolve ambiguity
        doThrow(new RuntimeException("RabbitMQ connection failed"))
                .when(rabbitTemplate).convertAndSend(any(String.class), any(String.class), any(Object.class));

        // Act & Assert
        assertThatThrownBy(() -> bookingEventPublisher.publishBookingCreated(message))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("RabbitMQ connection failed");

        verify(rabbitTemplate).convertAndSend(
                eq("booking.exchange"),
                eq("booking.created"),
                eq(message)
        );
    }

    @Test
    @DisplayName("Should publish event with different routing keys")
    void shouldPublishEventWithDifferentRoutingKeys() {
        // Arrange
        String customExchange = "custom.booking.exchange";
        String customRoutingKey = "booking.custom.event";
        
        BookingEventPublisher customPublisher = new BookingEventPublisher(
                rabbitTemplate,
                bookingRepository,
                customExchange,
                customRoutingKey,
                "booking.updated",
                "booking.cancelled"
        );

        BookingCreatedMessage message = new BookingCreatedMessage(
                1L,
                10L,
                20L,
                BookingStatus.PENDING_PAYMENT
        );

        // Act
        customPublisher.publishBookingCreated(message);

        // Assert
        verify(rabbitTemplate).convertAndSend(
                eq(customExchange),
                eq(customRoutingKey),
                eq(message)
        );
    }
}