package com.nexus.estates.service;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.dto.ExternalApiConfig;
import com.nexus.estates.service.booking.BookingSyncService;
import com.nexus.estates.service.external.ExternalSyncService;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.io.IOException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.NONE,
        properties = "spring.jpa.hibernate.ddl-auto=create-drop"
)
@ActiveProfiles("test")
class ExternalSyncServiceIT {

    private static MockWebServer server;

    @Autowired
    private ExternalSyncService externalSyncService;

    @Autowired
    private BookingSyncService bookingSyncService;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @AfterAll
    static void tearDown() throws IOException {
        if (server != null) {
            server.shutdown();
        }
    }

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry registry) {
        server = new MockWebServer();
        try {
            server.start();
        } catch (IOException e) {
            throw new RuntimeException("Falha ao inicializar o MockWebServer", e);
        }
        registry.add("ota.api.base-url", () -> server.url("/api/").toString());
    }

    @BeforeEach
    void reset() {
        circuitBreakerRegistry.circuitBreaker("externalApi").reset();
        server.setDispatcher(new okhttp3.mockwebserver.QueueDispatcher());
    }

    @Test
    @DisplayName("CONFIRMED quando integração externa aprova via BookingSyncService")
    void confirmedWhenExternalApproves() {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .addHeader("Content-Type", "application/json")
                .setBody("{\"approved\":true,\"reason\":\"OK\"}"));

        var message = new BookingCreatedMessage(1L, 10L, 20L, BookingStatus.PENDING_PAYMENT);
        var response = bookingSyncService.syncBooking(message);

        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.reason()).isEqualTo("OK");
    }

    @Test
    @DisplayName("Optional vazio quando API externa falha (HTTP 500)")
    void emptyOptionalOnServerError() {
        server.enqueue(new MockResponse().setResponseCode(500));
        server.enqueue(new MockResponse().setResponseCode(500));
        server.enqueue(new MockResponse().setResponseCode(500));

        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl(server.url("/").toString())
                .endpoint("test")
                .build();

        Optional<String> response = externalSyncService.post(config, "payload", String.class);

        assertThat(response).isEmpty();
    }

    @Test
    @DisplayName("Circuit Breaker abre após falhas consecutivas")
    void circuitBreakerOpensAfterFailures() {
        // Enfileira várias falhas
        for (int i = 0; i < 10; i++) {
            server.enqueue(new MockResponse().setResponseCode(500));
        }

        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl(server.url("/").toString())
                .endpoint("fail")
                .build();

        // Faz chamadas até abrir o circuito
        for (int i = 0; i < 6; i++) {
            try {
                externalSyncService.postWithoutResponse(config, "data");
            } catch (Exception e) {
                // Ignora a exceção (HTTP 500 ou CallNotPermittedException) para continuar enchendo o circuito
            }
        }

        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("externalApi");
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);
    }
}
