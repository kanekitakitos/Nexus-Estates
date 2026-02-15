package com.nexus.estates.messaging;

import com.nexus.estates.entity.Booking;
import com.nexus.estates.entity.BookingStatus;
import com.nexus.estates.repository.BookingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class BookingEventPublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private BookingRepository bookingRepository;

    private BookingEventPublisher bookingEventPublisher;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        bookingEventPublisher = new BookingEventPublisher(
                rabbitTemplate,
                bookingRepository,
                "booking.exchange",
                "booking.created"
        );
    }

    @Test
    void shouldPublishBookingCreatedEvent() {
        BookingCreatedMessage message = new BookingCreatedMessage(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                BookingStatus.PENDING_PAYMENT
        );

        bookingEventPublisher.publishBookingCreated(message);

        verify(rabbitTemplate).convertAndSend("booking.exchange", "booking.created", message);
    }

    @Test
    void shouldHandleStatusUpdatedEventAndUpdateBooking() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);

        BookingStatusUpdatedMessage message = new BookingStatusUpdatedMessage(
                bookingId,
                BookingStatus.CONFIRMED,
                "paid"
        );

        org.mockito.Mockito.when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        bookingEventPublisher.handleStatusUpdated(message);

        verify(bookingRepository).findById(bookingId);
        verify(bookingRepository).save(booking);
    }
}
