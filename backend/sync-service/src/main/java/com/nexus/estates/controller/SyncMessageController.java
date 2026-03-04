package com.nexus.estates.controller;

import com.nexus.estates.entity.Message;
import com.nexus.estates.service.interfaces.ChatPlatform;
import com.nexus.estates.service.MessageService;
import com.nexus.estates.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class SyncMessageController {

    private final MessageService messageService;
    private final ChatPlatform chatPlatform;
    private final WebhookService webhookService;

    /**
     * Recupera o histórico completo de mensagens de uma reserva específica.
     *
     * @param bookingId O ID da reserva.
     * @return Uma lista de mensagens ordenadas cronologicamente.
     */
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
     * @param payload O payload do webhook contendo as mensagens.
     * @param signature A assinatura HMAC-SHA256 enviada no cabeçalho.
     * @return 200 OK se a assinatura for válida e o processamento iniciado.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody WebhookService.AblyWebhookPayload payload,
            @RequestHeader("X-Ably-Signature") String signature
    ) {
        // TODO: Em produção, validar a assinatura usando o corpo cru da requisição.
        // if (!webhookService.isSignatureValid(rawBody, signature)) return ResponseEntity.status(401).build();

        log.info("Recebido webhook do Ably para canal: {}", payload.channel());

        webhookService.processPayload(payload);

        return ResponseEntity.ok("Webhook received and processing started");
    }

    /**
     * DTO para recebimento de novas mensagens.
     */
    public record SendMessageRequest(String senderId, String content) {}
}
