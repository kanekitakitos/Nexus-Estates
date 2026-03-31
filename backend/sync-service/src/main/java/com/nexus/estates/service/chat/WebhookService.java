package com.nexus.estates.service.chat;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.service.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Serviço de processamento de webhooks do Ably para chat em tempo real.
 * <p>
 * Responsável por validar assinatura HMAC, persistir mensagens recebidas e disparar notificações
 * por email (quando permitido) para participantes de uma reserva.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 * @see MessageService
 * @see EmailService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookService {

    private final MessageService messageService;
    private final Proxy proxy;
    private final EmailService emailService;

    @Value("${ably.webhook.secret}")
    private String webhookSecret;

    private static final String HMAC_SHA256 = "HmacSHA256";

    /**
     * Valida a assinatura HMAC-SHA256 do webhook.
     *
     * @param requestBody corpo bruto do webhook
     * @param signatureHeader cabeçalho com a assinatura (sha256=...)
     * @return true se a assinatura corresponder ao corpo, caso contrário false
     */
    public boolean isSignatureValid(String requestBody, String signatureHeader) {
        if (signatureHeader == null || requestBody == null) return false;
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] signatureBytes = mac.doFinal(requestBody.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = "sha256=" + Base64.getEncoder().encodeToString(signatureBytes);
            return signatureHeader.equals(expectedSignature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Erro na validação de assinatura: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Processa o payload do webhook de forma assíncrona, persistindo e notificando participantes.
     *
     * @param payload payload já desserializado do Ably
     */
    @Async
    public void processPayload(AblyWebhookPayload payload) {
        if (payload.messages() == null) return;

        payload.messages().forEach(msg -> {
            try {
                processSingleMessage(payload.channel(), msg);
            } catch (Exception e) {
                log.error("Erro ao processar mensagem do canal {}: {}", payload.channel(), e.getMessage());
            }
        });
    }

    /**
     * Processa uma única mensagem do webhook para um canal específico.
     *
     * @param channel nome do canal (ex.: booking-chat:123)
     * @param message mensagem recebida
     */
    private void processSingleMessage(String channel, AblyWebhookMessage message) {
        Long bookingId = extractBookingId(channel);
        if (bookingId == null) return;

        String senderId = message.clientId();
        String content = message.data();

        messageService.saveMessage(bookingId, senderId, content);
        log.info("Mensagem persistida via webhook para Booking ID {}", bookingId);

        Set<Long> participants = proxy.bookingClient().getBookingParticipants(bookingId);
        Long receiverId = participants.stream()
                .filter(id -> !id.toString().equals(senderId))
                .findFirst()
                .orElse(null);

        if (receiverId == null) return;

        NexusClients.UserPreferencesDTO preferences = proxy.userClient().getUserPreferences(receiverId);
        if (preferences != null && preferences.emailNotificationsEnabled()) {
            String receiverEmail = proxy.userClient().getUserEmail(receiverId);
            sendEmailNotification(receiverEmail, content, bookingId);
        }
    }

    /**
     * Extrai o ID de reserva de um nome de canal (booking-chat:<id>).
     *
     * @param channel nome do canal
     * @return id da reserva ou null se inválido
     */
    private Long extractBookingId(String channel) {
        if (channel != null && channel.startsWith("booking-chat:")) {
            try {
                return Long.parseLong(channel.split(":")[1]);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Envia notificação de email sobre nova mensagem do chat.
     *
     * @param email destinatário
     * @param messageContent conteúdo da mensagem
     * @param bookingId id da reserva
     */
    private void sendEmailNotification(String email, String messageContent, Long bookingId) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("bookingId", bookingId);
        variables.put("messageContent", messageContent);
        emailService.sendEmailFromTemplate(email, "Nova mensagem na reserva #" + bookingId, "chat-notification", variables);
    }

    public record AblyWebhookPayload(
            @JsonProperty("channel") String channel,
            @JsonProperty("messages") List<AblyWebhookMessage> messages
    ) {}

    public record AblyWebhookMessage(
            @JsonProperty("clientId") String clientId,
            @JsonProperty("data") String data
    ) {}
}
