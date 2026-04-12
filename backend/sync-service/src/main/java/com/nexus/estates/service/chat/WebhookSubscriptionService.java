package com.nexus.estates.service.chat;

import com.nexus.estates.common.util.WebhookCryptoUtil;
import com.nexus.estates.dto.WebhookSubscriptionDTO;
import com.nexus.estates.entity.WebhookSubscription;
import com.nexus.estates.repository.WebhookSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Serviço responsável por gerir o ciclo de vida das subscrições de Webhooks (CRUD).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookSubscriptionService {

    private final WebhookSubscriptionRepository repository;

    /**
     * Cria uma nova subscrição de webhook para um utilizador.
     * Gera um segredo criptográfico único no momento da criação.
     */
    @Transactional
    public WebhookSubscriptionDTO.CreatedResponse createSubscription(Long userId, WebhookSubscriptionDTO.CreateRequest request) {
        log.info("A criar nova subscrição de webhook para o utilizador: {}", userId);

        String secret = WebhookCryptoUtil.generateSecret();
        String eventsCsv = String.join(",", request.subscribedEvents());

        WebhookSubscription entity = WebhookSubscription.builder()
                .userId(userId)
                .targetUrl(request.targetUrl())
                .secret(secret)
                .isActive(true)
                .subscribedEvents(eventsCsv)
                .build();

        WebhookSubscription saved = repository.save(entity);

        return WebhookSubscriptionDTO.CreatedResponse.fromEntity(saved, secret);
    }

    /**
     * Lista todas as subscrições de um utilizador.
     * O segredo é propositadamente omitido na resposta.
     */
    @Transactional(readOnly = true)
    public List<WebhookSubscriptionDTO.Response> getUserSubscriptions(Long userId) {
        return repository.findByUserId(userId).stream()
                .map(WebhookSubscriptionDTO.Response::fromEntity)
                .toList();
    }

    /**
     * Alterna o estado de um webhook (Ativo / Inativo).
     */
    @Transactional
    public void toggleSubscription(Long userId, Long subscriptionId) {
        WebhookSubscription subscription = getSubscriptionIfOwner(userId, subscriptionId);
        subscription.setActive(!subscription.isActive());
        repository.save(subscription);
        log.info("Estado do webhook {} alterado para: {}", subscriptionId, subscription.isActive());
    }

    /**
     * Remove uma subscrição permanentemente.
     */
    @Transactional
    public void deleteSubscription(Long userId, Long subscriptionId) {
        WebhookSubscription subscription = getSubscriptionIfOwner(userId, subscriptionId);
        repository.delete(subscription);
        log.info("Webhook {} eliminado pelo utilizador {}", subscriptionId, userId);
    }

    // --- MÉTODOS AUXILIARES PRIVADOS ---

    private WebhookSubscription getSubscriptionIfOwner(Long userId, Long subscriptionId) {
        return repository.findById(subscriptionId)
                .filter(sub -> sub.getUserId() == userId)
                .orElseThrow(() -> new IllegalArgumentException("Webhook não encontrado ou acesso negado."));
    }

}