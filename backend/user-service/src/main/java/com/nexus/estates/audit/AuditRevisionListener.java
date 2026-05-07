package com.nexus.estates.audit;

import com.nexus.estates.entity.AuditRevisionEntity;
import org.hibernate.envers.RevisionListener;

/**
 * Listener de revisão customizado para o Hibernate Envers
 * <p>
 *     Este componente é invocado automaticamente pelo Envers sempre que uma nova revisão (registo de auditoria) é criada
 *     Ele recupera a identidade guardada no {@link ActorContext} e injeta-a na entidade de revisão, permitindo saber
 *     exatamente qual o utilizador que realizou cada alteração
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public class AuditRevisionListener implements RevisionListener {

    /**
     * Callback invocado pelo hibernate Envers para configurar a nova revisão
     * @param revisionEntity A entidade de revisão a ser preenchida
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
