package com.nexus.estates.service.chat;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nexus.estates.common.util.WebhookCryptoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Serviço especializado no processamento de webhooks provenientes da plataforma Ably.
 * <p>
 * Responsável estritamente pela camada de integração: validação de assinaturas HMAC-SHA256
 * para garantir a autenticidade da origem e extração de metadados dos canais de chat.
 * Após a validação, delega o processamento da regra de negócio para o {@link MessageService}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 * @since 2026-03-31
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AblyWebhookService
{

    /** Prefixo padrão dos canais de chat no Ably para identificação de reservas. */
    private static final String CHANNEL_PREFIX = "booking-chat:";

    private final MessageService messageService;

    @Value("${ably.webhook.secret}")
    private String webhookSecret;

    /**
     * Valida a assinatura HMAC-SHA256 do webhook usando o segredo configurado e o utilitário partilhado.
     *
     * @param requestBody Corpo bruto da requisição HTTP.
     * @param signatureHeader Valor do cabeçalho 'X-Ably-Signature'.
     * @return true se a mensagem for autêntica.
     */
    public boolean isSignatureValid(String requestBody, String signatureHeader) {
        return WebhookCryptoUtil.isValidSignature(requestBody, signatureHeader, webhookSecret);
    }

    /**
     * Processa o payload do webhook de forma assíncrona.
     * <p>
     * Itera sobre a lista de mensagens recebidas, extrai o ID da reserva associada ao canal
     * e encaminha o conteúdo para persistência e notificação.
     * </p>
     *
     * @param payload Objeto desserializado contendo o canal e as mensagens do Ably.
     */
    @Async
    public void processPayload(AblyWebhookPayload payload) {
        if (payload.messages() == null) return;

        payload.messages().forEach(msg -> {
            try {
                Long bookingId = extractBookingId(payload.channel());
                if (bookingId != null) {
                    messageService.handleNewIncomingMessage(bookingId, msg.clientId(), msg.data());
                }
            } catch (Exception e) {
                log.error("Erro ao processar mensagem do canal {}: {}", payload.channel(), e.getMessage());
            }
        });
    }

    /**
     * Extrai o ID da reserva a partir do nome do canal (ex.: booking-chat:123).
     *
     * @param channel Nome completo do canal.
     * @return O ID da reserva ou null se o formato for inválido.
     */
    private Long extractBookingId(String channel) {
        if (channel != null && channel.startsWith(CHANNEL_PREFIX)) {
            try {
                return Long.parseLong(channel.substring(CHANNEL_PREFIX.length()));
            } catch (NumberFormatException e) {
                log.warn("Formato de ID de reserva inválido no canal Ably: {}", channel);
                return null;
            }
        }
        return null;
    }

    /** DTO para o payload raiz do webhook do Ably. */
    public record AblyWebhookPayload(
            @JsonProperty("channel") String channel,
            @JsonProperty("messages") List<AblyWebhookMessage> messages
    ) {}

    /** DTO para representação individual de uma mensagem dentro do webhook. */
    public record AblyWebhookMessage(
            @JsonProperty("clientId") String clientId,
            @JsonProperty("data") String data
    ) {}
}