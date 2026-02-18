package com.nexus.estates.service;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

/**
 * Serviço responsável por integrar com sistemas externos (ex.: Airbnb, Booking.com).
 * <p>
 * Utiliza o {@link RestClient} para efetuar chamadas HTTP/HTTPS e está protegido
 * por circuit breaker e retry configurados via Resilience4j, garantindo que falhas
 * temporárias não derrubam o Sync Service e que problemas persistentes fazem
 * abrir o circuito para evitar sobrecarga das plataformas externas.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalSyncService {

    private final RestClient externalApiRestClient;

    /**
     * Processa a reserva recorrendo a uma API externa.
     * <p>
     * Esta operação está protegida por:
     * <ul>
     *     <li>Um Circuit Breaker identificado como {@code externalApi}.</li>
     *     <li>Um mecanismo de Retry com exponential backoff, também identificado como {@code externalApi}.</li>
     * </ul>
     * </p>
     *
     * @param message mensagem de criação de reserva.
     * @return {@link BookingStatusUpdatedMessage} com o novo estado.
     */
    @CircuitBreaker(name = "externalApi", fallbackMethod = "fallbackProcessBooking")
    @Retry(name = "externalApi")
    public BookingStatusUpdatedMessage processBooking(BookingCreatedMessage message) {
        log.info("Iniciando chamada a API externa para Booking ID: {}", message.bookingId());

        var response = externalApiRestClient
                .post()
                .uri("/external/bookings/sync")
                .body(message)
                .retrieve()
                .onStatus(
                        status -> status.is5xxServerError(),
                        (req, res) -> {
                            throw new HttpServerErrorException(res.getStatusCode());
                        }
                )
                .toEntity(ExternalSyncResult.class);

        ExternalSyncResult body = response.getBody();
        if (body == null) {
            log.warn("Resposta vazia da API externa para Booking ID: {}", message.bookingId());
            return new BookingStatusUpdatedMessage(
                    message.bookingId(),
                    BookingStatus.CANCELLED,
                    "Resposta vazia da API externa"
            );
        }

        BookingStatus status = body.approved() ? BookingStatus.CONFIRMED : BookingStatus.CANCELLED;
        String reason = body.reason();

        log.info("Resultado da API externa para Booking ID {}: {} ({})",
                message.bookingId(), status, reason);

        return new BookingStatusUpdatedMessage(
                message.bookingId(),
                status,
                reason
        );
    }

    /**
     * Fallback invocado quando o Circuit Breaker está aberto ou quando as
     * tentativas de Retry se esgotam.
     *
     * @param message mensagem original de criação de reserva.
     * @param ex      exceção que originou o fallback.
     * @return {@link BookingStatusUpdatedMessage} com estado CANCELLED e razão explicativa.
     */
    @SuppressWarnings("unused")
    BookingStatusUpdatedMessage fallbackProcessBooking(BookingCreatedMessage message, Throwable ex) {
        log.error("Falha ao comunicar com API externa para Booking ID {}. Ativando fallback.",
                message.bookingId(), ex);
        return new BookingStatusUpdatedMessage(
                message.bookingId(),
                BookingStatus.CANCELLED,
                "Falha na integração externa: " + ex.getClass().getSimpleName()
        );
    }

    /**
     * DTO interno utilizado para mapear a resposta da API externa.
     */
    public record ExternalSyncResult(
            boolean approved,
            String reason
    ) {
    }
}
