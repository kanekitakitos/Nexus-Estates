package com.nexus.estates.config.rabbitMQConfig;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração de RabbitMQ específica para o domínio de Properties.
 * <p>
 * Define a infraestrutura necessária para processar eventos como o envio
 * de emails após a criação de uma propriedade, incluindo mecanismos de
 * Dead Letter Queue (DLQ) para tratamento de falhas.
 * </p>
 */
@Configuration
public class PropertyRabbitConfig {

    @Value("${property.events.exchange:property.exchange}")
    private String propertyExchangeName;

    @Value("${property.events.queue.created.email:property.created.email.queue}")
    private String propertyCreatedEmailQueueName;

    @Value("${property.events.routing-key.created.email:property.created.email}")
    private String propertyCreatedEmailRoutingKey;

    @Value("${property.events.dlx:property.dlx}")
    private String propertyDeadLetterExchangeName;

    @Value("${property.events.queue.created.email.dlq:property.created.email.dlq}")
    private String propertyCreatedEmailDlqQueueName;

    @Value("${property.events.routing-key.created.email.dlq:property.created.email.dlq}")
    private String propertyCreatedEmailDlqRoutingKey;

    @Bean
    public TopicExchange propertyExchange() {
        return new TopicExchange(propertyExchangeName);
    }

    @Bean
    public TopicExchange propertyDeadLetterExchange() {
        return new TopicExchange(propertyDeadLetterExchangeName);
    }

    @Bean
    public Queue propertyCreatedEmailQueue() {
        // Fila principal configurada para reencaminhar falhas para a DLX
        return QueueBuilder
                .durable(propertyCreatedEmailQueueName)
                .withArgument("x-dead-letter-exchange", propertyDeadLetterExchangeName)
                .withArgument("x-dead-letter-routing-key", propertyCreatedEmailDlqRoutingKey)
                .build();
    }

    @Bean
    public Queue propertyCreatedEmailDlqQueue() {
        // Fila onde vão parar as mensagens que o listener rejeitou (erros no envio de email)
        return QueueBuilder
                .durable(propertyCreatedEmailDlqQueueName)
                .build();
    }

    @Bean
    public Binding propertyCreatedEmailBinding(Queue propertyCreatedEmailQueue, TopicExchange propertyExchange) {
        // Liga a fila principal ao exchange normal
        return BindingBuilder
                .bind(propertyCreatedEmailQueue)
                .to(propertyExchange)
                .with(propertyCreatedEmailRoutingKey);
    }

    @Bean
    public Binding propertyCreatedEmailDlqBinding(Queue propertyCreatedEmailDlqQueue, TopicExchange propertyDeadLetterExchange) {
        // Liga a DLQ ao Dead Letter Exchange
        return BindingBuilder
                .bind(propertyCreatedEmailDlqQueue)
                .to(propertyDeadLetterExchange)
                .with(propertyCreatedEmailDlqRoutingKey);
    }
}