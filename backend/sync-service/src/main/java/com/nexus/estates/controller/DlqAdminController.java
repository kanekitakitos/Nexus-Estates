package com.nexus.estates.controller;

import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * Endpoints administrativos para inspecionar e drenar filas de Dead Letter Queue (DLQ)
 * relacionadas com o fluxo de reservas.
 *
 * <p>
 * Estes endpoints são destinados a operações de suporte/observabilidade e não devem ser
 * expostos diretamente a clientes finais. Servem para inspecionar mensagens que foram
 * encaminhadas para DLQ devido a erros de processamento ou payloads inválidos.
 * </p>
 */
@RestController
@RequestMapping("/api/sync/admin/dlq")
@Tag(
        name = "DLQ Admin",
        description = "Operações administrativas para inspecionar Dead Letter Queues do fluxo de reservas."
)
public class DlqAdminController {

    private final RabbitTemplate rabbitTemplate;
    private final String bookingCreatedDlqQueueName;
    private final String bookingStatusUpdatedDlqQueueName;

    /**
     * Construtor com injeção das dependências e nomes de filas DLQ.
     *
     * @param rabbitTemplate template partilhado para operações AMQP
     * @param bookingCreatedDlqQueueName nome da DLQ de criação de reservas
     * @param bookingStatusUpdatedDlqQueueName nome da DLQ de alteração de estado
     */
    public DlqAdminController(RabbitTemplate rabbitTemplate,
                              @Value("${booking.events.queue.created.dlq:booking.created.dlq}") String bookingCreatedDlqQueueName,
                              @Value("${booking.events.queue.status-updated.dlq:booking.status.updated.dlq}") String bookingStatusUpdatedDlqQueueName) {
        this.rabbitTemplate = rabbitTemplate;
        this.bookingCreatedDlqQueueName = bookingCreatedDlqQueueName;
        this.bookingStatusUpdatedDlqQueueName = bookingStatusUpdatedDlqQueueName;
    }

    @GetMapping("/booking-created")
    @Operation(
            summary = "Consulta mensagens de DLQ de reservas criadas",
            description = "Lê e remove mensagens da fila de Dead Letter de booking.created até ao limite indicado."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Mensagens lidas com sucesso a partir da DLQ",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = BookingCreatedMessage.class))
                    )
            )
    })
    /**
     * Drena mensagens da DLQ de reservas criadas até um limite dado.
     *
     * @param limit número máximo de mensagens a consumir da DLQ
     * @return lista de {@link BookingCreatedMessage} drenadas
     * @see com.nexus.estates.config.RabbitMQConfig
     */
    public ResponseEntity<List<BookingCreatedMessage>> drainBookingCreatedDlq(
            @Parameter(
                    description = "Número máximo de mensagens a ler da DLQ",
                    example = "10"
            )
            @RequestParam(defaultValue = "10") int limit) {
        List<BookingCreatedMessage> messages = new ArrayList<>();
        for (int i = 0; i < limit; i++) {
            Object payload = rabbitTemplate.receiveAndConvert(bookingCreatedDlqQueueName);
            if (payload == null) {
                break;
            }
            if (payload instanceof BookingCreatedMessage message) {
                messages.add(message);
            }
        }
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/booking-status-updated")
    @Operation(
            summary = "Consulta mensagens de DLQ de atualizações de estado",
            description = "Lê e remove mensagens da fila de Dead Letter de booking.status.updated até ao limite indicado."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Mensagens lidas com sucesso a partir da DLQ",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = BookingStatusUpdatedMessage.class))
                    )
            )
    })
    /**
     * Drena mensagens da DLQ de atualizações de estado de reservas até um limite dado.
     *
     * @param limit número máximo de mensagens a consumir da DLQ
     * @return lista de {@link BookingStatusUpdatedMessage} drenadas
     * @see com.nexus.estates.config.RabbitMQConfig
     */
    public ResponseEntity<List<BookingStatusUpdatedMessage>> drainBookingStatusUpdatedDlq(
            @Parameter(
                    description = "Número máximo de mensagens a ler da DLQ",
                    example = "10"
            )
            @RequestParam(defaultValue = "10") int limit) {
        List<BookingStatusUpdatedMessage> messages = new ArrayList<>();
        for (int i = 0; i < limit; i++) {
            Object payload = rabbitTemplate.receiveAndConvert(bookingStatusUpdatedDlqQueueName);
            if (payload == null) {
                break;
            }
            if (payload instanceof BookingStatusUpdatedMessage message) {
                messages.add(message);
            }
        }
        return ResponseEntity.ok(messages);
    }
}
