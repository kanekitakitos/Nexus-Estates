package com.nexus.estates.messaging;

import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
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


//    $body = @{
//        propertyId  = "0f8fad5b-d9cb-469f-a165-70867728950e"
//        userId      = "7c9e6679-7425-40de-944b-e07fc1f90ae7"
//        checkInDate = "2030-01-10"
//        checkOutDate= "2030-01-15"
//        guestCount  = 2
//    } | ConvertTo-Json
//
//    Invoke-RestMethod -Method Post `
//            -Uri "http://localhost:8081/api/v1/bookings" `
//            -ContentType "application/json" `
//            -Body $body

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
