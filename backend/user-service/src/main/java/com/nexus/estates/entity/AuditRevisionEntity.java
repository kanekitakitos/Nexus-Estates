package com.nexus.estates.entity;

import com.nexus.estates.audit.AuditRevisionListener;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.hibernate.envers.DefaultTrackingModifiedEntitiesRevisionEntity;
import org.hibernate.envers.RevisionEntity;

/**
 * Entidade de Revisão Customizada para o Hibernate Envers
 * <p>
 *     Estende a entidade de revisão padrão do Envers para guardar informações adicionais
 *     sobre o contexto da transação, nomeadamente a identidade do utilizador (Ator)
 *     que efetuou a alteração. Isto permite responder não só "o que mudou?" e "quando?" mas tabmém "quem mudou?"
 * </p>
 *
 * @auhtor Nexus Estates Team
 * version 1.0
 */
@Entity
@Table(name = "revinfo")
@RevisionEntity(AuditRevisionListener.class)
@AttributeOverrides({
        @AttributeOverride(name = "id", column = @Column(name = "rev")),
        @AttributeOverride(name = "timestamp", column = @Column(name = "revtstmp"))
})
public class AuditRevisionEntity extends DefaultTrackingModifiedEntitiesRevisionEntity {

    /**
     * O identificador úncio do utilizador que realizou a ação auditada
     */
    @Column(name = "actor_user_id")
    private Long actorUserId;

    /**
     * O endereço de email do utilizador no momento em que a ação foi realizada
     */
    @Column(name = "actor_email")
    private String actorEmail;


    /**
     * Obtém o ID do utilizador responsável pela alteração nesta revisão
     * @return O identificador numérico do utilizador
     */
    public Long getActorUserId() {
        return actorUserId;
    }


    /**
     * Define o ID do utilizador para o registo de auditoria
     * @param actorUserId O identificador numérico do utilizador ativo
     */
    public void setActorUserId(Long actorUserId) {
        this.actorUserId = actorUserId;
    }


    /**
     * Obtém o email do utilizador associado a esta alteração
     * @return O endereço de email do utilizador no momento da revisão
     */
    public String getActorEmail() {
        return actorEmail;
    }


    /**
     * Define o email do utilizador para o registo de auditoria
     * @param actorEmail O endereço de email do utilizador ativo
     */
    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }
}
