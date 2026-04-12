package com.nexus.estates.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.entity.Message;
import com.nexus.estates.service.chat.AblyWebhookService;
import com.nexus.estates.service.chat.ChatPlatform;
import com.nexus.estates.service.chat.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller responsável pela gestão de mensagens de chat.
 * <p>
 * Fornece endpoints para recuperar o histórico de mensagens e enviar novas mensagens,
 * garantindo a persistência local e a sincronização em tempo real via {@link ChatPlatform}.
 * </p>
 */
@Slf4j
@RestController
@RequestMapping("/api/sync/messages")
@RequiredArgsConstructor
@Tag(name = "Sync Messages", description = "Endpoints para mensagens e webhooks de chat (Ably).")
public class SyncMessageController {

    private final MessageService messageService;
    private final ChatPlatform chatPlatform;
    private final AblyWebhookService webhookService;
    private final ObjectMapper objectMapper;

    /**
     * Recupera o histórico completo de mensagens de uma reserva específica.
     *
     * @param bookingId O ID da reserva.
     * @return Uma lista de mensagens ordenadas cronologicamente.
     */
    @Operation(summary = "Listar mensagens", description = "Retorna o histórico de mensagens associado a uma reserva.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso",
                    content = @Content(schema = @Schema(implementation = Message.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
    })
    @GetMapping("/{bookingId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long bookingId) {
        log.info("Solicitação de histórico de mensagens para Booking ID: {}", bookingId);
        List<Message> messages = messageService.getMessagesByBookingId(bookingId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Envia uma nova mensagem para o chat de uma reserva.
     *
     * @param bookingId O ID da reserva.
     * @param request   O corpo da requisição contendo o remetente e o conteúdo.
     * @return A mensagem persistida.
     */
    @Operation(summary = "Enviar mensagem", description = "Persiste a mensagem e publica no canal de tempo real.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mensagem enviada com sucesso",
                    content = @Content(schema = @Schema(implementation = Message.class))),
            @ApiResponse(responseCode = "400", description = "Payload inválido", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
    })
    @PostMapping("/{bookingId}")
    public ResponseEntity<Message> sendMessage(
            @PathVariable Long bookingId,
            @RequestBody SendMessageRequest request
    ) {
        log.info("Recebendo nova mensagem para Booking ID {}: {}", bookingId, request.content());

        // 1. Persistir localmente
        Message savedMessage = messageService.saveMessage(bookingId, request.senderId(), request.content());

        // 2. Publicar no canal de tempo real
        String channelId = "booking-chat:" + bookingId;
        boolean published = chatPlatform.sendMessage(channelId, "new-message", savedMessage);

        if (!published) {
            log.warn("Falha ao publicar mensagem no canal de tempo real para Booking ID {}", bookingId);
        }

        return ResponseEntity.ok(savedMessage);
    }

    /**
     * Endpoint para receber webhooks do Ably.
     *
     * @param rawBody O corpo cru do webhook.
     * @param signature A assinatura HMAC-SHA256 enviada no cabeçalho.
     * @return 200 OK se a assinatura for válida e o processamento iniciado.
     */
    @Operation(summary = "Webhook Ably", description = "Valida assinatura HMAC e processa mensagens recebidas.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Webhook aceite e processamento iniciado", content = @Content),
            @ApiResponse(responseCode = "400", description = "Payload inválido", content = @Content),
            @ApiResponse(responseCode = "401", description = "Assinatura inválida", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
    })
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String rawBody,
            @Parameter(description = "Assinatura HMAC-SHA256 (formato: sha256=...)") @RequestHeader("X-Ably-Signature") String signature
    ) {
        if (!webhookService.isSignatureValid(rawBody, signature)) {
            return ResponseEntity.status(401).body("Invalid signature");
        }

        AblyWebhookService.AblyWebhookPayload payload;
        try {
            payload = objectMapper.readValue(rawBody, AblyWebhookService.AblyWebhookPayload.class);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid payload");
        }

        log.info("Recebido webhook do Ably para canal: {}", payload.channel());

        webhookService.processPayload(payload);

        return ResponseEntity.ok("Webhook received and processing started");
    }

    /**
     * DTO para recebimento de novas mensagens.
     */
    public record SendMessageRequest(String senderId, String content) {}
}
