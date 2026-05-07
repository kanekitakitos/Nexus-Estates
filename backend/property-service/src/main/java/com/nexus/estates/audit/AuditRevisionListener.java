package com.nexus.estates.audit;

import com.nexus.estates.dto.AuditRevisionEntity;
import org.hibernate.envers.RevisionListener;

/**
 * Listener de revisão para o Hibernate Envers
 * <p>
 *     Esta classe é invocada automaticamente pelo Hibernate sempre que uma nova revisão (registo de auditoria) é criada
 *     Ela extrai o ID do utilizador do {@link ActorContext} e preenche a entidade de revisão personaliazda,
 *     garantindo que cada "foto" das alterações tenha um autor associado
 * </p>
 * @author Nexus Estates Team
 * @version 1.0
 */
public class AuditRevisionListener implements RevisionListener {

    /**
     * Método de callback invocado automaticamente pelo Hibernate Envers antes de persistir uma nova revisão
     * @param revisionEntity A entidade de revisão recém-criada (que será do tipo {@link AuditRevisionEntity})
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
