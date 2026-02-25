package com.nexus.estates.messaging;

import com.nexus.estates.common.messaging.CalendarBlockMessage;
import com.nexus.estates.repository.BookingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CalendarBlockConsumerTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private CalendarBlockConsumer consumer;

    @Test
    @DisplayName("Deve criar bloqueio quando não existem reservas sobrepostas")
    void shouldCreateBlockWhenNoOverlap() {
        CalendarBlockMessage msg = new CalendarBlockMessage(
                10L,
                Instant.parse("2026-02-18T12:00:00Z"),
                Instant.parse("2026-02-18T14:00:00Z"),
                "uid-1",
                "summary"
        );
        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(false);

        consumer.handleCalendarBlock(msg);

        verify(bookingRepository).save(any());
    }

    @Test
    @DisplayName("Não deve criar bloqueio quando existe reserva sobreposta")
    void shouldNotCreateBlockWhenOverlap() {
        CalendarBlockMessage msg = new CalendarBlockMessage(
                10L,
                Instant.parse("2026-02-18T12:00:00Z"),
                Instant.parse("2026-02-18T14:00:00Z"),
                "uid-1",
                "summary"
        );
        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(true);

        consumer.handleCalendarBlock(msg);

        verify(bookingRepository, never()).save(any());
    }
}

