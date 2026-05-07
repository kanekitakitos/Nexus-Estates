package com.nexus.estates.client;

import org.springframework.stereotype.Component;

/**
 * Componente <i>Facade</i> imutável responsável por agrupar e expor os clientes HTTP externos.
 * <p>
 * Atua como um ponto único de injeção para os serviços de domínio, facilitando o acesso
 * às ‘interfaces’ de comunicação definida em {@link NexusClients}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 */
@Component
public record Proxy(
        NexusClients.UserClient userClient,
        NexusClients.BookingClient bookingClient,
        NexusClients.PropertyClient propertyClient
) {}
