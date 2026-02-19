package com.nexus.estates.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class RabbitMQConfigTest {

    @Autowired
    private Queue bookingCreatedQueue;

    @Autowired
    private Queue bookingStatusUpdatedQueue;

    @Autowired
    @Qualifier("bookingDeadLetterExchange")
    private TopicExchange bookingDeadLetterExchange;

    @Test
    @DisplayName("booking.created.queue deve ser durável e apontar para a DLQ correta")
    void bookingCreatedQueueHasDlqConfigured() {
        assertThat(bookingCreatedQueue.isDurable()).isTrue();

        Map<String, Object> args = bookingCreatedQueue.getArguments();
        assertThat(args.get("x-dead-letter-exchange")).isEqualTo(bookingDeadLetterExchange.getName());
        assertThat(args.get("x-dead-letter-routing-key")).isEqualTo("booking.created.dlq");
    }

    @Test
    @DisplayName("booking.status.updated.queue deve ser durável e apontar para a DLQ correta")
    void bookingStatusUpdatedQueueHasDlqConfigured() {
        assertThat(bookingStatusUpdatedQueue.isDurable()).isTrue();

        Map<String, Object> args = bookingStatusUpdatedQueue.getArguments();
        assertThat(args.get("x-dead-letter-exchange")).isEqualTo(bookingDeadLetterExchange.getName());
        assertThat(args.get("x-dead-letter-routing-key")).isEqualTo("booking.status.updated.dlq");
    }
}
