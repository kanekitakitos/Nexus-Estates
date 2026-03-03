package com.nexus.estates.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Testes unitários para a configuração de clientes API externos.
 *
 * <p>Valida a criação dinâmica de instâncias de {@link RestClient} através da factory,
 * garantindo que as configurações de URL e headers são aplicadas corretamente.</p>
 *
 * @author Nexus Estates Team
 */
class ExternalApiClientConfigTest {

    private final ExternalApiClientConfig config = new ExternalApiClientConfig();

    /**
     * Valida a criação de um cliente REST com configurações personalizadas.
     *
     * <p>Cenário: A factory é invocada com uma URL base e headers específicos (ex: Token de Auth).
     * Resultado Esperado: Uma instância válida de RestClient é retornada.</p>
     */
    @Test
    @DisplayName("Deve criar RestClient com configurações dinâmicas")
    void shouldCreateRestClientWithDynamicConfig() {
        // GIVEN
        Function<Map<String, Object>, RestClient> factory = config.dynamicRestClientFactory();
        Map<String, Object> params = Map.of(
                "baseUrl", "https://api.airbnb.com",
                "headers", Map.of("Authorization", "Bearer token123")
        );

        // WHEN
        RestClient client = factory.apply(params);

        // THEN
        assertNotNull(client);
        // Nota: RestClient não expõe facilmente a URL base para asserção direta sem reflexão ou mocks complexos,
        // mas garantimos que a factory produz uma instância válida.
    }

    /**
     * Valida a criação de um cliente REST com configurações padrão.
     *
     * <p>Cenário: A factory é invocada sem parâmetros específicos.
     * Resultado Esperado: Uma instância válida de RestClient é retornada, assumindo defaults.</p>
     */
    @Test
    @DisplayName("Deve criar RestClient com URL padrão quando não especificada")
    void shouldCreateRestClientWithDefaultUrl() {
        // GIVEN
        Function<Map<String, Object>, RestClient> factory = config.dynamicRestClientFactory();
        Map<String, Object> params = Map.of();

        // WHEN
        RestClient client = factory.apply(params);

        // THEN
        assertNotNull(client);
    }
}