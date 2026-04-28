package com.nexus.estates.entity;

/**
 * Enumeração dos fornecedores externos suportados para integrações.
 * <p>
 * Utilizada para identificar de forma tipada os canais de distribuição
 * (ex: Airbnb, Booking) nas credenciais guardadas pelo proprietário.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 */
public enum ExternalProviderName {
    AIRBNB,
    BOOKING,
    VRBO,
    EXPEDIA
}
