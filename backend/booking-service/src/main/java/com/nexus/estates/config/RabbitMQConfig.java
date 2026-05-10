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

    @Value("${booking.calendar.routing-key.block:calendar.block}")
    private String calendarBlockRoutingKey;

    @Value("${booking.calendar.queue.block:calendar.block.queue}")
    private String calendarBlockQueueName;

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

    /**
     * Cria a exchange de Dead Letters (DLX)
     * <p>Atua como a "estação de correios de segurança" para onde vão as mensagens que falharam o processamento</p>
     * @return Instância configurada de {@link TopicExchange} para erros
     */
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

    /**
     * Declara a Dead Letter Queue (DLQ) para eventos de criação de reserva que falharam
     * @return Fila durável de segurança
     */
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


    /**
     * Associa a fila de falhas (DLQ) de criação de reserva à Dead Letter Exchange
     * @param bookingCreatedDlqQueue A fila de mensagens mortas gerada pelo bean
     * @param bookingDeadLetterExchange A exchange de segurança do sistema
     * @return Regra de roteamento para erros (Binding)
     */
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


    /**
     * Declara a Dead Letter Queue (DLQ) para eventos de atualização de estado que falharam
     * @return Fila durável de segurança
     */
    @Bean
    public Queue bookingStatusUpdatedDlqQueue() {
        return QueueBuilder
                .durable(bookingStatusUpdatedDlqQueueName)
                .build();
    }


    /**
     * Declara a fila que recebe pedidos de bloqueio de calendário de sistemas externos
     * @return Fila durável configurada para mensagens de bloqueio
     */
    @Bean
    public Queue calendarBlockQueue() {
        return QueueBuilder
                .durable(calendarBlockQueueName)
                .withArgument("x-dead-letter-exchange", bookingDeadLetterExchangeName)
                .withArgument("x-dead-letter-routing-key", calendarBlockRoutingKey + ".dlq")
                .build();
    }


    /**
     * Declara a Dead Letter Queue (DLQ) para eventos de bloqueio de calendário que falharam
     * @return Fila durável de segurança
     */
    @Bean
    public Queue calendarBlockDlqQueue() {
        return QueueBuilder
                .durable(calendarBlockRoutingKey + ".dlq")
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


    /**
     * Associa a fila de falhas de atualização de estado à Dead Letter Exchange
     * @param bookingStatusUpdatedDlqQueue A fila de mensagens mortas de atualizações
     * @param bookingDeadLetterExchange A exchange de segurança
     * @return Regra de roteamento para erros (Binding)
     */
    @Bean
    public Binding bookingStatusUpdatedDlqBinding(Queue bookingStatusUpdatedDlqQueue, TopicExchange bookingDeadLetterExchange) {
        return BindingBuilder
                .bind(bookingStatusUpdatedDlqQueue)
                .to(bookingDeadLetterExchange)
                .with(bookingStatusUpdatedDlqRoutingKey);
    }


    /**
     * Associa a fila de bloqueios de calendário à exchange principal
     * @param calendarBlockQueue A fila de bloqueios
     * @param bookingExchange A exchange principal
     * @return Regra de roteamento (Binding)
     */
    @Bean
    public Binding calendarBlockBinding(Queue calendarBlockQueue, TopicExchange bookingExchange) {
        return BindingBuilder
                .bind(calendarBlockQueue)
                .to(bookingExchange)
                .with(calendarBlockRoutingKey);
    }


    /**
     * Associa a fila de falhas de bloqueios de calendário à Dead Letter Exchange
     * @param calendarBlockDlqQueue A fila de mensagens mortas de bloqueios
     * @param bookingDeadLetterExchange A exchange de segurança
     * @return Regra de roteamento para erros (Binding)
     */
    @Bean
    public Binding calendarBlockDlqBinding(Queue calendarBlockDlqQueue, TopicExchange bookingDeadLetterExchange) {
        return BindingBuilder
                .bind(calendarBlockDlqQueue)
                .to(bookingDeadLetterExchange)
                .with(calendarBlockRoutingKey + ".dlq");
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


    /**
     * Configura a fábrica de listeners (consumidores) do RabbitMQ
     * <p>
     *     <b>
     *         Decisão Crítica de Arquitetura:
     *     </b>
     *     Define {@code setDefaultRequeueRejected(false)}
     *     Isto impede que mensagens com erro (ex: falhas na base de dados) sejam constantemente
     *     recarregadas na fila principal (criando loops infinitos). Em vez disso, se uma mensagem
     *     der erro no listener, ela é descartada da fila principal e o RabbitMQ move-a automaticamente para a Dead Letter Queue (DLQ)
     * </p>
     * @param connectionFactory A fábrica de conexões AMQP gerida pelo Spring Boot
     * @param jacksonMessageConverter O conversor JSON para ler os eventos de entrada
     * @return A fábrica de listeners configurada
     */
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
