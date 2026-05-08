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
 *
 * @author Nexus Estates Team
 * @version 1.0
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

    /**
     * Exchange principal para roteamento de eventos relacionados com propriedades
     * @return exchange do tipo {@link TopicExchange}
     */
    @Bean
    public TopicExchange propertyExchange() {
        return new TopicExchange(propertyExchangeName);
    }

    /**
     * Dead Letter Exchange (DLX) para lidar com falhas de processamento de propriedades
     * @return exchange de fallback do tipo {@link TopicExchange}
     */
    @Bean
    public TopicExchange propertyDeadLetterExchange() {
        return new TopicExchange(propertyDeadLetterExchangeName);
    }


    /**
     * Fila principal que processa o envio de emails quando uma propriedade é criada
     * <p>
     *     Está configurada com argumentos para redirecionar mensagens rejeitadas para a DLX
     * </p>
     * @return Fila durável
     */
    @Bean
    public Queue propertyCreatedEmailQueue() {
        // Fila principal configurada para reencaminhar falhas para a DLX
        return QueueBuilder
                .durable(propertyCreatedEmailQueueName)
                .withArgument("x-dead-letter-exchange", propertyDeadLetterExchangeName)
                .withArgument("x-dead-letter-routing-key", propertyCreatedEmailDlqRoutingKey)
                .build();
    }

    /**
     * Dead Letter Queue (DLQ) onde vão parar as mensagens rejeitadas pelo listener
     * @return Fila durável de DLQ
     */
    @Bean
    public Queue propertyCreatedEmailDlqQueue() {
        // Fila onde vão parar as mensagens que o listener rejeitou (erros no envio de email)
        return QueueBuilder
                .durable(propertyCreatedEmailDlqQueueName)
                .build();
    }

    /**
     * Liga a fila principal de emails ao exchange normal da propriedade
     * @param propertyCreatedEmailQueue fila alvo
     * @param propertyExchange exchange fonte
     * @return Binding configurado
     */
    @Bean
    public Binding propertyCreatedEmailBinding(Queue propertyCreatedEmailQueue, TopicExchange propertyExchange) {
        // Liga a fila principal ao exchange normal
        return BindingBuilder
                .bind(propertyCreatedEmailQueue)
                .to(propertyExchange)
                .with(propertyCreatedEmailRoutingKey);
    }

    /**
     * Liga a DLQ de emails ao Dead Letter Exchange
     * @param propertyCreatedEmailDlqQueue fila DLQ alvo
     * @param propertyDeadLetterExchange DLX fonte
     * @return Binding configurado para tratamento de erros
     */
    @Bean
    public Binding propertyCreatedEmailDlqBinding(Queue propertyCreatedEmailDlqQueue, TopicExchange propertyDeadLetterExchange) {
        // Liga a DLQ ao Dead Letter Exchange
        return BindingBuilder
                .bind(propertyCreatedEmailDlqQueue)
                .to(propertyDeadLetterExchange)
                .with(propertyCreatedEmailDlqRoutingKey);
    }
}