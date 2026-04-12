package com.nexus.estates.service.chat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.common.util.WebhookCryptoUtil;
import com.nexus.estates.dto.ExternalApiConfig;
import com.nexus.estates.entity.WebhookSubscription;
import com.nexus.estates.repository.WebhookSubscriptionRepository;
import com.nexus.estates.service.external.ExternalSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Motor central de envio de Webhooks.
 * Responsável por serializar, assinar e distribuir eventos para clientes externos.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookDispatcherService {

    private final WebhookSubscriptionRepository repository;
    private final ExternalSyncService externalSyncService;
    private final ObjectMapper objectMapper;

    /**
     * Envia notificações para todos os webhooks subscritos num evento.
     * É executado de forma assíncrona para não bloquear o fluxo principal.
     *
     * @param event O nome do evento (ex: "booking.created")
     * @param payload O objeto de dados a enviar
     */
    @Async
    public void dispatch(String event, Object payload) {
        log.debug("A procurar subscrições para o evento: {}", event);

        List<WebhookSubscription> subscriptions = repository.findBySubscribedEventsContainingAndIsActiveTrue(event);

        if (subscriptions.isEmpty()) {
            log.debug("Nenhum webhook ativo encontrado para o evento: {}", event);
            return;
        }

        try {
            // Serializa o payload uma única vez por evento para otimizar performance
            String jsonPayload = objectMapper.writeValueAsString(payload);

            // Dispara para todos os subscritores
            subscriptions.forEach(sub -> sendNotification(sub, event, jsonPayload));

        } catch (JsonProcessingException e) {
            log.error("Falha crítica ao serializar payload para o evento {}. Abortando dispatch.", event, e);
        }
    }

    private void sendNotification(WebhookSubscription sub, String event, String jsonPayload) {
        String deliveryId = UUID.randomUUID().toString();

        // 1. Assinar o payload exato que vai viajar na rede
        String signature = WebhookCryptoUtil.signPayload(jsonPayload, sub.getSecret());

        // 2. Configurar a chamada HTTP com os cabeçalhos de segurança do Nexus Estates
        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl(sub.getTargetUrl())
                .endpoint("") // O URL na base de dados já é absoluto
                .authType(ExternalApiConfig.AuthType.NONE)
                .customHeaders(Map.of(
                        "Content-Type", "application/json",
                        "X-Nexus-Signature", signature,
                        "X-Nexus-Event", event,
                        "X-Nexus-Delivery-Id", deliveryId
                ))
                .build();

        log.info("A disparar webhook [Evento: {}] para URL: {} (DeliveryId: {})", event, sub.getTargetUrl(), deliveryId);

        // 3. O ExternalSyncService aplica automaticamente Retries e Circuit Breaker
        // Enviamos a string jsonPayload diretamente para garantir que o corpo assinado é o que é enviado
        externalSyncService.postWithoutResponse(config, jsonPayload);
    }
}