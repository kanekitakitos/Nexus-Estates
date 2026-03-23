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
     * Bean principal do RestClient utilizado pelo sistema de sincronização.
     * <p>
     * Este cliente é configurado uma única vez para ser reutilizado por todos os serviços,
     * evitando a criação excessiva de instâncias e fugas de memória (memory leaks),
     * conforme as boas práticas de arquitetura para sistemas de alta performance.
     * </p>
     *
     * @param builder Builder auto-configurado pelo Spring Boot.
     * @return Uma instância thread-safe de RestClient.
     */
    @Bean
    public RestClient externalApiRestClient(RestClient.Builder builder) {
        return builder.build();
    }

    /**
     * Factory para criar instâncias de RestClient dinamicamente para cenários isolados.
     * <p>
     * <b>Atenção:</b> Deve ser usado com cautela para não criar novas instâncias a cada request.
     * Ideal para inicializar integrações específicas no arranque do sistema.
     * </p>
     *
     * @return Uma Function que aceita parâmetros de configuração e devolve um RestClient.
     */
    public Function<Map<String, Object>, RestClient> dynamicRestClientFactory() {
        return params -> {
            String baseUrl = (String) params.getOrDefault("baseUrl", "http://localhost:8080");
            @SuppressWarnings("unchecked")
            Map<String, String> headers = (Map<String, String>) params.getOrDefault("headers", Map.of());

            return RestClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeaders(h -> headers.forEach(h::add))
                    .build();
        };
    }
}