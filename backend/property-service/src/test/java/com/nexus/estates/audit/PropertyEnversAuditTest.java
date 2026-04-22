package com.nexus.estates.audit;

import com.nexus.estates.entity.Property;
import com.nexus.estates.repository.PropertyRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import jakarta.persistence.EntityManager;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class PropertyEnversAuditTest {
    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private EntityManager entityManager;

    @AfterEach
    void cleanup() {
        ActorContext.clear();
    }

    @Test
    void updateCreatesAuditRevisionWithActor() {
        ActorContext.set(new ActorContext.Actor(99L, "audit@test.com"));

        Property p = new Property();
        p.setName("A");
        p.setLocation("L");
        p.setCity("C");
        p.setAddress("ADDR");
        p.setBasePrice(new BigDecimal("100.00"));
        p.setMaxGuests(2);
        p.setIsActive(true);

        Property saved = propertyRepository.saveAndFlush(p);

        saved.setName("B");
        propertyRepository.saveAndFlush(saved);

        Long auditCount = ((Number) entityManager.createNativeQuery("select count(*) from properties_AUD").getSingleResult()).longValue();
        Long revCount = ((Number) entityManager.createNativeQuery("select count(*) from revinfo").getSingleResult()).longValue();
        Long actorRevCount = ((Number) entityManager.createNativeQuery("select count(*) from revinfo where actor_user_id = 99").getSingleResult()).longValue();

        assertTrue(auditCount >= 2);
        assertTrue(revCount >= 2);
        assertTrue(actorRevCount >= 1);
    }
}
