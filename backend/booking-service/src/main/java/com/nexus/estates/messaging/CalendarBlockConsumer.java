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
 * Converte blocos .ics em reservas internas técnicas para impedir overbookings.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CalendarBlockConsumer {

    private final BookingRepository bookingRepository;

    @RabbitListener(queues = "${booking.calendar.queue.block:calendar.block.queue}")
    public void handleCalendarBlock(CalendarBlockMessage msg) {
        try {
            LocalDate checkIn = msg.startUtc().atZone(ZoneOffset.UTC).toLocalDate();
            LocalDate checkOut = msg.endUtc().atZone(ZoneOffset.UTC).toLocalDate();

            boolean occupied = bookingRepository.existsOverlappingBooking(msg.propertyId(), checkIn, checkOut);
            if (occupied) {
                log.info("Ignorando bloqueio para propriedade {} por existir reserva sobreposta: {} - {}",
                        msg.propertyId(), checkIn, checkOut);
                return;
            }

            Booking block = Booking.builder()
                    .propertyId(msg.propertyId())
                    .userId(0L) // sistema
                    .checkInDate(checkIn)
                    .checkOutDate(checkOut)
                    .guestCount(0)
                    .totalPrice(BigDecimal.ZERO)
                    .currency("N/A")
                    .status(BookingStatus.CONFIRMED)
                    .build();

            bookingRepository.save(block);
            log.info("Aplicado bloqueio externo para propriedade {}: {} - {}", msg.propertyId(), checkIn, checkOut);
        } catch (Exception ex) {
            log.error("Falha ao aplicar bloqueio externo para propriedade {}: {}", msg.propertyId(), ex.getMessage(), ex);
            throw ex;
        }
    }
}

