package com.nexus.estates.controller;

import com.nexus.estates.dto.SyncBlockDTO;
import com.nexus.estates.service.IcsCalendarParserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Controlador REST para operações administrativas relacionadas com calendários externos (.ics).
 * <p>
 * Este controlador permite:
 * </p>
 * <ul>
 *   <li>Interpretar ficheiros iCal (.ics) e visualizar os blocos normalizados em UTC;</li>
 *   <li>Aplicar esses blocos diretamente no domínio interno através de eventos AMQP,
 *   publicando mensagens de bloqueio para o booking-service.</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/sync/admin/ics")
@Tag(name = "ICS Admin", description = "Operações administrativas para interpretar e aplicar calendários externos (.ics)")
public class IcsAdminController {

    private final IcsCalendarParserService parserService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${booking.events.exchange:booking.exchange}")
    private String bookingExchangeName;

    @Value("${booking.calendar.routing-key.block:calendar.block}")
    private String calendarBlockRoutingKey;

    /**
     * Instancia o controlador com as dependências necessárias.
     *
     * @param parserService serviço responsável por interpretar ficheiros iCal (.ics).
     * @param rabbitTemplate template AMQP utilizado para publicar mensagens de bloqueio.
     */
    public IcsAdminController(IcsCalendarParserService parserService,
                              RabbitTemplate rabbitTemplate) {
        this.parserService = parserService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping(
            value = "/parse",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    /**
     * Interpreta o conteúdo bruto de um ficheiro iCal (.ics) enviado como texto.
     *
     * @param icsContents conteúdo textual completo do ficheiro .ics.
     * @return lista de blocos normalizados em UTC.
     */
    @Operation(
            summary = "Interpreta conteúdo .ics bruto",
            description = "Recebe o conteúdo textual de um ficheiro .ics e devolve blocos normalizados em UTC."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Blocos extraídos com sucesso",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = SyncBlockDTO.class)))
    )
    public ResponseEntity<List<SyncBlockDTO>> parseRaw(@RequestBody String icsContents) {
        List<SyncBlockDTO> blocks = parserService.parseBlocks(icsContents);
        return ResponseEntity.ok(blocks);
    }

    @PostMapping(
            value = "/parse-file",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    /**
     * Interpreta um ficheiro iCal (.ics) enviado via multipart/form-data.
     *
     * @param file ficheiro .ics a interpretar.
     * @return lista de blocos normalizados em UTC.
     * @throws IOException se ocorrer um erro ao ler o ficheiro.
     */
    @Operation(
            summary = "Interpreta ficheiro .ics enviado",
            description = "Recebe um ficheiro .ics via multipart/form-data e devolve blocos normalizados em UTC."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Blocos extraídos com sucesso",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = SyncBlockDTO.class)))
    )
    public ResponseEntity<List<SyncBlockDTO>> parseFile(MultipartFile file) throws IOException {
        List<SyncBlockDTO> blocks = parserService.parseBlocks(file.getInputStream());
        return ResponseEntity.ok(blocks);
    }

    @PostMapping(
            value = "/apply",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    /**
     * Aplica bloqueios de calendário a partir de conteúdo .ics textual.
     * <p>
     * Para cada bloco extraído, é publicada uma mensagem AMQP com os detalhes
     * do intervalo e metadados do evento externo, direcionada à propriedade
     * indicada.
     * </p>
     *
     * @param propertyId identificador da propriedade cujas datas serão bloqueadas.
     * @param icsContents conteúdo textual completo do ficheiro .ics.
     * @return lista de blocos extraídos e publicados.
     */
    @Operation(
        summary = "Aplica bloqueios ao calendário interno",
        description = "Recebe conteúdo .ics em texto e publica eventos de bloqueio para a propriedade indicada."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Bloqueios publicados com sucesso",
        content = @Content(array = @ArraySchema(schema = @Schema(implementation = SyncBlockDTO.class)))
    )
    public ResponseEntity<List<SyncBlockDTO>> applyRaw(@RequestParam("propertyId") Long propertyId,
                                                       @RequestBody String icsContents) {
        List<SyncBlockDTO> blocks = parserService.parseBlocks(icsContents);
        blocks.forEach(b -> rabbitTemplate.convertAndSend(
                bookingExchangeName,
                calendarBlockRoutingKey,
                new com.nexus.estates.common.messaging.CalendarBlockMessage(
                        propertyId,
                        b.startUtc(),
                        b.endUtc(),
                        b.uid(),
                        b.summary()
                )
        ));
        return ResponseEntity.ok(blocks);
    }

    @PostMapping(
            value = "/apply-file",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    /**
     * Aplica bloqueios de calendário a partir de um ficheiro .ics enviado via multipart.
     * <p>
     * O ficheiro é interpretado e, para cada bloco resultante, é publicada uma
     * mensagem AMQP para o booking-service aplicar o bloqueio no calendário
     * interno da propriedade.
     * </p>
     *
     * @param propertyId identificador da propriedade cujas datas serão bloqueadas.
     * @param file ficheiro .ics contendo os eventos de bloqueio.
     * @return lista de blocos extraídos e publicados.
     * @throws IOException se ocorrer um erro ao ler o ficheiro.
     */
    @Operation(
        summary = "Aplica bloqueios a partir de ficheiro .ics",
        description = "Recebe um ficheiro .ics via multipart e publica eventos de bloqueio para a propriedade."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Bloqueios publicados com sucesso",
        content = @Content(array = @ArraySchema(schema = @Schema(implementation = SyncBlockDTO.class)))
    )
    public ResponseEntity<List<SyncBlockDTO>> applyFile(@RequestParam("propertyId") Long propertyId,
                                                        MultipartFile file) throws IOException {
        List<SyncBlockDTO> blocks = parserService.parseBlocks(file.getInputStream());
        blocks.forEach(b -> rabbitTemplate.convertAndSend(
                bookingExchangeName,
                calendarBlockRoutingKey,
                new com.nexus.estates.common.messaging.CalendarBlockMessage(
                        propertyId,
                        b.startUtc(),
                        b.endUtc(),
                        b.uid(),
                        b.summary()
                )
        ));
        return ResponseEntity.ok(blocks);
    }
}
