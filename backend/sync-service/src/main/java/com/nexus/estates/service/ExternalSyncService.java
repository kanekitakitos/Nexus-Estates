package com.nexus.estates.service;

import com.nexus.estates.dto.ExternalApiConfig;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

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
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalSyncService {

    private final RestClient externalApiRestClient;
    private final ExternalAuthService authService;

    /**
     * Executa uma requisição HTTP POST para um serviço externo com proteção de resiliência.
     * <p>
     * Se a chamada falhar repetidamente ou se o circuito estiver aberto, o método
     * retorna um {@code Optional.empty()} em vez de propagar uma exceção.
     * </p>
     *
     * @param config   Configurações da API (Base URL, Endpoint, Auth).
     * @param payload  Objeto a ser enviado no corpo da requisição (JSON).
     * @param respType Classe do tipo de resposta esperada para o mapeamento.
     * @param <T>      Tipo genérico do objeto de resposta.
     * @return {@code Optional<T>} com o resultado se bem-sucedido; {@code Optional.empty()} caso contrário.
     */
    @Retry(name = "externalApi", fallbackMethod = "fallbackGenericRequest")
    @CircuitBreaker(name = "externalApi")
    public <T> Optional<T> post(ExternalApiConfig config, Object payload, Class<T> respType) {
        log.info("Executando POST resiliente para: {}/{}", config.baseUrl(), config.endpoint());

        T response = externalApiRestClient.post()
                .uri(config.baseUrl() + config.endpoint())
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> authService.applyAuthentication(h, config))
                .body(payload)
                .retrieve()
                .body(respType);

        return Optional.ofNullable(response);
    }

    /**
     * Versão simplificada do POST que não espera corpo de resposta (204 No Content ou similar).
     *
     * @param config  Configuração da API.
     * @param payload Objeto a ser enviado.
     * @return true se a requisição foi bem-sucedida, false se falhou após retries/circuit breaker.
     */
    @Retry(name = "externalApi", fallbackMethod = "fallbackBodilessRequest")
    @CircuitBreaker(name = "externalApi")
    public boolean postWithoutResponse(ExternalApiConfig config, Object payload) {
        log.info("Executando POST (sem corpo) para: {}/{}", config.baseUrl(), config.endpoint());

        externalApiRestClient.post()
                .uri(config.baseUrl() + config.endpoint())
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> authService.applyAuthentication(h, config))
                .body(payload)
                .retrieve()
                .toBodilessEntity();

        return true;
    }

    /**
     * Método de Fallback para requisições que esperam um corpo de resposta.
     * <p>
     * Invocado quando o Circuit Breaker está aberto ou após todas as tentativas de
     * Retry falharem. Regista o erro e retorna um {@code Optional.empty()}.
     * </p>
     *
     * @param config   A configuração original da requisição.
     * @param payload  O payload que falhou ao ser enviado.
     * @param respType O tipo de resposta esperado.
     * @param ex       A exceção que originou a falha.
     * @param <T>      Tipo genérico da resposta.
     * @return {@code Optional.empty()} indicando falha na operação.
     */
    private <T> Optional<T> fallbackGenericRequest(ExternalApiConfig config, Object payload, Class<T> respType, Throwable ex) {
        log.error("Circuit Breaker ou Retry falhou para {}. Motivo: {}", config.baseUrl(), ex.getMessage());
        return Optional.empty();
    }

    /**
     * Método de Fallback para requisições sem corpo de resposta.
     * <p>
     * Semelhante ao {@link #fallbackGenericRequest}, mas adaptado para métodos
     * que retornam um booleano de sucesso.
     * </p>
     *
     * @param config  A configuração original da requisição.
     * @param payload O payload que falhou ao ser enviado.
     * @param ex      A exceção que originou a falha.
     * @return {@code false} indicando que a operação falhou.
     */
    private boolean fallbackBodilessRequest(ExternalApiConfig config, Object payload, Throwable ex) {
        log.error("Falha crítica ao enviar dados para {}: {}", config.baseUrl(), ex.getMessage());
        return false;
    }
}
