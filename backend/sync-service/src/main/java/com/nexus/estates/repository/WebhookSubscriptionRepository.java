package com.nexus.estates.repository;
import com.nexus.estates.entity.WebhookSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório Spring Data JPA para a entidade {@link WebhookSubscription}
 * <p>
 *     Responsável por gerir a persistência das subscrições de webhooks configuradas
 *     pelos utilizadores. Este repositório suporta a gestão destas integrações (UI)
 *     e fornece as consultas necessárias ao motor de disparo (Dispatcher) para notificar
 *     sistemas externos sobre eventos da plataforma
 * </p>
 *
 * @auhthor Nexus Estates Team
 * @version 1.0
 */
public interface WebhookSubscriptionRepository extends JpaRepository<WebhookSubscription, Long>
{

    /**
     * Recupera a lista de todas as subscrições de webhooks configuradas por um utilizador
     * <p>
     *     Utilizado primordialmente para listar as integrações ativas no painel de controlo
     *     (dashboard) ou área de definições do utilizador
     * </p>
     * @param userId O identificador único do utilizador proprietário dos webhooks
     * @return Uma lista contendo as subscrições do utilizador, ou uma lista vazia se não existirem
     */
    List<WebhookSubscription> findByUserId(Long userId);


    /**
     * Recupera uma subscrição específica garantindo que pertence ao utilizador solicitado
     * @param id O identificador único da subscrição do webhook
     * @param userId O identificador único do utilizador que efetua o pedido
     * @return Um {@link Optional} contendo o webhook se este existir e pertencer de facto ao utilizador
     */
    Optional<WebhookSubscription> findByIdAndUserId(Long id, Long userId);

    // Procura todos os webhooks ativos que subscreveram um evento específico

    /**
     * Procura todas as subscrições ativas que estejam registadas para escutar um evento específico
     * @param event A string representativa do evento/tópico disparado pelo sistema
     * @return Uma lista de subscrições ativas e elegíveis para receber a notificação
     */
    List<WebhookSubscription> findBySubscribedEventsContainingAndIsActiveTrue(String event);
}
