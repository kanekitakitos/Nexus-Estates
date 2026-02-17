package com.nexus.estates.service;

import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.messaging.BookingStatusUpdatedMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Serviço responsável por simular a integração com sistemas externos.
 * (Ex: Gateway de pagamentos, validação de documentos, etc.)
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Slf4j
@Service
public class ExternalSyncService {

    /**
     * Processa a reserva e decide se ela deve ser confirmada ou cancelada.
     * Simula um delay de processamento e uma lógica aleatória de sucesso/falha.
     *
     * @param message mensagem de criação de reserva.
     * @return BookingStatusUpdatedMessage com o novo estado.
     */
    public BookingStatusUpdatedMessage processBooking(BookingCreatedMessage message) {
        log.info("Iniciando processamento externo para Booking ID: {}", message.bookingId());

        try {
            // Simula delay de processamento (2-5 segundos)
            Thread.sleep(ThreadLocalRandom.current().nextLong(2000, 5000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Processamento interrompido para Booking ID: {}", message.bookingId());
            return new BookingStatusUpdatedMessage(
                    message.bookingId(),
                    BookingStatus.CANCELLED,
                    "Processamento interrompido"
            );
        }

        // Lógica de simulação: 80% de chance de sucesso
        boolean success = ThreadLocalRandom.current().nextDouble() > 0.2;

        if (success) {
            log.info("Reserva confirmada externamente: {}", message.bookingId());
            return new BookingStatusUpdatedMessage(
                    message.bookingId(),
                    BookingStatus.CONFIRMED,
                    "Pagamento processado com sucesso"
            );
        } else {
            log.warn("Reserva rejeitada externamente: {}", message.bookingId());
            return new BookingStatusUpdatedMessage(
                    message.bookingId(),
                    BookingStatus.CANCELLED,
                    "Falha na verificação de crédito"
            );
        }
    }
}
