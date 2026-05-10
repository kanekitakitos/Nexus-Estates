package com.nexus.estates.repository;

import com.nexus.estates.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para eventos processados (idempotência).
 *
 * <p>
 *     Utilizado primordialmente no processamento de webhooks de parceiros externos (como o Stripe)
 *     Garante que um mesmo evento (notificação assíncrona) não é processado duas vezes,
 *     evitando assim efeitos colaterais críticos como dupla faturação ou duplos reembolsos
 * </p>
 *
 * @auhtor Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, Long> {
}
