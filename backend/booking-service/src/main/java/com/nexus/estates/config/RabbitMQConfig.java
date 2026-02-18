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
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração central de infraestrutura para integração com RabbitMQ.
 *
 * <p>
 * Declara a exchange principal de eventos de reserva, as filas de trabalho
 * ({@code booking.created.queue}, {@code booking.status.updated.queue}) e as
 * respetivas Dead Letter Queues (DLQ). Também expõe o {@link RabbitTemplate}
 * configurado com conversor JSON e o container de listeners responsável por
 * rejeitar mensagens com erro sem requeue, permitindo que o RabbitMQ as
 * encaminhe automaticamente para as DLQs configuradas.
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

    /**
     * Cria a exchange de tópicos responsável pelos eventos de reserva.
     *
     * @return instância configurada de {@link TopicExchange}.
     */
    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(bookingExchangeName);
    }

    @Bean
    public TopicExchange bookingDeadLetterExchange() {
        return new TopicExchange(bookingDeadLetterExchangeName);
    }

    /**
     * Declara a fila onde serão publicados os eventos de criação de reserva.
     *
     * @return fila durável para mensagens {@code booking.created}.
     */
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

    /**
     * Associa a fila de criação de reserva à exchange através da routing key.
     *
     * @return binding entre {@link #bookingCreatedQueue()} e {@link #bookingExchange()}.
     */
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

    /**
     * Declara a fila que recebe atualizações de estado de reservas.
     *
     * @return fila durável para mensagens {@code booking.status.updated}.
     */
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

    /**
     * Associa a fila de atualização de estado à exchange de reservas.
     *
     * @return binding entre {@link #bookingStatusUpdatedQueue()} e {@link #bookingExchange()}.
     */
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

    /**
     * Configura o conversor de mensagens baseado em Jackson para serialização JSON.
     *
     * @return conversor a ser utilizado pelo {@link RabbitTemplate}.
     */
    @Bean
    public MessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * Cria o {@link RabbitTemplate} partilhado, já configurado com o conversor JSON.
     *
     * @param connectionFactory        fábrica de conexões AMQP.
     * @param jacksonMessageConverter  conversor de mensagens JSON.
     * @return instância configurada de {@link RabbitTemplate}.
     */
    @Bean
    public RabbitTemplate rabbitTemplate(org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory,
                                         MessageConverter jacksonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jacksonMessageConverter);
        return template;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory,
                                                                               MessageConverter jacksonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jacksonMessageConverter);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
