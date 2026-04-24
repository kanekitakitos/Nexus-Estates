package com.nexus.estates.audit;

import com.nexus.estates.entity.AuditRevisionEntity;
import com.nexus.estates.entity.User;
import jakarta.persistence.Table;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RevisionEntity;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserEnversAuditTest {
    @Test
    void userEntityIsAudited() {
        assertTrue(User.class.isAnnotationPresent(Audited.class));
    }

    @Test
    void revisionEntityIsConfigured() {
        assertTrue(AuditRevisionEntity.class.isAnnotationPresent(RevisionEntity.class));
        Table table = AuditRevisionEntity.class.getAnnotation(Table.class);
        assertNotNull(table);
        assertEquals("revinfo", table.name());
    }

    @Test
    void revisionListenerWritesActorIntoRevisionEntity() {
        ActorContext.set(new ActorContext.Actor(77L, "admin@test.com"));
        try {
            AuditRevisionEntity rev = new AuditRevisionEntity();
            new AuditRevisionListener().newRevision(rev);
            assertEquals(77L, rev.getActorUserId());
            assertEquals("admin@test.com", rev.getActorEmail());
        } finally {
            ActorContext.clear();
        }
    }
}
