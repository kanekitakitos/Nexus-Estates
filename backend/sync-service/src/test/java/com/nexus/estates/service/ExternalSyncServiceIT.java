package com.nexus.estates.service;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.QueueDispatcher;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
// Desliga o JPA para garantir que o contexto do Spring arranca sem BD
@EnableAutoConfiguration(exclude = {
        DataSourceAutoConfiguration.class,
        DataSourceTransactionManagerAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class
})
class ExternalSyncServiceIT {

    private static MockWebServer server;


    private ExternalSyncService externalSyncService;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry registry) throws IOException {
        // Arranca o servidor ANTES do contexto Spring carregar
        server = new MockWebServer();
        server.start();

        registry.add("external.api.base-url", () -> server.url("/").toString());

        // Sobrescreve o waitDuration para 10ms dinamicamente para não bloquear a thread
        registry.add("resilience4j.retry.instances.externalApi.waitDuration", () -> "10ms");
    }

    @AfterAll
    static void tearDown() throws IOException {
        if (server != null) {
            server.shutdown();
        }
    }

    @BeforeEach
    void reset() {
        // 1. Injeta um Dispatcher novo para purgar qualquer MockResponse enfileirado no teste anterior
        server.setDispatcher(new QueueDispatcher());

        // 2. Garante que o circuito está fechado e pronto para o próximo teste
        circuitBreakerRegistry.circuitBreaker("externalApi").transitionToClosedState();
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
        // Precisamos de 2 falhas (maxAttempts=2) para acionar o fallback
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
        // Enfileira 8 respostas 500 (4 chamadas * 2 tentativas)
        for (int i = 0; i < 8; i++) {
            server.enqueue(new MockResponse().setResponseCode(500));
        }

        var message = new BookingCreatedMessage(4L, 13L, 23L, BookingStatus.PENDING_PAYMENT);

        for (int i = 0; i < 4; i++) {
            externalSyncService.processBooking(message);
        }

        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("externalApi");
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);
    }
}