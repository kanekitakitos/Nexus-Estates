package com.nexus.estates.audit;

import com.nexus.estates.dto.AuditRevisionEntity;
import org.hibernate.envers.RevisionListener;

public class AuditRevisionListener implements RevisionListener {
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
