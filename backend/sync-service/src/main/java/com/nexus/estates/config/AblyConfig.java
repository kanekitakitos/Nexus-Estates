package com.nexus.estates.config;

import io.ably.lib.rest.AblyRest;
import io.ably.lib.types.AblyException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Classe de configuração responsável por inicializar o cliente Ably.
 * <p>
 * Esta classe configura o bean {@link AblyRest} que será utilizado para interagir
 * com a plataforma Ably. A chave da API é injetada a partir das propriedades da aplicação
 * ({@code application.properties}), garantindo que segredos não sejam expostos no código-fonte.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @see AblyRest
 * @see <a href="https://ably.com/docs/rest">Ably REST Client Documentation</a>
 */
@Configuration
public class AblyConfig {

    /**
     * Chave da API do Ably, injetada via propriedade {@code ably.api.key}.
     * <p>
     * Esta chave deve ser mantida em segredo e configurada através de variáveis de ambiente
     * ou arquivos de configuração seguros em produção.
     * </p>
     */
    @Value("${ably.api.key}")
    private String ablyApiKey;

    /**
     * Cria e configura o bean {@link AblyRest}.
     *
     * @return Uma instância configurada de {@link AblyRest} pronta para uso.
     * @throws AblyException Se ocorrer um erro ao inicializar o cliente Ably (ex: chave inválida).
     */
    @Bean
    public AblyRest ablyRest() throws AblyException {
        return new AblyRest(ablyApiKey);
    }
}
