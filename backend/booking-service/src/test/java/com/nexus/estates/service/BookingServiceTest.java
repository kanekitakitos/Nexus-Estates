package com.nexus.estates.service;

import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.exception.BookingConflictException;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingEventPublisher bookingEventPublisher;

    @Mock
    private BookingPaymentService bookingPaymentService;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("Should create booking successfully when no conflicts exist")
    void shouldCreateBookingSuccessfully() {
        CreateBookingRequest request = new CreateBookingRequest(
                10L,
                20L,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(4),
                2
        );

        // Criamos o objeto que o repositório irá retornar com os dados necessários
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

        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

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
                10L,
                20L,
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
                10L,
                20L,
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
                10L, 20L,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(4), // 3 noites
                2
        );

        Booking savedBooking = new Booking();
        savedBooking.setId(2L);
        savedBooking.setPropertyId(request.propertyId());
        savedBooking.setUserId(request.userId());
        savedBooking.setCheckInDate(request.checkInDate());
        savedBooking.setCheckOutDate(request.checkOutDate());
        savedBooking.setGuests(request.guestCount());
        savedBooking.setTotalPrice(new BigDecimal("300.00")); // O que esperamos
        savedBooking.setCurrency("EUR");
        savedBooking.setStatus(BookingStatus.PENDING_PAYMENT);

        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            // Verifica se o serviço calculou o preço antes de salvar
            assertThat(b.getTotalPrice()).isEqualByComparingTo(new BigDecimal("300.00"));
            return savedBooking;
        });

        bookingService.createBooking(request);

        verify(bookingRepository).save(any(Booking.class));
        verify(bookingEventPublisher).publishBookingCreated(any());
    }

    @Test
    @DisplayName("Should return booking when found by ID")
    void shouldReturnBookingById() {
        Long id = 3L;
        Booking booking = new Booking();
        booking.setId(id);
        booking.setPropertyId(10L);
        booking.setUserId(20L);
        booking.setCheckInDate(LocalDate.now());
        booking.setCheckOutDate(LocalDate.now().plusDays(1));
        booking.setGuests(2);
        booking.setTotalPrice(new BigDecimal("100.00"));
        booking.setCurrency("EUR");
        booking.setStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findById(id)).thenReturn(Optional.of(booking));

        BookingResponse actualResponse = bookingService.getBookingById(id);

        assertThat(actualResponse.id()).isEqualTo(id);
    }

    @Test
    @DisplayName("Should throw RuntimeException when booking not found by ID")
    void shouldThrowExceptionWhenBookingNotFound() {
        Long id = 4L;
        when(bookingRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingById(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Booking not found with id: " + id);
    }

    @Test
    @DisplayName("Should return bookings by property")
    void shouldReturnBookingsByProperty() {
        Long propertyId = 10L;
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setPropertyId(propertyId);
        booking.setUserId(20L);
        booking.setCheckInDate(LocalDate.now());
        booking.setCheckOutDate(LocalDate.now().plusDays(1));
        booking.setGuests(2);
        booking.setTotalPrice(new BigDecimal("100.00"));
        booking.setCurrency("EUR");
        booking.setStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findByPropertyId(propertyId)).thenReturn(List.of(booking));

        List<BookingResponse> results = bookingService.getBookingsByProperty(propertyId);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).propertyId()).isEqualTo(propertyId);
    }

    @Test
    @DisplayName("Should return bookings by user")
    void shouldReturnBookingsByUser() {
        Long userId = 20L;
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setPropertyId(10L);
        booking.setUserId(userId);
        booking.setCheckInDate(LocalDate.now());
        booking.setCheckOutDate(LocalDate.now().plusDays(1));
        booking.setGuests(2);
        booking.setTotalPrice(new BigDecimal("100.00"));
        booking.setCurrency("EUR");
        booking.setStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findByUserId(userId)).thenReturn(List.of(booking));

        List<BookingResponse> results = bookingService.getBookingsByUser(userId);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).userId()).isEqualTo(userId);
    }
}