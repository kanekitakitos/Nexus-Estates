package com.nexus.estates.client;

import org.springframework.stereotype.Component;

/**
 * Fachada/Proxy para agrupar clientes HTTP internos utilizados pelo finance-service.
 *
 * <p>Permite injeção única e facilita testes ao centralizar dependências externas.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
@Component
public record Proxy(
        NexusClients.BookingClient bookingClient
) {}
