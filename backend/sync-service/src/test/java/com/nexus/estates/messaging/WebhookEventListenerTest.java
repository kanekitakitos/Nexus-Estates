package com.nexus.estates.messaging;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.service.chat.WebhookDispatcherService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
class WebhookEventListenerTest {

    @Mock
    private WebhookDispatcherService dispatcherService;

    @InjectMocks
    private WebhookEventListener listener;

    @Test
    void onBookingCreated_ShouldDispatchEvent() {
        BookingCreatedMessage message = new BookingCreatedMessage(1L, 1L, 1L, BookingStatus.PENDING_PAYMENT);

        listener.onBookingCreated(message);

        Mockito.verify(dispatcherService).dispatch(eq("booking.created"), eq(message));
    }

    @Test
    void onBookingStatusUpdated_ShouldDispatchEvent() {
        BookingStatusUpdatedMessage message = new BookingStatusUpdatedMessage(1L, BookingStatus.CONFIRMED,"si");

        listener.onBookingStatusUpdated(message);

        Mockito.verify(dispatcherService).dispatch(eq("booking.status.updated"), eq(message));
    }
}