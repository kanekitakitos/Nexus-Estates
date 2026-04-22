package com.nexus.estates.audit;

import com.nexus.estates.entity.Property;
import jakarta.persistence.Table;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RevisionEntity;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PropertyEnversAuditTest {
    @Test
    void propertyEntityIsAudited() {
        assertTrue(Property.class.isAnnotationPresent(Audited.class));
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
        ActorContext.set(new ActorContext.Actor(99L, "audit@test.com"));
        try {
            AuditRevisionEntity rev = new AuditRevisionEntity();
            new AuditRevisionListener().newRevision(rev);
            assertEquals(99L, rev.getActorUserId());
            assertEquals("audit@test.com", rev.getActorEmail());
        } finally {
            ActorContext.clear();
        }
    }
}
