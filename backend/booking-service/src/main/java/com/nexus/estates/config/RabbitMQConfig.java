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
 * Configuração central de infraestrutura para integração com RabbitMQ.
 *
 * <p>
 * Declara a exchange e as filas utilizadas pelo {@code booking-service},
 * bem como os bindings e o conversor de mensagens JSON partilhado pelo
 * {@link RabbitTemplate}.
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

    /**
     * Cria a exchange de tópicos responsável pelos eventos de reserva.
     *
     * @return instância configurada de {@link TopicExchange}.
     */
    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(bookingExchangeName);
    }

    /**
     * Declara a fila onde serão publicados os eventos de criação de reserva.
     *
     * @return fila durável para mensagens {@code booking.created}.
     */
    @Bean
    public Queue bookingCreatedQueue() {
        return new Queue(bookingCreatedQueueName, true);
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

    /**
     * Declara a fila que recebe atualizações de estado de reservas.
     *
     * @return fila durável para mensagens {@code booking.status.updated}.
     */
    @Bean
    public Queue bookingStatusUpdatedQueue() {
        return new Queue(bookingStatusUpdatedQueueName, true);
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
}
