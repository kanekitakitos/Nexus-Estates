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
    static void init() throws IOException {
        // Inicia o servidor uma vez para obter a porta
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
    void reset() throws IOException {
        // Reset do Circuit Breaker
        circuitBreakerRegistry.circuitBreaker("externalApi").reset();
        
        // Hack para limpar o MockWebServer:
        // Como não há método clear(), e não queremos reiniciar para não mudar a porta,
        // vamos despachar todas as requisições pendentes (se houver) ou simplesmente
        // garantir que os testes são atómicos.
        // Uma abordagem melhor é usar um Dispatcher novo para cada teste.
        
        server.setDispatcher(new okhttp3.mockwebserver.QueueDispatcher());
    }

    @Test
    @DisplayName("CONFIRMED quando API externa aprova (HTTP 200)")
    void confirmedWhenExternalApproves() {
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
        for (int i = 0; i < 8; i++) {
            server.enqueue(new MockResponse().setResponseCode(500));
        }

        var message = new BookingCreatedMessage(4L, 13L, 23L, BookingStatus.PENDING_PAYMENT);
        
        for (int i = 0; i < 4; i++) {
            try {
                externalSyncService.processBooking(message);
            } catch (Exception ignored) {}
        }

        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("externalApi");
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);
    }
}