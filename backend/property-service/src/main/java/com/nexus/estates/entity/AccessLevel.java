package com.nexus.estates.entity;

/**
 * Define os níveis de acesso de utilizadores sobre uma propriedade.
 *
 * PRIMARY_OWNER → Controlo total
 * MANAGER       → Gestão operacional
 * STAFF         → Acesso limitado
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public enum AccessLevel {
    PRIMARY_OWNER,
    MANAGER,
    STAFF
}
