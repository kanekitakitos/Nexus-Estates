package com.nexus.estates.service;

import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.common.dto.PropertyRuleDTO;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.exception.RuleViolationException;
import com.nexus.estates.messaging.BookingEventPublisher;
import com.nexus.estates.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;
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
    private Proxy api;

    @Mock
    private NexusClients.PropertyClient propertyClient;

    @Mock
    private NexusClients.UserClient userClient;

    @InjectMocks
    private BookingService bookingService;

    private CreateBookingRequest request;

    @BeforeEach
    void setUp() {
        request = new CreateBookingRequest(
                1L,
                100L,
                LocalDate.now().plusDays(5),
                LocalDate.now().plusDays(8), // 3 noites
                2
        );
    }

    @Test
    void createBooking_ShouldThrowRuleViolation_WhenNightsLessThanMin() {
        PropertyRuleDTO rules = new PropertyRuleDTO(
                LocalTime.of(16, 0),
                LocalTime.of(11, 0),
                5, // Mínimo 5 noites
                30,
                0
        );
        ApiResponse<PropertyRuleDTO> response = ApiResponse.success(rules, "OK");

        when(api.propertyClient()).thenReturn(propertyClient);
        when(api.userClient()).thenReturn(userClient);
        when(userClient.getUserEmail(anyLong())).thenReturn("user@example.com");
        when(propertyClient.getRules(anyLong())).thenReturn(response);

        assertThrows(RuleViolationException.class, () -> bookingService.createBooking(request));
    }

    @Test
    void createBooking_ShouldThrowRuleViolation_WhenNightsMoreThanMax() {
        PropertyRuleDTO rules = new PropertyRuleDTO(
                LocalTime.of(16, 0),
                LocalTime.of(11, 0),
                1,
                2, // Máximo 2 noites
                0
        );
        ApiResponse<PropertyRuleDTO> response = ApiResponse.success(rules, "OK");

        when(api.propertyClient()).thenReturn(propertyClient);
        when(api.userClient()).thenReturn(userClient);
        when(userClient.getUserEmail(anyLong())).thenReturn("user@example.com");
        when(propertyClient.getRules(anyLong())).thenReturn(response);

        assertThrows(RuleViolationException.class, () -> bookingService.createBooking(request));
    }

    @Test
    void createBooking_ShouldThrowRuleViolation_WhenLeadTimeNotMet() {
        // Reserva para daqui a 5 dias, mas lead time é 10 dias
        PropertyRuleDTO rules = new PropertyRuleDTO(
                LocalTime.of(16, 0),
                LocalTime.of(11, 0),
                1,
                30,
                10 // Antecedência de 10 dias
        );
        ApiResponse<PropertyRuleDTO> response = ApiResponse.success(rules, "OK");

        when(api.propertyClient()).thenReturn(propertyClient);
        when(api.userClient()).thenReturn(userClient);
        when(userClient.getUserEmail(anyLong())).thenReturn("user@example.com");
        when(propertyClient.getRules(anyLong())).thenReturn(response);

        assertThrows(RuleViolationException.class, () -> bookingService.createBooking(request));
    }

    @Test
    void createBooking_ShouldSucceed_WhenRulesAreMet() {
        PropertyRuleDTO rules = new PropertyRuleDTO(
                LocalTime.of(16, 0),
                LocalTime.of(11, 0),
                2, // Mínimo ok (3 > 2)
                10, // Máximo ok (3 < 10)
                2  // Lead time ok (5 > 2)
        );
        ApiResponse<PropertyRuleDTO> response = ApiResponse.success(rules, "OK");

        when(api.propertyClient()).thenReturn(propertyClient);
        when(api.userClient()).thenReturn(userClient);
        when(userClient.getUserEmail(anyLong())).thenReturn("user@example.com");
        when(propertyClient.getRules(anyLong())).thenReturn(response);
        when(propertyClient.getPropertyPrice(anyLong())).thenReturn(BigDecimal.valueOf(100));
        
        when(bookingRepository.existsOverlappingBooking(anyLong(), any(), any())).thenReturn(false);
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