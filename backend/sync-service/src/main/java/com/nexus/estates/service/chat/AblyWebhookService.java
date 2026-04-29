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
public class AblyWebhookService {

    /** Prefixo padrão dos canais de chat no Ably para identificação de reservas. */
    private static final String CHANNEL_PREFIX = "booking-chat:";

    private final MessageService messageService;

    @Value("${ably.webhook.secret}")
    private String webhookSecret;

    /**
     * Valida a assinatura HMAC-SHA256 do webhook usando o segredo configurado e o utilitário partilhado.
     * <p>
     * Utiliza a função utilitária {@link WebhookCryptoUtil#isValidSignature(String, String, String)}
     * para verificar se a assinatura enviada no cabeçalho condiz com a hash que o sistema
     * Nexus gerou, utilizando o segredo configurado (tipicamente através de variáveis de ambiente).
     * </p>
     *
     * @param requestBody Corpo bruto (raw text/JSON) da requisição HTTP efetuada pelo Ably.
     * @param signatureHeader Valor explícito do cabeçalho de assinatura 'X-Ably-Signature'.
     * @return {@code true} se as assinaturas coincidirem, indicando a proveniência e integridade,
     *         ou {@code false} em caso de payload ou cabeçalho incorretos/manipulados.
     */
    public boolean isSignatureValid(String requestBody, String signatureHeader) {
        return WebhookCryptoUtil.isValidSignature(requestBody, signatureHeader, webhookSecret);
    }

    /**
     * Ponto de entrada processual (assíncrono) para o conteúdo validado proveniente do Ably.
     * <p>
     * Itera sobre a lista de mensagens recém-recebidas, tenta extrair o ID numérico associado
     * à reserva partindo do nome do canal e encaminha o evento para os fluxos persistentes
     * e notificacionais (usando o {@link MessageService}).
     * </p>
     *
     * @param payload Objeto DTO (Data Transfer Object) em formato {@link AblyWebhookPayload}
     *                contendo tanto o canal global desta requisição, quanto os itens das
     *                mensagens em si a processar.
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
     * Analisa o nome completo de um canal fornecido pelo Ably e extrai o ID da reserva associada.
     * <p>
     * O formato esperado para extração bem sucedida baseia-se num prefixo fixo
     * (definido em {@code CHANNEL_PREFIX}) seguido pelo identificador numérico,
     * exemplo prático: {@code booking-chat:123}.
     * </p>
     *
     * @param channel A String que designa o canal específico na plataforma Ably.
     * @return O Identificador numérico extraído da string sob a forma de {@link Long},
     *         ou {@code null} se o nome do canal for incompatível, em falta ou mal-formado
     *         (com registo de Warning no log).
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

    /**
     * DTO utilizado exclusivamente na conversão (deserialização) de dados originados do Ably.
     * Atua como um recetáculo raiz imutável para a abstração do webhook JSON enviado pelo Ably.
     *
     * @param channel O nome global do canal no qual estas mensagens foram trocadas.
     * @param messages Uma lista de objetos {@link AblyWebhookMessage} representando uma ou mais
     *                 mensagens do canal.
     */
    public record AblyWebhookPayload(
            @JsonProperty("channel") String channel,
            @JsonProperty("messages") List<AblyWebhookMessage> messages
    ) {}

    /**
     * DTO auxiliar focado no escopo e composição singular de uma mensagem pertencente ao Ably.
     * Usado diretamente no mapeamento de items pertencentes à lista interna de um {@link AblyWebhookPayload}.
     *
     * @param clientId Identificador ou token de ligação que mapeia o remetente explícito do Ably.
     * @param data O conteúdo concreto (payload) desta mensagem efetuada num canal de chat.
     */
    public record AblyWebhookMessage(
            @JsonProperty("clientId") String clientId,
            @JsonProperty("data") String data
    ) {}
}