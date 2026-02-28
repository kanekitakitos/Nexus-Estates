package com.nexus.estates.client;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;

import java.math.BigDecimal;

/**
 * Definição centralizada das interfaces de comunicação HTTP com microsserviços externos.
 * <p>
 * Esta classe utiliza o recurso de <i>Declarative HTTP Clients</i> do Spring 6.
 * O ‘framework’ emprega o <b>Proxy Pattern</b> para gerar dinamicamente,
 * em tempo de execução, a implementação concreta destas ‘interfaces’, abstraindo a complexidade
 * das chamadas rede (REST).
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public interface NexusClients {


    /**
     * Cliente responsável pela comunicação com o serviço de Propriedades.
     */
    interface PropertyClient {

        /**
         * Obtém o preço atual de uma propriedade.
         * <p>
         * A implementação deste método é provida via Proxy pelo Spring Boot.
         * </p>
         *
         * @param id Identificador único da propriedade.
         * @return O preço da propriedade (BigDecimal).
         */
        @GetExchange("/api/properties/{id}/price")
        BigDecimal getPropertyPrice(@PathVariable Long id);

    }

    interface UserClient {

        /**
         * Obtém o e-mail de um utilizador específico.
         *
         * @param id Identificador único do utilizador.
         * @return O endereço de e-mail do utilizador.
         */
        @GetExchange("/api/users/{id}")
        String getUserEmail(@PathVariable("id") Long id);
    }
}
