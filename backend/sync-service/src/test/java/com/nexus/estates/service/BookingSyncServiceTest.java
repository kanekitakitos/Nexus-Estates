package com.nexus.estates.service;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.dto.ExternalApiConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingSyncServiceTest {

    @Mock
    private ExternalSyncService externalSyncService;

    @InjectMocks
    private BookingSyncService bookingSyncService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingSyncService, "otaBaseUrl", "http://ota.com");
        ReflectionTestUtils.setField(bookingSyncService, "otaApiKey", "secret-key");
    }

    @Test
    @DisplayName("Deve retornar CONFIRMED quando integração externa aprovar")
    void shouldReturnConfirmedWhenExternalApproves() {
        BookingCreatedMessage message = new BookingCreatedMessage(1L, 10L, 20L, BookingStatus.PENDING_PAYMENT);
        BookingSyncService.ExternalSyncResult result = new BookingSyncService.ExternalSyncResult(true, "OK");

        when(externalSyncService.post(any(ExternalApiConfig.class), eq(message), eq(BookingSyncService.ExternalSyncResult.class)))
                .thenReturn(Optional.of(result));

        BookingStatusUpdatedMessage response = bookingSyncService.syncBooking(message);

        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.reason()).isEqualTo("OK");
        
        verify(externalSyncService).post(any(ExternalApiConfig.class), eq(message), eq(BookingSyncService.ExternalSyncResult.class));
    }

    @Test
    @DisplayName("Deve retornar CANCELLED quando integração externa rejeitar")
    void shouldReturnCancelledWhenExternalRejects() {
        BookingCreatedMessage message = new BookingCreatedMessage(1L, 10L, 20L, BookingStatus.PENDING_PAYMENT);
        BookingSyncService.ExternalSyncResult result = new BookingSyncService.ExternalSyncResult(false, "No availability");

        when(externalSyncService.post(any(ExternalApiConfig.class), eq(message), eq(BookingSyncService.ExternalSyncResult.class)))
                .thenReturn(Optional.of(result));

        BookingStatusUpdatedMessage response = bookingSyncService.syncBooking(message);

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(response.reason()).isEqualTo("No availability");
    }

    @Test
    @DisplayName("Deve retornar CANCELLED com razão de erro quando integração falhar (vazio)")
    void shouldReturnCancelledWhenIntegrationFails() {
        BookingCreatedMessage message = new BookingCreatedMessage(1L, 10L, 20L, BookingStatus.PENDING_PAYMENT);

        when(externalSyncService.post(any(ExternalApiConfig.class), eq(message), eq(BookingSyncService.ExternalSyncResult.class)))
                .thenReturn(Optional.empty());

        BookingStatusUpdatedMessage response = bookingSyncService.syncBooking(message);

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(response.reason()).contains("Falha na integração externa");
    }
}
