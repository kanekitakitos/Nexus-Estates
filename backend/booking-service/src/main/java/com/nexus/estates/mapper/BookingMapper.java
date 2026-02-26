package com.nexus.estates.mapper;

import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import org.springframework.stereotype.Component;

/**
 * Componente responsável pelo mapeamento entre Entidades e DTOs de Reservas.
 * <p>
 * Centraliza a lógica de conversão para manter o código do serviço e do controlador limpo.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Component
public class BookingMapper {

    /**
     * Converte um pedido de criação de reserva numa entidade {@link Booking}.
     * <p>
     * Define o estado inicial da reserva como {@code PENDING_PAYMENT}.
     * </p>
     *
     * @param request O DTO com os dados do pedido.
     * @return A entidade {@link Booking} pronta a ser persistida (sem ID gerado ainda).
     */
    public Booking toEntity(CreateBookingRequest request) {
        return Booking.builder()
                .propertyId(request.propertyId())
                .userId(request.userId())
                .checkInDate(request.checkInDate())
                .checkOutDate(request.checkOutDate())
                .guests(request.guestCount())
                .status(BookingStatus.PENDING_PAYMENT) // Estado inicial obrigatório
                .build();
    }

    /**
     * Converte uma entidade {@link Booking} num DTO de resposta.
     *
     * @param booking A entidade persistida.
     * @return O DTO {@link BookingResponse} para ser enviado ao cliente.
     */
    public BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getPropertyId(),
                booking.getUserId(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getGuests(),
                booking.getTotalPrice(),
                booking.getCurrency(),
                booking.getStatus()
        );
    }
}