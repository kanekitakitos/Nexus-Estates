package com.nexus.estates.messaging;

import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingEventPublisherTest {

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
    void shouldPublishBookingCreatedEvent() {
        BookingCreatedMessage message = new BookingCreatedMessage(
                1L,
                10L,
                20L,
                BookingStatus.PENDING_PAYMENT
        );

        bookingEventPublisher.publishBookingCreated(message);

        verify(rabbitTemplate).convertAndSend("booking.exchange", "booking.created", message);
    }

    @Test
    void shouldHandleStatusUpdatedEventAndUpdateBooking() {
        Long bookingId = 2L;
        Booking booking = new Booking();
        booking.setId(bookingId);

        BookingStatusUpdatedMessage message = new BookingStatusUpdatedMessage(
                bookingId,
                BookingStatus.CONFIRMED,
                "paid"
        );

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        bookingEventPublisher.handleStatusUpdated(message);

        verify(bookingRepository).findById(bookingId);
        verify(bookingRepository).save(booking);
    }
}