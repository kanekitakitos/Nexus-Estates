package com.nexus.estates.messaging;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.service.ExternalSyncService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
    private ExternalSyncService externalSyncService;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Test
    @DisplayName("Deve processar booking.created e publicar booking.status.updated")
    void shouldProcessBookingCreatedAndPublishStatusUpdated() {
        SyncConsumer consumer = new SyncConsumer(externalSyncService, rabbitTemplate);

        ReflectionTestUtils.setField(consumer, "bookingExchangeName", "booking.exchange");
        ReflectionTestUtils.setField(consumer, "bookingStatusUpdatedRoutingKey", "booking.status.updated");

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

        when(externalSyncService.processBooking(input)).thenReturn(result);

        consumer.handleBookingCreated(input);

        ArgumentCaptor<BookingStatusUpdatedMessage> captor = ArgumentCaptor.forClass(BookingStatusUpdatedMessage.class);

        verify(externalSyncService).processBooking(input);
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
