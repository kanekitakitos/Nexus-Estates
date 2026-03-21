package com.nexus.estates.service;

import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.messaging.BookingEventPublisher;
import com.nexus.estates.repository.BookingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceIntegrationTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingEventPublisher bookingEventPublisher;

    @Mock
    private Proxy api;

    @Mock
    private NexusClients.PropertyClient propertyClient;

    @Mock
    private NexusClients.UserClient userClient;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("Should create booking in integrated flow")
    void shouldCreateBookingInIntegratedFlow() {
        // Arrange
        CreateBookingRequest request = new CreateBookingRequest(
                10L,
                20L,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(4),
                2,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        // Criamos o objeto que o repositório irá retornar
        Booking savedBooking = new Booking();
        savedBooking.setId(1L);
        savedBooking.setPropertyId(request.propertyId());
        savedBooking.setUserId(request.userId());
        savedBooking.setCheckInDate(request.checkInDate());
        savedBooking.setCheckOutDate(request.checkOutDate());
        savedBooking.setGuests(request.guestCount());
        savedBooking.setTotalPrice(new BigDecimal("300.00"));
        savedBooking.setCurrency("EUR");
        savedBooking.setStatus(BookingStatus.PENDING_PAYMENT);

        // Mock comportamentos
        // 1. Configurar o Proxy para devolver os clientes mockados
        when(api.userClient()).thenReturn(userClient);
        when(api.propertyClient()).thenReturn(propertyClient);

        // 2. Configurar as respostas dos clientes (User e Property)
        when(userClient.getUserEmail(request.userId())).thenReturn("test@nexus.com");
        when(propertyClient.getPropertyPrice(request.propertyId())).thenReturn(new BigDecimal("100.00"));

        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        // Act
        BookingResponse actualResponse = bookingService.createBooking(request);

        // Assert
        assertThat(actualResponse).isNotNull();
        assertThat(actualResponse.totalPrice()).isEqualByComparingTo("300.00");
        assertThat(actualResponse.status()).isEqualTo(BookingStatus.PENDING_PAYMENT);

        // Verify interações
        verify(bookingRepository).save(any(Booking.class));
        verify(bookingEventPublisher).publishBookingCreated(any());
    }
}
