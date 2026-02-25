package com.nexus.estates.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração de RabbitMQ para o Sync Service.
 * <p>
 * Declara a exchange principal de eventos de reserva, bem como as filas de
 * trabalho ({@code booking.created.queue}, {@code booking.status.updated.queue})
 * e as respetivas Dead Letter Queues (DLQ). Também configura o conversor JSON,
 * o {@link RabbitTemplate} partilhado e a política de rejeição de mensagens
 * para que erros de processamento resultem no encaminhamento automático para DLQ.
 * </p>
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

    @Value("${booking.events.dlx:booking.dlx}")
    private String bookingDeadLetterExchangeName;

    @Value("${booking.events.queue.created.dlq:booking.created.dlq}")
    private String bookingCreatedDlqQueueName;

    @Value("${booking.events.routing-key.created.dlq:booking.created.dlq}")
    private String bookingCreatedDlqRoutingKey;

    @Value("${booking.events.queue.status-updated.dlq:booking.status.updated.dlq}")
    private String bookingStatusUpdatedDlqQueueName;

    @Value("${booking.events.routing-key.status-updated.dlq:booking.status.updated.dlq}")
    private String bookingStatusUpdatedDlqRoutingKey;

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(bookingExchangeName);
    }

    @Bean
    public TopicExchange bookingDeadLetterExchange() {
        return new TopicExchange(bookingDeadLetterExchangeName);
    }

    @Bean
    public Queue bookingCreatedQueue() {
        return QueueBuilder
                .durable(bookingCreatedQueueName)
                .withArgument("x-dead-letter-exchange", bookingDeadLetterExchangeName)
                .withArgument("x-dead-letter-routing-key", bookingCreatedDlqRoutingKey)
                .build();
    }

    @Bean
    public Queue bookingCreatedDlqQueue() {
        return QueueBuilder
                .durable(bookingCreatedDlqQueueName)
                .build();
    }

    @Bean
    public Binding bookingCreatedBinding(Queue bookingCreatedQueue, TopicExchange bookingExchange) {
        return BindingBuilder
                .bind(bookingCreatedQueue)
                .to(bookingExchange)
                .with(bookingCreatedRoutingKey);
    }

    @Bean
    public Binding bookingCreatedDlqBinding(Queue bookingCreatedDlqQueue, TopicExchange bookingDeadLetterExchange) {
        return BindingBuilder
                .bind(bookingCreatedDlqQueue)
                .to(bookingDeadLetterExchange)
                .with(bookingCreatedDlqRoutingKey);
    }

    @Bean
    public Queue bookingStatusUpdatedQueue() {
        return QueueBuilder
                .durable(bookingStatusUpdatedQueueName)
                .withArgument("x-dead-letter-exchange", bookingDeadLetterExchangeName)
                .withArgument("x-dead-letter-routing-key", bookingStatusUpdatedDlqRoutingKey)
                .build();
    }

    @Bean
    public Queue bookingStatusUpdatedDlqQueue() {
        return QueueBuilder
                .durable(bookingStatusUpdatedDlqQueueName)
                .build();
    }

    @Bean
    public Binding bookingStatusUpdatedBinding(Queue bookingStatusUpdatedQueue, TopicExchange bookingExchange) {
        return BindingBuilder
                .bind(bookingStatusUpdatedQueue)
                .to(bookingExchange)
                .with(bookingStatusUpdatedRoutingKey);
    }

    @Bean
    public Binding bookingStatusUpdatedDlqBinding(Queue bookingStatusUpdatedDlqQueue, TopicExchange bookingDeadLetterExchange) {
        return BindingBuilder
                .bind(bookingStatusUpdatedDlqQueue)
                .to(bookingDeadLetterExchange)
                .with(bookingStatusUpdatedDlqRoutingKey);
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

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory,
                                                                               MessageConverter jacksonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jacksonMessageConverter);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
