package com.nexus.estates.service;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.dto.ExternalApiConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Serviço de domínio responsável pela sincronização de reservas com parceiros externos.
 * <p>
 * Atua como uma camada de tradução entre os eventos internos do Nexus Estates e os
 * contratos de API das OTAs (Online Travel Agencies).
 * </p>
 *
 * @author Nexus Estates Architect
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingSyncService {

    private final ExternalSyncService externalSyncService;

    @Value("${ota.api.base-url:http://mock-ota.com/api/v1}")
    private String otaBaseUrl;

    @Value("${ota.api.key:dummy-key}")
    private String otaApiKey;

    /**
     * Sincroniza uma reserva recém-criada com a plataforma externa configurada.
     * <p>
     * Constrói o contexto de integração (URL, Autenticação) e utiliza o
     * {@code ExternalSyncService} para realizar a chamada de forma segura e resiliente.
     * </p>
     *
     * @param message Mensagem recebida do RabbitMQ contendo os dados da reserva.
     * @return {@code BookingStatusUpdatedMessage} indicando o sucesso ou falha da operação.
     */
    public BookingStatusUpdatedMessage syncBooking(BookingCreatedMessage message) {
        log.info("Sincronizando reserva {} com plataforma externa", message.bookingId());

        // Define a configuração para a OTA específica
        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl(otaBaseUrl)
                .endpoint("/bookings/sync")
                .authType(ExternalApiConfig.AuthType.API_KEY)
                .credentials(otaApiKey)
                .build();

        // Executa a chamada via serviço resiliente
        Optional<ExternalSyncResult> result = externalSyncService.post(
                config,
                message,
                ExternalSyncResult.class
        );

        return result.map(body -> {
            BookingStatus status = body.approved() ? BookingStatus.CONFIRMED : BookingStatus.CANCELLED;
            return new BookingStatusUpdatedMessage(message.bookingId(), status, body.reason());
        }).orElseGet(() -> new BookingStatusUpdatedMessage(
                message.bookingId(),
                BookingStatus.CANCELLED,
                "Falha na integração externa (Fallback ativado)"
        ));
    }

    /**
     * DTO interno para mapear a resposta da API externa.
     *
     * @param approved Indica se a reserva foi aceite e sincronizada com sucesso.
     * @param reason   Mensagem descritiva do resultado da operação (sucesso ou erro).
     */
    public record ExternalSyncResult(boolean approved, String reason) {}
}
