package com.nexus.estates.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Configuração do cliente HTTP/HTTPS utilizado para comunicar com APIs externas
 * (ex.: Airbnb, Booking.com).
 * <p>
 * Utiliza o {@link RestClient} introduzido no Spring Framework 6 como substituto
 * moderno do {@code RestTemplate}, permitindo uma API fluente e integração
 * simplificada com codecs reativos e bibliotecas de resiliência.
 * </p>
 */
@Configuration
public class ExternalApiClientConfig {

    @Bean
    /**
     * Cria um cliente HTTP/HTTPS configurado com uma base URL para consumo de APIs externas.
     * <p>
     * Este bean é reutilizável em componentes que necessitem de comunicação com
     * provedores externos (ex.: Airbnb, Booking.com). A base URL pode ser parametrizada
     * via variável de ambiente/propriedade {@code external.api.base-url}.
     * </p>
     *
     * @param baseUrl URL base para todas as chamadas realizadas por este cliente
     * @return instância de {@link RestClient} pronta a utilizar
     * @see org.springframework.web.client.RestClient
     */
    public RestClient externalApiRestClient(@Value("${external.api.base-url:http://localhost}") String baseUrl) {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}
