package com.nexus.estates.service;

import com.nexus.estates.dto.ExternalApiConfig;
import com.nexus.estates.service.external.ExternalAuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ExternalAuthServiceTest {

    private final ExternalAuthService authService = new ExternalAuthService();

    @Test
    @DisplayName("Deve aplicar Bearer Auth corretamente")
    void shouldApplyBearerAuth() {
        ExternalApiConfig config = ExternalApiConfig.builder()
                .authType(ExternalApiConfig.AuthType.BEARER)
                .credentials("my-token")
                .build();
        
        HttpHeaders headers = new HttpHeaders();
        authService.applyAuthentication(headers, config);

        assertThat(headers.getFirst(HttpHeaders.AUTHORIZATION)).isEqualTo("Bearer my-token");
    }

    @Test
    @DisplayName("Deve aplicar Basic Auth corretamente")
    void shouldApplyBasicAuth() {
        String credentials = "user:pass";
        String expectedEncoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        
        ExternalApiConfig config = ExternalApiConfig.builder()
                .authType(ExternalApiConfig.AuthType.BASIC)
                .credentials(credentials)
                .build();
        
        HttpHeaders headers = new HttpHeaders();
        authService.applyAuthentication(headers, config);

        assertThat(headers.getFirst(HttpHeaders.AUTHORIZATION)).isEqualTo("Basic " + expectedEncoded);
    }

    @Test
    @DisplayName("Deve aplicar API Key corretamente")
    void shouldApplyApiKey() {
        ExternalApiConfig config = ExternalApiConfig.builder()
                .authType(ExternalApiConfig.AuthType.API_KEY)
                .credentials("my-api-key")
                .build();
        
        HttpHeaders headers = new HttpHeaders();
        authService.applyAuthentication(headers, config);

        assertThat(headers.getFirst("X-API-Key")).isEqualTo("my-api-key");
    }

    @Test
    @DisplayName("Deve aplicar headers customizados")
    void shouldApplyCustomHeaders() {
        ExternalApiConfig config = ExternalApiConfig.builder()
                .authType(ExternalApiConfig.AuthType.NONE)
                .customHeaders(Map.of("X-Custom", "Value"))
                .build();
        
        HttpHeaders headers = new HttpHeaders();
        authService.applyAuthentication(headers, config);

        assertThat(headers.getFirst("X-Custom")).isEqualTo("Value");
    }
}
