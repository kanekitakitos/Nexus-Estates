package com.nexus.estates.service;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
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

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class ExternalSyncServiceIT {

    private static MockWebServer server;

    @Autowired
    private ExternalSyncService externalSyncService;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @BeforeAll
    static void setup() throws IOException {
        server = new MockWebServer();
        server.start();
    }

    @AfterAll
    static void tearDown() throws IOException {
        server.shutdown();
    }

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry registry) {
        registry.add("external.api.base-url", () -> server.url("/").toString());
    }

    @BeforeEach
    void reset() {
        circuitBreakerRegistry.circuitBreaker("externalApi").reset();
    }

    @Test
    @DisplayName("CONFIRMED quando API externa aprova (HTTP 200)")
    void confirmedWhenExternalApproves() {
        // Retry não deve ocorrer em sucesso (200), então 1 resposta é suficiente
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .addHeader("Content-Type", "application/json")
                .setBody("{\"approved\":true,\"reason\":\"OK\"}"));

        var message = new BookingCreatedMessage(1L, 10L, 20L, BookingStatus.PENDING_PAYMENT);
        var response = externalSyncService.processBooking(message);

        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.reason()).isEqualTo("OK");
    }

    @Test
    @DisplayName("CANCELLED quando API externa rejeita (HTTP 200)")
    void cancelledWhenExternalRejects() {
        // Retry não deve ocorrer em sucesso (200), então 1 resposta é suficiente
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .addHeader("Content-Type", "application/json")
                .setBody("{\"approved\":false,\"reason\":\"Rejected\"}"));

        var message = new BookingCreatedMessage(2L, 11L, 21L, BookingStatus.PENDING_PAYMENT);
        var response = externalSyncService.processBooking(message);

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(response.reason()).isEqualTo("Rejected");
    }

    @Test
    @DisplayName("Fallback é acionado após retries falharem (HTTP 500)")
    void fallbackTriggeredAfterRetries() {
        // Max attempts = 2. Precisamos de 2 falhas para ativar o fallback.
        server.enqueue(new MockResponse().setResponseCode(500));
        server.enqueue(new MockResponse().setResponseCode(500));

        var message = new BookingCreatedMessage(3L, 12L, 22L, BookingStatus.PENDING_PAYMENT);
        var response = externalSyncService.processBooking(message);

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(response.reason()).contains("Falha na integração externa");
    }

    @Test
    @DisplayName("Circuit Breaker abre após falhas consecutivas acima do threshold")
    void circuitBreakerOpensAfterFailures() {
        // Config: Sliding Window = 4. Retry Max Attempts = 2.
        // Call 1: 2 tentativas (2 falhas registadas no CB). Consome 2 respostas.
        // Call 2: 2 tentativas (2 falhas registadas no CB). Consome 2 respostas.
        // Total falhas = 4. CB deve abrir.
        // Calls 3 e 4: Blocked pelo CB (não consomem respostas).
        // Total respostas necessárias = 4.
        
        for (int i = 0; i < 4; i++) {
            server.enqueue(new MockResponse().setResponseCode(500));
        }

        var message = new BookingCreatedMessage(4L, 13L, 23L, BookingStatus.PENDING_PAYMENT);
        for (int i = 0; i < 4; i++) {
            try {
                externalSyncService.processBooking(message);
            } catch (Exception ignored) {
                // Ignorar exceções, queremos apenas verificar o estado do CB no final
            }
        }

        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("externalApi");
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);
    }
}

