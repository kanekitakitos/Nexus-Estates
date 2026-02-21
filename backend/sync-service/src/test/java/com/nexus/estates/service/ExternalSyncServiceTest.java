package com.nexus.estates.service;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExternalSyncServiceTest {

    @Mock
    private RestClient restClient;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    @InjectMocks
    private ExternalSyncService externalSyncService;

    @Test
    @DisplayName("Deve confirmar reserva quando API externa aprovar")
    void shouldConfirmBookingWhenExternalApiApproves() {
        BookingCreatedMessage message = new BookingCreatedMessage(1L, 10L, 20L, BookingStatus.PENDING_PAYMENT);
        ExternalSyncService.ExternalSyncResult result = new ExternalSyncService.ExternalSyncResult(true, "OK");

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("/external/bookings/sync")).thenReturn(requestBodySpec);
        when(requestBodySpec.body(message)).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
        when(responseSpec.toEntity(ExternalSyncService.ExternalSyncResult.class))
                .thenReturn(ResponseEntity.ok(result));

        BookingStatusUpdatedMessage response = externalSyncService.processBooking(message);

        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.reason()).isEqualTo("OK");
    }

    @Test
    @DisplayName("Deve cancelar reserva quando API externa rejeitar")
    void shouldCancelBookingWhenExternalApiRejects() {
        BookingCreatedMessage message = new BookingCreatedMessage(1L, 10L, 20L, BookingStatus.PENDING_PAYMENT);
        ExternalSyncService.ExternalSyncResult result = new ExternalSyncService.ExternalSyncResult(false, "Rejected");

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("/external/bookings/sync")).thenReturn(requestBodySpec);
        when(requestBodySpec.body(message)).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
        when(responseSpec.toEntity(ExternalSyncService.ExternalSyncResult.class))
                .thenReturn(ResponseEntity.ok(result));

        BookingStatusUpdatedMessage response = externalSyncService.processBooking(message);

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(response.reason()).isEqualTo("Rejected");
    }

    @Test
    @DisplayName("Fallback deve devolver CANCELLED com razão explicativa")
    void fallbackShouldReturnCancelledWithReason() {
        BookingCreatedMessage message = new BookingCreatedMessage(1L, 10L, 20L, BookingStatus.PENDING_PAYMENT);
        Throwable ex = new RuntimeException("Simulated failure");

        BookingStatusUpdatedMessage response = externalSyncService.fallbackProcessBooking(message, ex);

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(response.reason()).contains("Falha na integração externa");
    }
}

