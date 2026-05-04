package com.nexus.estates.client;

import org.springframework.stereotype.Component;

/**
 * Componente <i>Facade</i> imutável responsável por agrupar e expor os clientes HTTP externos.
 * <p>
 * Atua como um ponto único de injeção para os serviços de domínio, facilitando o acesso
 * às ‘interfaces’ de comunicação definida em {@link NexusClients}.
 * </p>
 *@param propertyClient Cliente HTTP declarativo para obter cotações e regras do property-service
 *@param userClient     Cliente HTTP declarativo para obter dados (ex: email) do user-service
 *@param financeClient  Cliente HTTP declarativo para delegar orquestração financeira ao finance-service
 * @author Nexus Estates Team
 * @version 1.0
 */
@Component
public record Proxy(
        NexusClients.PropertyClient propertyClient,
        NexusClients.UserClient userClient,
        NexusClients.FinanceClient financeClient
) {}
