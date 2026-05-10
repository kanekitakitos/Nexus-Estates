package com.nexus.estates.audit;

import com.nexus.estates.entity.AuditRevisionEntity;
import org.hibernate.envers.RevisionListener;


/**
 * Ouvinte (Listener) de criação de revisões para o Hibernate Envers
 * <p>
 *     Invocado automaticamente na camada de persistência sempre que ocorre uma transação
 *     que gera histórico de auditoria (INSERT, UPDATE ou DELETE). Atua como a "ponte" que
 *     recolhe a identidade do utilizador através do {@link ActorContext} e a associa
 *     à revisão da tabela de auditoria correspondente
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public class AuditRevisionListener implements RevisionListener {

    /**
     * Interceta a criação de uma nova entidade de revisão
     * @param revisionEntity A instância genérica da revisão criada pelo Envers
     */
    @Override
    public void newRevision(Object revisionEntity) {
        if (!(revisionEntity instanceof AuditRevisionEntity rev)) {
            return;
        }
        ActorContext.get().ifPresent(actor -> {
            rev.setActorUserId(actor.userId());
            rev.setActorEmail(actor.email());
        });
    }
}
