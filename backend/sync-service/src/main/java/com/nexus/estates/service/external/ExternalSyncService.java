package com.nexus.estates.service.external;

import com.nexus.estates.dto.ExternalApiConfig;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Optional;

/**
 * Serviço de infraestrutura para comunicações externas resilientes.
 * <p>
 * Implementa os padrões de resiliência <b>Circuit Breaker</b> e <b>Retry</b> para garantir
 * que falhas em parceiros externos (Airbnb, Booking.com, Ably) não causem indisponibilidade
 * no ecossistema Nexus Estates.
 * </p>
 * <p>
 * Utiliza o {@code RestClient} do Spring 6 para chamadas eficientes e integra-se
 * com o {@code ExternalAuthService} para gestão segura de credenciais.
 * </p>
 *
 * @author Nexus Estates Architect
 * @version 2.0
 * @since 2026-03-31
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalSyncService {

    private final WebClient externalApiWebClient;
    private final ExternalAuthService authService;

    @Value("${external.api.timeout.request:5s}")
    private Duration requestTimeout;

    /**
     * Executa POST resiliente esperando um corpo de resposta.
     *
     * @param config   configuração de API externa
     * @param payload  corpo da requisição
     * @param respType tipo da resposta esperada
     * @param <T>      tipo genérico de resposta
     * @return Optional com resposta ou vazio em falha
     */
    @Retry(name = "externalApi", fallbackMethod = "fallbackGenericRequest")
    @CircuitBreaker(name = "externalApi")
    public <T> Optional<T> post(ExternalApiConfig config, Object payload, Class<T> respType) {
        log.info("Executando POST resiliente para: {}/{}", config.baseUrl(), config.endpoint());

        return externalApiWebClient.post()
                .uri(config.baseUrl() + config.endpoint())
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> authService.applyAuthentication(h, config))
                .bodyValue(payload)
                .exchangeToMono(response -> {
                    if (response.statusCode().is2xxSuccessful()) {
                        return response.bodyToMono(respType);
                    }
                    if (response.statusCode().is4xxClientError()) {
                        return Mono.empty();
                    }
                    return response.createException().flatMap(Mono::error);
                })
                .timeout(requestTimeout)
                .blockOptional();
    }

    /**
     * Executa POST resiliente sem esperar corpo de resposta.
     *
     * @param config  configuração de API externa
     * @param payload corpo da requisição
     * @return true em sucesso; false em fallback/falha
     */
    @Retry(name = "externalApi", fallbackMethod = "fallbackBodilessRequest")
    @CircuitBreaker(name = "externalApi")
    public boolean postWithoutResponse(ExternalApiConfig config, Object payload) {
        log.info("Executando POST (sem corpo) para: {}/{}", config.baseUrl(), config.endpoint());

        return externalApiWebClient.post()
                .uri(config.baseUrl() + config.endpoint())
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> authService.applyAuthentication(h, config))
                .bodyValue(payload)
                .exchangeToMono(response -> {
                    if (response.statusCode().is2xxSuccessful()) {
                        return Mono.just(true);
                    }
                    if (response.statusCode().is4xxClientError()) {
                        return Mono.just(false);
                    }
                    return response.createException().flatMap(Mono::error);
                })
                .timeout(requestTimeout)
                .blockOptional()
                .orElse(false);
    }

    /**
     * Fallback para POST com resposta.
     */
    private <T> Optional<T> fallbackGenericRequest(ExternalApiConfig config, Object payload, Class<T> respType, Throwable ex) {
        log.error("Circuit Breaker ou Retry falhou para {}. Motivo: {}", config.baseUrl(), ex.getMessage());
        return Optional.empty();
    }

    /**
     * Fallback para POST sem resposta.
     */
    private boolean fallbackBodilessRequest(ExternalApiConfig config, Object payload, Throwable ex) {
        log.error("Falha crítica ao enviar dados para {}: {}", config.baseUrl(), ex.getMessage());
        return false;
    }
}
