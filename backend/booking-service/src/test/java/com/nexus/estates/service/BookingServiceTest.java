package com.nexus.estates.service;

import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.common.dto.PropertyQuoteRequest;
import com.nexus.estates.common.dto.PropertyQuoteResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.exception.RuleViolationException;
import com.nexus.estates.messaging.BookingEventPublisher;
import com.nexus.estates.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingEventPublisher bookingEventPublisher;

    @Mock
    private BookingPaymentService bookingPaymentService;

    @Mock
    private NexusClients.PropertyClient propertyClient;

    @Mock
    private NexusClients.UserClient userClient;

    private BookingService bookingService;

    private CreateBookingRequest request;

    @BeforeEach
    void setUp() {
        Proxy api = new Proxy(propertyClient, userClient, null);
        bookingService = new BookingService(bookingRepository, bookingEventPublisher, bookingPaymentService, api);

        when(bookingRepository.existsOverlappingBooking(anyLong(), any(), any())).thenReturn(false);

        request = new CreateBookingRequest(
                1L,
                100L,
                LocalDate.now().plusDays(5),
                LocalDate.now().plusDays(8), // 3 noites
                2,
                null, null, null, null, null, null, null, null // Campos de guest opcionais
        );
    }

    @Test
    void createBooking_ShouldThrowRuleViolation_WhenNightsLessThanMin() {
        PropertyQuoteResponse quote = PropertyQuoteResponse.failure(List.of("O número mínimo de noites é 5"));
        ApiResponse<PropertyQuoteResponse> response = ApiResponse.success(quote, "OK");

        when(propertyClient.quote(anyLong(), any(PropertyQuoteRequest.class))).thenReturn(response);

        assertThrows(RuleViolationException.class, () -> bookingService.createBooking(request));
    }

    @Test
    void createBooking_ShouldThrowRuleViolation_WhenNightsMoreThanMax() {
        PropertyQuoteResponse quote = PropertyQuoteResponse.failure(List.of("O número máximo de noites é 2"));
        ApiResponse<PropertyQuoteResponse> response = ApiResponse.success(quote, "OK");

        when(propertyClient.quote(anyLong(), any(PropertyQuoteRequest.class))).thenReturn(response);

        assertThrows(RuleViolationException.class, () -> bookingService.createBooking(request));
    }

    @Test
    void createBooking_ShouldThrowRuleViolation_WhenLeadTimeNotMet() {
        PropertyQuoteResponse quote = PropertyQuoteResponse.failure(List.of("A reserva deve ser feita com pelo menos 10 dias de antecedência."));
        ApiResponse<PropertyQuoteResponse> response = ApiResponse.success(quote, "OK");

        when(propertyClient.quote(anyLong(), any(PropertyQuoteRequest.class))).thenReturn(response);

        assertThrows(RuleViolationException.class, () -> bookingService.createBooking(request));
    }

    @Test
    void createBooking_ShouldSucceed_WhenRulesAreMet() {
        PropertyQuoteResponse quote = PropertyQuoteResponse.success(new BigDecimal("300.00"), "EUR");
        ApiResponse<PropertyQuoteResponse> response = ApiResponse.success(quote, "OK");

        when(propertyClient.quote(anyLong(), any(PropertyQuoteRequest.class))).thenReturn(response);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            b.setId(1L);
            return b;
        });

        assertDoesNotThrow(() -> bookingService.createBooking(request));
        
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(bookingEventPublisher, times(1)).publishBookingCreated(any());
    }
}
