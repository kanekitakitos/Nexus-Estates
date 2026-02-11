package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.controller.BookingController;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
    void shouldReturn400BadRequestWhenInputIsInvalid() throws Exception {
        // Request com data de check-in no passado e sem user ID
        CreateBookingRequest invalidRequest = new CreateBookingRequest(
                UUID.randomUUID(),
                null, // Missing User ID
                LocalDate.now().minusDays(1), // Past date
                LocalDate.now().plusDays(2),
                0 // Invalid guest count
        );

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                // Opcional: Verificar se a mensagem de erro contém os campos
                .andExpect(jsonPath("$.message").exists());
    }
}