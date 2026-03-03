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
    /**
     * Exchange principal para eventos de reservas.
     *
     * @return exchange do tipo {@link TopicExchange} para publicação/roteamento de eventos
     */
    public TopicExchange bookingExchange() {
        return new TopicExchange(bookingExchangeName);
    }

    @Bean
    /**
     * Dead Letter Exchange (DLX) utilizada para mensagens rejeitadas.
     *
     * @return exchange do tipo {@link TopicExchange} para encaminhamento de DLQs
     */
    public TopicExchange bookingDeadLetterExchange() {
        return new TopicExchange(bookingDeadLetterExchangeName);
    }

    @Bean
    /**
     * Fila para eventos de criação de reservas com DLQ configurada.
     *
     * @return fila durável com argumentos de DLX e routing-key de DLQ
     */
    public Queue bookingCreatedQueue() {
        return QueueBuilder
                .durable(bookingCreatedQueueName)
                .withArgument("x-dead-letter-exchange", bookingDeadLetterExchangeName)
                .withArgument("x-dead-letter-routing-key", bookingCreatedDlqRoutingKey)
                .build();
    }

    @Bean
    /**
     * Dead Letter Queue para eventos de criação de reservas.
     *
     * @return fila durável dedicada a DLQ de booking.created
     */
    public Queue bookingCreatedDlqQueue() {
        return QueueBuilder
                .durable(bookingCreatedDlqQueueName)
                .build();
    }

    @Bean
    /**
     * Binding entre a fila de criação de reservas e a exchange principal.
     *
     * @param bookingCreatedQueue fila alvo
     * @param bookingExchange exchange fonte
     * @return binding configurado com routing-key específica
     */
    public Binding bookingCreatedBinding(Queue bookingCreatedQueue, TopicExchange bookingExchange) {
        return BindingBuilder
                .bind(bookingCreatedQueue)
                .to(bookingExchange)
                .with(bookingCreatedRoutingKey);
    }

    @Bean
    /**
     * Binding entre a DLQ de criação de reservas e a Dead Letter Exchange.
     *
     * @param bookingCreatedDlqQueue fila DLQ
     * @param bookingDeadLetterExchange DLX
     * @return binding de DLQ com routing-key dedicada
     */
    public Binding bookingCreatedDlqBinding(Queue bookingCreatedDlqQueue, TopicExchange bookingDeadLetterExchange) {
        return BindingBuilder
                .bind(bookingCreatedDlqQueue)
                .to(bookingDeadLetterExchange)
                .with(bookingCreatedDlqRoutingKey);
    }

    @Bean
    /**
     * Fila para eventos de atualização de estado de reservas com DLQ configurada.
     *
     * @return fila durável com argumentos de DLX e routing-key de DLQ
     */
    public Queue bookingStatusUpdatedQueue() {
        return QueueBuilder
                .durable(bookingStatusUpdatedQueueName)
                .withArgument("x-dead-letter-exchange", bookingDeadLetterExchangeName)
                .withArgument("x-dead-letter-routing-key", bookingStatusUpdatedDlqRoutingKey)
                .build();
    }

    @Bean
    /**
     * Dead Letter Queue para eventos de atualização de estado.
     *
     * @return fila durável dedicada a DLQ de booking.status.updated
     */
    public Queue bookingStatusUpdatedDlqQueue() {
        return QueueBuilder
                .durable(bookingStatusUpdatedDlqQueueName)
                .build();
    }

    @Bean
    /**
     * Binding entre a fila de atualização de estado e a exchange principal.
     *
     * @param bookingStatusUpdatedQueue fila alvo
     * @param bookingExchange exchange fonte
     * @return binding configurado com routing-key específica
     */
    public Binding bookingStatusUpdatedBinding(Queue bookingStatusUpdatedQueue, TopicExchange bookingExchange) {
        return BindingBuilder
                .bind(bookingStatusUpdatedQueue)
                .to(bookingExchange)
                .with(bookingStatusUpdatedRoutingKey);
    }

    @Bean
    /**
     * Binding entre a DLQ de atualização de estado e a Dead Letter Exchange.
     *
     * @param bookingStatusUpdatedDlqQueue fila DLQ
     * @param bookingDeadLetterExchange DLX
     * @return binding de DLQ com routing-key dedicada
     */
    public Binding bookingStatusUpdatedDlqBinding(Queue bookingStatusUpdatedDlqQueue, TopicExchange bookingDeadLetterExchange) {
        return BindingBuilder
                .bind(bookingStatusUpdatedDlqQueue)
                .to(bookingDeadLetterExchange)
                .with(bookingStatusUpdatedDlqRoutingKey);
    }

    @Bean
    /**
     * Conversor de mensagens para JSON usando Jackson.
     *
     * @return {@link Jackson2JsonMessageConverter} para serialização/deserialização
     */
    public MessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    /**
     * Template de acesso ao RabbitMQ com conversor JSON por defeito.
     *
     * @param connectionFactory fábrica de conexões ao broker
     * @param jacksonMessageConverter conversor de mensagem
     * @return {@link RabbitTemplate} configurado
     */
    public RabbitTemplate rabbitTemplate(org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory,
                                         MessageConverter jacksonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jacksonMessageConverter);
        return template;
    }

    @Bean
    /**
     * Fábrica de containers para listeners com política de rejeição sem requeue.
     *
     * @param connectionFactory fábrica de conexões ao broker
     * @param jacksonMessageConverter conversor de mensagens
     * @return {@link SimpleRabbitListenerContainerFactory} ajustada para DLQ
     */
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory,
                                                                               MessageConverter jacksonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jacksonMessageConverter);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
