package com.nexus.estates.dto;

import com.nexus.estates.audit.AuditRevisionListener;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.hibernate.envers.DefaultTrackingModifiedEntitiesRevisionEntity;
import org.hibernate.envers.RevisionEntity;

/**
 * Entidade de auditoria customizada para o hibernate Envers
 * <p>
 *     Estende a entidade de revisão padrão para incluir informações sobre o "Ator
 *     (o utilziador que realizou a lateração). Isto garante que todas as modificações no sistema
 *     tenham um rasto de auditoria compelto ("Quem", "Quando"e "O quê")
 * </p>
 */
@Entity
@Table(name = "revinfo")
@RevisionEntity(AuditRevisionListener.class)
public class AuditRevisionEntity extends DefaultTrackingModifiedEntitiesRevisionEntity {
    @Column(name = "actor_user_id")
    private Long actorUserId;

    @Column(name = "actor_email")
    private String actorEmail;

    /**
     * @return O identificador úncio do utilziador que provocou a alteração
     */
    public Long getActorUserId() {
        return actorUserId;
    }

    /**
     * @param actorUserId O identificador do utilziador a associar a esta revisão
     */
    public void setActorUserId(Long actorUserId) {
        this.actorUserId = actorUserId;
    }

    /**
     * @return O email do utilizador que provocou a alteração
     */
    public String getActorEmail() {
        return actorEmail;
    }

    /**
     * @param actorEmail O email do utilziador a associar esta revisão
     */
    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }
}
