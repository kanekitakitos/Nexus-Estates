package com.nexus.estates.controller;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DlqAdminControllerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    private DlqAdminController controller;

    @BeforeEach
    void setUp() {
        controller = new DlqAdminController(
                rabbitTemplate,
                "booking.created.dlq",
                "booking.status.updated.dlq"
        );
    }

    @Test
    @DisplayName("Deve devolver todas as mensagens da DLQ de booking.created até ao limite")
    void shouldDrainBookingCreatedDlq() {
        BookingCreatedMessage first = new BookingCreatedMessage(
                1L,
                10L,
                20L,
                BookingStatus.PENDING_PAYMENT
        );
        BookingCreatedMessage second = new BookingCreatedMessage(
                2L,
                11L,
                21L,
                BookingStatus.PENDING_PAYMENT
        );

        when(rabbitTemplate.receiveAndConvert("booking.created.dlq"))
                .thenReturn(first)
                .thenReturn(second)
                .thenReturn(null);

        ResponseEntity<List<BookingCreatedMessage>> response = controller.drainBookingCreatedDlq(10);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody())
                .hasSize(2)
                .containsExactly(first, second);

        verify(rabbitTemplate, times(3)).receiveAndConvert("booking.created.dlq");
    }

    @Test
    @DisplayName("Deve devolver todas as mensagens da DLQ de booking.status.updated até ao limite")
    void shouldDrainBookingStatusUpdatedDlq() {
        BookingStatusUpdatedMessage first = new BookingStatusUpdatedMessage(
                1L,
                BookingStatus.CONFIRMED,
                "ok"
        );
        BookingStatusUpdatedMessage second = new BookingStatusUpdatedMessage(
                2L,
                BookingStatus.CANCELLED,
                "erro"
        );

        when(rabbitTemplate.receiveAndConvert("booking.status.updated.dlq"))
                .thenReturn(first)
                .thenReturn(second)
                .thenReturn(null);

        ResponseEntity<List<BookingStatusUpdatedMessage>> response = controller.drainBookingStatusUpdatedDlq(10);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody())
                .hasSize(2)
                .containsExactly(first, second);

        verify(rabbitTemplate, times(3)).receiveAndConvert("booking.status.updated.dlq");
    }
}

