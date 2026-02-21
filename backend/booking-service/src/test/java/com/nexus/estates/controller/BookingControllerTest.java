package com.nexus.estates.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.exception.BookingConflictException;
import com.nexus.estates.service.BookingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes unitários para o controlador de agendamento (BookingController).
 * <p>
 * Utiliza MockMvc para simular requisições HTTP e verificar respostas.
 * Mocks o BookingService para isolar o comportamento do controlador.
 * </p>
 */
@WebMvcTest(BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    @Test
    @DisplayName("Should create booking successfully and return 201 Created")
    void shouldCreateBookingSuccessfully() throws Exception {
        Long bookingId = 1L;
        CreateBookingRequest request = new CreateBookingRequest(
                10L,
                20L,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(5),
                2
        );

        BookingResponse response = new BookingResponse(
                bookingId,
                request.propertyId(),
                request.userId(),
                request.checkInDate(),
                request.checkOutDate(),
                request.guestCount(),
                new BigDecimal("400.00"),
                "EUR",
                BookingStatus.PENDING_PAYMENT

        );

        when(bookingService.createBooking(any(CreateBookingRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(bookingId))
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when input is invalid")
    void shouldReturn400BadRequestWhenInputIsInvalid() throws Exception {
        // Request com data de check-in no passado e sem user ID
        CreateBookingRequest invalidRequest = new CreateBookingRequest(
                10L,
                null, // Missing User ID
                LocalDate.now().minusDays(1), // Past date
                LocalDate.now().plusDays(2),
                0 // Invalid guest count
        );

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Should return 409 Conflict when booking dates overlap")
    void shouldReturn409ConflictWhenDatesOverlap() throws Exception {
        CreateBookingRequest request = new CreateBookingRequest(
                10L,
                20L,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(5),
                2
        );

        when(bookingService.createBooking(any(CreateBookingRequest.class)))
                .thenThrow(new BookingConflictException("Property is already booked for these dates"));

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Property is already booked for these dates"));
    }

    @Test
    @DisplayName("Should return booking details when ID exists")
    void shouldReturnBookingWhenIdExists() throws Exception {
        Long bookingId = 2L;
        BookingResponse response = new BookingResponse(
                bookingId,
                10L,
                20L,
                LocalDate.now(),
                LocalDate.now().plusDays(2),
                2,
                new BigDecimal("200.00"),
                "EUR",
                BookingStatus.CONFIRMED

        );

        when(bookingService.getBookingById(bookingId)).thenReturn(response);

        mockMvc.perform(get("/api/bookings/{id}", bookingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(bookingId));
    }

    @Test
    @DisplayName("Should return list of bookings for a property")
    void shouldReturnBookingsByProperty() throws Exception {
        Long propertyId = 10L;
        BookingResponse response = new BookingResponse(
                3L,
                propertyId,
                20L,
                LocalDate.now(),
                LocalDate.now().plusDays(2),
                2,
                new BigDecimal("200.00"),
                "EUR",
                BookingStatus.CONFIRMED

        );

        when(bookingService.getBookingsByProperty(propertyId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/bookings/property/{propertyId}", propertyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].propertyId").value(propertyId));
    }

    @Test
    @DisplayName("Should return empty list when property has no bookings")
    void shouldReturnEmptyListForProperty() throws Exception {
        Long propertyId = 11L;
        when(bookingService.getBookingsByProperty(propertyId)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/bookings/property/{propertyId}", propertyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @DisplayName("Should return list of bookings for a user")
    void shouldReturnBookingsByUser() throws Exception {
        Long userId = 20L;
        BookingResponse response = new BookingResponse(
                4L,
                10L,
                userId,
                LocalDate.now(),
                LocalDate.now().plusDays(2),
                2,
                new BigDecimal("200.00"),
                "EUR",
                BookingStatus.CONFIRMED
        );

        when(bookingService.getBookingsByUser(userId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/bookings/user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(userId));
    }
}
