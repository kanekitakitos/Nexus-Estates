package com.nexus.estates.audit;

import com.nexus.estates.entity.User;
import com.nexus.estates.entity.UserRole;
import com.nexus.estates.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class UserEnversAuditTest {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @AfterEach
    void cleanup() {
        ActorContext.clear();
    }

    @Test
    void updateCreatesAuditRevisionWithActor() {
        ActorContext.set(new ActorContext.Actor(77L, "admin@test.com"));

        User u = new User();
        u.setEmail("u@test.com");
        u.setPassword("hash");
        u.setRole(UserRole.OWNER);
        u.setPhone(null);

        User saved = userRepository.saveAndFlush(u);

        saved.setPhone("+351900000000");
        userRepository.saveAndFlush(saved);

        Long auditCount = ((Number) entityManager.createNativeQuery("select count(*) from users_AUD").getSingleResult()).longValue();
        Long actorRevCount = ((Number) entityManager.createNativeQuery("select count(*) from revinfo where actor_user_id = 77").getSingleResult()).longValue();

        assertTrue(auditCount >= 2);
        assertTrue(actorRevCount >= 1);
    }
}
