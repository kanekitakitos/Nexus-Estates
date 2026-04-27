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
 * Motor central de envio (dispatch) de notificações Webhook.
 * <p>
 * Este serviço atua como o core broker responsável por:
 * <ul>
 * <li>Pesquisar subscrições ativas baseadas em eventos de domínio;</li>
 * <li>Serializar payloads de objetos Java em formato JSON, otimizando o processo realizando-o uma única vez por evento;</li>
 * <li>Assinar criptograficamente cada payload (usando o utilitário partilhado) com os segredos dos subscritores para garantir a integridade;</li>
 * <li>Distribuir os eventos através do {@link ExternalSyncService}, que trata de retries e circuit-breakers de forma assíncrona.</li>
 * </ul>
 * </p>
 * <p>
 * Funciona inteiramente em background ({@code @Async}), garantindo que o fluxo transacional principal
 * (como a criação de uma reserva) não é bloqueado enquanto aguarda as chamadas HTTP externas.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2023-11-01
 * @see com.nexus.estates.common.util.WebhookCryptoUtil
 * @see com.nexus.estates.service.external.ExternalSyncService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookDispatcherService {

    private final WebhookSubscriptionRepository repository;
    private final ExternalSyncService externalSyncService;
    private final ObjectMapper objectMapper;

    /**
     * Ponto de entrada para o envio de notificações de webhook para todos os subscritores de um dado evento.
     * Executado num contexto assíncrono para garantir o isolamento entre o domínio e as chamadas externas.
     *
     * @param event O nome qualificado do evento a notificar. Exemplos: "booking.created", "booking.status.updated".
     * @param payload O objeto contendo os dados do evento, o qual será serializado para JSON e enviado.
     */
    @Async
    public void dispatch(String event, Object payload) {
        log.debug("A procurar subscrições para o evento: {}", event);

        // Busca ativa apenas para subscrições que escutam este evento
        List<WebhookSubscription> subscriptions = repository.findBySubscribedEventsContainingAndIsActiveTrue(event);

        if (subscriptions.isEmpty()) {
            log.debug("Nenhum webhook ativo encontrado para o evento: {}", event);
            return;
        }

        try {
            // Serializa o payload uma única vez para optimizar performance e evitar múltiplos processos desnecessários
            String jsonPayload = objectMapper.writeValueAsString(payload);

            // Dispara para todos os subscritores de forma individual
            subscriptions.forEach(sub -> sendNotification(sub, event, jsonPayload));

        } catch (JsonProcessingException e) {
            log.error("Falha crítica ao serializar payload para o evento {}. Abortando dispatch.", event, e);
        }
    }

    /**
     * Envia uma notificação de webhook individual para um subscritor específico.
     * Gera os metadados necessários, assina o payload, configura os cabeçalhos do protocolo Nexus
     * e efetua o pedido POST ao URL de destino do cliente.
     *
     * @param sub A entidade {@link WebhookSubscription} contendo as configurações de envio.
     * @param event O nome do evento que espoletou a notificação.
     * @param jsonPayload O payload previamente serializado para enviar no corpo da requisição HTTP.
     */
    private void sendNotification(WebhookSubscription sub, String event, String jsonPayload) {
        // ID único para rastrear e debugar a entrega específica desta notificação
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

        // 3. O ExternalSyncService aplica automaticamente Retries e Circuit Breaker.
        // O corpo envia-se pré-serializado (String jsonPayload) garantindo que a assinatura coincide perfeitamente com a hash enviada.
        externalSyncService.postWithoutResponse(config, jsonPayload);
    }
}