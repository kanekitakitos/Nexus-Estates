package com.nexus.estates.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RabbitMQConfigTest {

    @Test
    @DisplayName("booking.created.queue deve ser durável e apontar para a DLQ correta")
    void bookingCreatedQueueHasDlqConfigured() {
        RabbitMQConfig config = new RabbitMQConfig();

        ReflectionTestUtils.setField(config, "bookingCreatedQueueName", "booking.created.queue");
        ReflectionTestUtils.setField(config, "bookingDeadLetterExchangeName", "booking.dlx");
        ReflectionTestUtils.setField(config, "bookingCreatedDlqRoutingKey", "booking.created.dlq");

        Queue queue = config.bookingCreatedQueue();

        assertThat(queue.isDurable()).isTrue();
        Map<String, Object> args = queue.getArguments();
        assertThat(args.get("x-dead-letter-exchange")).isEqualTo("booking.dlx");
        assertThat(args.get("x-dead-letter-routing-key")).isEqualTo("booking.created.dlq");
    }

    @Test
    @DisplayName("booking.status.updated.queue deve ser durável e apontar para a DLQ correta")
    void bookingStatusUpdatedQueueHasDlqConfigured() {
        RabbitMQConfig config = new RabbitMQConfig();

        ReflectionTestUtils.setField(config, "bookingStatusUpdatedQueueName", "booking.status.updated.queue");
        ReflectionTestUtils.setField(config, "bookingDeadLetterExchangeName", "booking.dlx");
        ReflectionTestUtils.setField(config, "bookingStatusUpdatedDlqRoutingKey", "booking.status.updated.dlq");

        Queue queue = config.bookingStatusUpdatedQueue();

        assertThat(queue.isDurable()).isTrue();
        Map<String, Object> args = queue.getArguments();
        assertThat(args.get("x-dead-letter-exchange")).isEqualTo("booking.dlx");
        assertThat(args.get("x-dead-letter-routing-key")).isEqualTo("booking.status.updated.dlq");
    }

    @Test
    @DisplayName("bookingDeadLetterExchange deve usar o nome configurado")
    void bookingDeadLetterExchangeHasConfiguredName() {
        RabbitMQConfig config = new RabbitMQConfig();

        ReflectionTestUtils.setField(config, "bookingDeadLetterExchangeName", "booking.dlx");

        TopicExchange dlx = config.bookingDeadLetterExchange();
        assertThat(dlx.getName()).isEqualTo("booking.dlx");
    }
}

