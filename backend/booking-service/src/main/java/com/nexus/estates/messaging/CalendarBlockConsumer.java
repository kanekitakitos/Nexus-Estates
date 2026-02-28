package com.nexus.estates.messaging;

import com.nexus.estates.common.messaging.CalendarBlockMessage;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;

/**
 * Consumidor de mensagens de bloqueio de calendário externo.
 * <p>
 * Este componente escuta eventos de bloqueio de calendário (geralmente provenientes de integrações iCal)
 * e cria reservas técnicas no sistema para impedir overbookings durante esses períodos.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CalendarBlockConsumer {

    private final BookingRepository bookingRepository;

    /**
     * Processa mensagens de bloqueio de calendário recebidas da fila.
     * <p>
     * Verifica se já existe uma reserva sobreposta para o período solicitado.
     * Se não houver conflito, cria uma reserva técnica (bloqueio) para a propriedade.
     * </p>
     *
     * @param msg A mensagem contendo os detalhes do bloqueio (propriedade, datas, etc.).
     */
    @RabbitListener(queues = "${booking.calendar.queue.block:calendar.block.queue}")
    public void handleCalendarBlock(CalendarBlockMessage msg) {
        try {
            // Converter Instant UTC para LocalDate
            LocalDate checkIn = msg.startUtc().atZone(ZoneOffset.UTC).toLocalDate();
            LocalDate checkOut = msg.endUtc().atZone(ZoneOffset.UTC).toLocalDate();

            // Verificar conflitos
            boolean occupied = bookingRepository.existsOverlappingBooking(msg.propertyId(), checkIn, checkOut);
            
            if (occupied) {
                log.info("Ignorando bloqueio para propriedade {} pois já existe reserva sobreposta: {} - {}",
                        msg.propertyId(), checkIn, checkOut);
                return;
            }

            // Criar reserva de bloqueio
            Booking block = Booking.builder()
                    .propertyId(msg.propertyId())
                    .userId(0L) // ID 0 reservado para o sistema/bloqueios técnicos
                    .checkInDate(checkIn)
                    .checkOutDate(checkOut)
                    .guests(1) // Mínimo de 1 hóspede para consistência
                    .totalPrice(BigDecimal.ZERO) // Bloqueios não têm custo
                    .currency("EUR") // Moeda padrão
                    .status(BookingStatus.CONFIRMED) // Bloqueio é tratado como confirmado
                    .cancellationReason("External Calendar Block: " + msg.sourceSummary())
                    .build();

            bookingRepository.save(block);
            log.info("Aplicado bloqueio externo para propriedade {}: {} - {}", msg.propertyId(), checkIn, checkOut);
            
        } catch (Exception ex) {
            log.error("Falha ao aplicar bloqueio externo para propriedade {}: {}", msg.propertyId(), ex.getMessage(), ex);
            // Não relançamos a exceção para evitar loop infinito de reprocessamento de mensagem inválida
            // Em um cenário real, poderia ser enviada para uma Dead Letter Queue (DLQ)
        }
    }
}