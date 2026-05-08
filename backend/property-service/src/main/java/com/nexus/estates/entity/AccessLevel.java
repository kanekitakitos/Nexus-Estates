package com.nexus.estates.entity;

/**
 * Define os níveis de acesso de utilizadores sobre uma propriedade.
 *
 * PRIMARY_OWNER → Controlo total
 * MANAGER       → Gestão operacional
 * STAFF         → Acesso limitado
 *
 * @author Nexus Estates Team
 */
public enum AccessLevel {
    PRIMARY_OWNER,
    MANAGER,
    STAFF
}
