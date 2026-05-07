package com.nexus.estates.repository;
import com.nexus.estates.entity.WebhookSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


/**
 * Repositório Spring Data JPA para a gestão das subscrições de Webhooks
 * <p>
 *     Permite consultar os URLs externos registados pelos utilizadores e filtrar quais os
 *     webhooks ativos que devem ser notificados quando ocoore um evento específico no sistema
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public interface WebhookSubscriptionRepository extends JpaRepository<WebhookSubscription, Long>
{

    /**
     * Recupera o catálogo completo de webhooks registados por um utilizador,
     * independentemente do seu estado (ativo ou inativo)
     * @param userId O ID do utilizasor (porprietário/cliente)
     * @return Lista de subscrições associadas ao utilizador
     */
    List<WebhookSubscription> findByUserId(Long userId);


    /**
     * Procura todas as subscrições de webhook ativas que estejam registadas para escurtar um evento específico
     * <p>
     *     Utilizado pelo motor de dispatch assíncrono para saber a quem enviar o payload HTTP POST
     *     sempre que o RabbitMQ processa um novo evento
     * </p>
     * @param event A chave do evento a procurar
     * @return Lista de webhooks ativos elegíveis para receber o evento
     */
    List<WebhookSubscription> findBySubscribedEventsContainingAndIsActiveTrue(String event);
}
