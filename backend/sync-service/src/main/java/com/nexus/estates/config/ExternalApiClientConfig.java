package com.nexus.estates.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.function.Function;

/**
 * Configuração do cliente HTTP/HTTPS utilizado para comunicar com APIs externas
 * (ex.: Airbnb, Booking.com).
 * <p>
 * Utiliza o {@link RestClient} introduzido no Spring Framework 6 como substituto
 * moderno do {@code RestTemplate}, permitindo uma API fluente e integração
 * simplificada com codecs reativos e bibliotecas de resiliência.
 * </p>
 * <p>
 * Refatorado para suportar criação dinâmica de clientes com base em configurações
 * fornecidas em tempo de execução, permitindo integração com múltiplas OTAs.
 * </p>
 */
@Configuration
public class ExternalApiClientConfig {

    /**
     * Factory para criar clientes REST dinamicamente.
     * <p>
     * Permite instanciar um RestClient configurado com base URL e headers específicos
     * para cada integração (ex: Airbnb vs Booking).
     * </p>
     *
     * @return Function que aceita um mapa de configurações (url, headers) e retorna um RestClient.
     */
    @Bean
    public Function<Map<String, Object>, RestClient> dynamicRestClientFactory() {
        return config -> {
            String baseUrl = (String) config.getOrDefault("baseUrl", "http://localhost");
            @SuppressWarnings("unchecked")
            Map<String, String> headers = (Map<String, String>) config.get("headers");

            RestClient.Builder builder = RestClient.builder()
                    .baseUrl(baseUrl);

            if (headers != null) {
                builder.defaultHeaders(httpHeaders -> 
                    headers.forEach(httpHeaders::add)
                );
            }

            return builder.build();
        };
    }
}