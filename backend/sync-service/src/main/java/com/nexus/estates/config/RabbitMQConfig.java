package com.nexus.estates.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração de RabbitMQ para o Sync Service.
 * Define a infraestrutura necessária para consumir e publicar eventos de reserva.
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Configuration
public class RabbitMQConfig {

    @Value("${booking.events.exchange:booking.exchange}")
    private String bookingExchangeName;

    @Value("${booking.events.queue.created:booking.created.queue}")
    private String bookingCreatedQueueName;

    @Value("${booking.events.routing-key.created:booking.created}")
    private String bookingCreatedRoutingKey;

    @Value("${booking.events.queue.status-updated:booking.status.updated.queue}")
    private String bookingStatusUpdatedQueueName;

    @Value("${booking.events.routing-key.status-updated:booking.status.updated}")
    private String bookingStatusUpdatedRoutingKey;

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(bookingExchangeName);
    }

    @Bean
    public Queue bookingCreatedQueue() {
        return new Queue(bookingCreatedQueueName, true);
    }

    @Bean
    public Binding bookingCreatedBinding(Queue bookingCreatedQueue, TopicExchange bookingExchange) {
        return BindingBuilder
                .bind(bookingCreatedQueue)
                .to(bookingExchange)
                .with(bookingCreatedRoutingKey);
    }

    @Bean
    public Queue bookingStatusUpdatedQueue() {
        return new Queue(bookingStatusUpdatedQueueName, true);
    }

    @Bean
    public Binding bookingStatusUpdatedBinding(Queue bookingStatusUpdatedQueue, TopicExchange bookingExchange) {
        return BindingBuilder
                .bind(bookingStatusUpdatedQueue)
                .to(bookingExchange)
                .with(bookingStatusUpdatedRoutingKey);
    }

    @Bean
    public MessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory,
                                         MessageConverter jacksonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jacksonMessageConverter);
        return template;
    }
}
