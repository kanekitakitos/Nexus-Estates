package com.nexus.estates.messaging;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.service.BookingSyncService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SyncConsumerTest {

    @Mock
    private BookingSyncService bookingSyncService;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private BookingEventListener bookingEventListener;

    @Test
    @DisplayName("Deve processar booking.created e publicar booking.status.updated")
    void shouldProcessBookingCreatedAndPublishStatusUpdated() {
        ReflectionTestUtils.setField(bookingEventListener, "bookingExchangeName", "booking.exchange");
        ReflectionTestUtils.setField(bookingEventListener, "bookingStatusUpdatedRoutingKey", "booking.status.updated");

        BookingCreatedMessage input = new BookingCreatedMessage(
                1L,
                10L,
                20L,
                BookingStatus.PENDING_PAYMENT
        );
        BookingStatusUpdatedMessage result = new BookingStatusUpdatedMessage(
                1L,
                BookingStatus.CONFIRMED,
                "ok"
        );

        when(bookingSyncService.syncBooking(input)).thenReturn(result);

        bookingEventListener.handleBookingCreated(input);

        ArgumentCaptor<BookingStatusUpdatedMessage> captor = ArgumentCaptor.forClass(BookingStatusUpdatedMessage.class);

        verify(bookingSyncService).syncBooking(input);
        verify(rabbitTemplate).convertAndSend(
                eq("booking.exchange"),
                eq("booking.status.updated"),
                captor.capture()
        );

        BookingStatusUpdatedMessage published = captor.getValue();
        assertThat(published.bookingId()).isEqualTo(1L);
        assertThat(published.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(published.reason()).isEqualTo("ok");
    }
}
