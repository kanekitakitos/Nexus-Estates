package com.nexus.estates.repository;
import com.nexus.estates.entity.WebhookSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WebhookSubscriptionRepository extends JpaRepository<WebhookSubscription, Long>
{

    List<WebhookSubscription> findByUserId(Long userId);

    Optional<WebhookSubscription> findByIdAndUserId(Long id, Long userId);

    // Procura todos os webhooks ativos que subscreveram um evento específico
    List<WebhookSubscription> findBySubscribedEventsContainingAndIsActiveTrue(String event);
}
