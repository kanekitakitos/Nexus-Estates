package com.nexus.estates.service;

import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.entity.BookingStatus;
import com.nexus.estates.exception.BookingConflictException;
import com.nexus.estates.mapper.BookingMapper;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingMapper bookingMapper;

    @Mock
    private BookingEventPublisher bookingEventPublisher;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("Should create booking successfully when no conflicts exist")
    void shouldCreateBookingSuccessfully() {
        CreateBookingRequest request = new CreateBookingRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(4),
                2
        );

        Booking bookingEntity = new Booking();
        bookingEntity.setId(UUID.randomUUID());
        
        Booking savedBooking = new Booking();
        savedBooking.setId(bookingEntity.getId());
        savedBooking.setTotalPrice(new BigDecimal("300.00"));

        BookingResponse expectedResponse = new BookingResponse(
                savedBooking.getId(),
                request.propertyId(),
                request.userId(),
                request.checkInDate(),
                request.checkOutDate(),
                request.guestCount(),
                new BigDecimal("300.00"),
                "EUR",
                BookingStatus.PENDING_PAYMENT

        );


        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(false);
        when(bookingMapper.toEntity(request)).thenReturn(bookingEntity);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(bookingMapper.toResponse(savedBooking)).thenReturn(expectedResponse);

        BookingResponse actualResponse = bookingService.createBooking(request);

        assertThat(actualResponse).isNotNull();
        assertThat(actualResponse.totalPrice()).isEqualByComparingTo("300.00");
        verify(bookingRepository).save(any(Booking.class));
        verify(bookingEventPublisher).publishBookingCreated(any());
    }

    @Test
    @DisplayName("Should throw BookingConflictException when dates are occupied")
    void shouldThrowExceptionWhenDatesAreOccupied() {
        CreateBookingRequest request = new CreateBookingRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(5),
                2
        );

        // Ensinar o Mock a dizer "Sim, já existe reserva"
        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BookingConflictException.class)
                .hasMessage("Property is already booked for these dates");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when check-out is before check-in")
    void shouldThrowExceptionWhenCheckOutIsBeforeCheckIn() {
        CreateBookingRequest request = new CreateBookingRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                LocalDate.now().plusDays(5),
                LocalDate.now().plusDays(2), // Inválido: Sai antes de entrar
                2
        );

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Check-out date must be after check-in date");

        verifyNoInteractions(bookingRepository);
    }

    @Test
    @DisplayName("Should calculate total price correctly based on nights")
    void shouldCalculateTotalPriceCorrectly() {
        // Cenário: 3 noites x 100.00 (preço fixo mockado) = 300.00
        CreateBookingRequest request = new CreateBookingRequest(
                UUID.randomUUID(), UUID.randomUUID(),
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(4), // 3 noites
                2
        );

        Booking bookingEntity = new Booking();
        Booking savedBooking = new Booking();
        savedBooking.setId(UUID.randomUUID());
        savedBooking.setTotalPrice(new BigDecimal("300.00")); // O que esperamos

        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(false);
        when(bookingMapper.toEntity(request)).thenReturn(bookingEntity);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            // Verifica se o serviço calculou o preço antes de salvar
            assertThat(b.getTotalPrice()).isEqualByComparingTo(new BigDecimal("300.00"));
            return savedBooking;
        });
        when(bookingMapper.toResponse(any())).thenReturn(mock(BookingResponse.class));

        bookingService.createBooking(request);

        verify(bookingRepository).save(bookingEntity);
        verify(bookingEventPublisher).publishBookingCreated(any());
    }

    @Test
    @DisplayName("Should return booking when found by ID")
    void shouldReturnBookingById() {
        UUID id = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(id);
        BookingResponse expectedResponse = mock(BookingResponse.class);

        when(bookingRepository.findById(id)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(expectedResponse);

        BookingResponse actualResponse = bookingService.getBookingById(id);

        assertThat(actualResponse).isEqualTo(expectedResponse);
    }

    @Test
    @DisplayName("Should throw RuntimeException when booking not found by ID")
    void shouldThrowExceptionWhenBookingNotFound() {
        UUID id = UUID.randomUUID();
        when(bookingRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingById(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Booking not found with id: " + id);
    }

    @Test
    @DisplayName("Should return bookings by property")
    void shouldReturnBookingsByProperty() {
        UUID propertyId = UUID.randomUUID();
        Booking booking = new Booking();
        BookingResponse response = mock(BookingResponse.class);

        when(bookingRepository.findByPropertyId(propertyId)).thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(response);

        List<BookingResponse> results = bookingService.getBookingsByProperty(propertyId);

        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo(response);
    }

    @Test
    @DisplayName("Should return bookings by user")
    void shouldReturnBookingsByUser() {
        UUID userId = UUID.randomUUID();
        Booking booking = new Booking();
        BookingResponse response = mock(BookingResponse.class);

        when(bookingRepository.findByUserId(userId)).thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(response);

        List<BookingResponse> results = bookingService.getBookingsByUser(userId);

        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo(response);
    }
}
