package com.nexus.estates.entity;

import jakarta.persistence.*;
import java.util.UUID;

/**
 * Entidade que representa as permissões de acesso às propriedades.
 *
 * <p>Esta classe mapeia a tabela de associação entre utilizadores e propriedades,
 * definindo os privilégios específicos que cada utilizador possui sobre um imóvel.</p>
 *
 * <p>Exemplos de níveis de acesso:</p>
 * <ul>
 * <li>OWNER: Dono principal com controlo total</li>
 * <li>MANAGER: Gestores com permissões de edição</li>
 * <li>STAFF: Staff operacional para manutenção e visualização</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-12
 */
@Entity
@Table(name = "property_permissions")
public class PropertyPermission {

    /** Identificador único da permissão (Chave Primária). */
    @Id
    @GeneratedValue
    private UUID id;

    /** Identificador da propriedade à qual a permissão se refere. */
    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    /** Identificador do utilizador que detém a permissão. */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /** Nível de acesso atribuído (ex: READ, WRITE, ADMIN). */
    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", nullable = false)
    private AccessLevel accessLevel;

    /**
     * @return o identificador único da permissão
     */
    public UUID getId() {
        return id;
    }

    /**
     * @param id novo identificador para a permissão
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * @return o ID da propriedade associada
     */
    public UUID getPropertyId() {
        return propertyId;
    }

    /**
     * @param propertyId novo ID da propriedade
     */
    public void setPropertyId(UUID propertyId) {
        this.propertyId = propertyId;
    }

    /**
     * @return o ID do utilizador associado
     */
    public UUID getUserId() {
        return userId;
    }

    /**
     * @param userId novo ID do utilizador
     */
    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    /**
     * @return o nível de acesso atual
     */
    public AccessLevel getAccessLevel() {
        return accessLevel;
    }

    /**
     * @param accessLevel novo nível de acesso a definir
     */
    public void setAccessLevel(AccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }
}