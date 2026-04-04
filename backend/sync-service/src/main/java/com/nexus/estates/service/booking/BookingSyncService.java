package com.nexus.estates.service.booking;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import com.nexus.estates.dto.ExternalApiConfig;
import com.nexus.estates.service.external.connectors.ChannelConnectorFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Serviço de domínio responsável pela sincronização de reservas com parceiros externos.
 * <p>
 * Converte eventos internos do Nexus Estates em chamadas a APIs externas (OTAs),
 * aplicando resiliência (Circuit Breaker/Retry) através do conector HTTP genérico.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 * @see com.nexus.estates.service.external.ExternalSyncService
 * @see com.nexus.estates.service.external.connectors.ChannelConnectorFactory
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingSyncService {

    private final ChannelConnectorFactory connectorFactory;

    @Value("${ota.api.base-url:http://mock-ota.com/api/v1}")
    private String otaBaseUrl;

    @Value("${ota.api.key:dummy-key}")
    private String otaApiKey;

    /**
     * Sincroniza a reserva com a OTA configurada, aplicando resiliência via conector genérico.
     * <p>
     * Constrói a configuração de API externa, invoca o conector e traduz o resultado
     * para um evento {@link BookingStatusUpdatedMessage}.
     * </p>
     *
     * @param message evento de criação de reserva recebido via mensageria
     * @return mensagem de atualização de estado (CONFIRMED ou CANCELLED) com razão
     */
    public BookingStatusUpdatedMessage syncBooking(BookingCreatedMessage message) {
        log.info("Sincronizando reserva {} com plataforma externa", message.bookingId());

        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl(otaBaseUrl)
                .endpoint("/bookings/sync")
                .authType(ExternalApiConfig.AuthType.API_KEY)
                .credentials(otaApiKey)
                .build();

        Optional<ExternalSyncResult> result = connectorFactory.generic().call(config, message, ExternalSyncResult.class);

        return result.map(body -> {
            BookingStatus status = body.approved() ? BookingStatus.CONFIRMED : BookingStatus.CANCELLED;
            return new BookingStatusUpdatedMessage(message.bookingId(), status, body.reason());
        }).orElseGet(() -> new BookingStatusUpdatedMessage(
                message.bookingId(),
                BookingStatus.CANCELLED,
                "Falha na integração externa (Fallback ativado)"
        ));
    }

    public record ExternalSyncResult(boolean approved, String reason) {}
}
