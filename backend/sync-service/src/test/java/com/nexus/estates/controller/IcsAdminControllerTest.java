package com.nexus.estates.controller;

import com.nexus.estates.dto.SyncBlockDTO;
import com.nexus.estates.service.IcsCalendarParserService;
import com.nexus.estates.common.messaging.CalendarBlockMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IcsAdminControllerTest {

    @Mock
    private IcsCalendarParserService parserService;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private IcsAdminController controller;

    @Test
    @DisplayName("Deve interpretar conteúdo .ics bruto")
    void shouldParseRawIcs() {
        String ics = "BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR";
        List<SyncBlockDTO> expected = List.of(
                new SyncBlockDTO(Instant.parse("2026-02-18T12:00:00Z"), Instant.parse("2026-02-18T14:00:00Z"), "uid-1", "summary")
        );
        when(parserService.parseBlocks(ics)).thenReturn(expected);

        ResponseEntity<List<SyncBlockDTO>> response = controller.parseRaw(ics);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    @DisplayName("Deve interpretar ficheiro .ics enviado via multipart")
    void shouldParseMultipartIcs() throws IOException {
        byte[] content = "BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "calendar.ics", "text/calendar", content);
        List<SyncBlockDTO> expected = List.of(
                new SyncBlockDTO(Instant.parse("2026-02-18T12:00:00Z"), Instant.parse("2026-02-18T14:00:00Z"), "uid-2", "summary2")
        );
        // Ajuste: usar any(InputStream.class) em vez de file.getInputStream() para evitar mismatch de instância
        when(parserService.parseBlocks(any(java.io.InputStream.class))).thenReturn(expected);

        ResponseEntity<List<SyncBlockDTO>> response = controller.parseFile(file);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    @DisplayName("Deve aplicar bloqueios publicando mensagens AMQP (conteúdo bruto)")
    void shouldApplyBlocksFromRaw() {
        ReflectionTestUtils.setField(controller, "bookingExchangeName", "booking.exchange");
        ReflectionTestUtils.setField(controller, "calendarBlockRoutingKey", "calendar.block");

        String ics = "BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR";
        List<SyncBlockDTO> blocks = List.of(
                new SyncBlockDTO(Instant.parse("2026-02-18T12:00:00Z"), Instant.parse("2026-02-18T14:00:00Z"), "uid-1", "summary")
        );
        when(parserService.parseBlocks(ics)).thenReturn(blocks);

        ResponseEntity<List<SyncBlockDTO>> response = controller.applyRaw(10L, ics);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo(blocks);
        verify(rabbitTemplate, atLeastOnce())
                .convertAndSend(eq("booking.exchange"), eq("calendar.block"), any(CalendarBlockMessage.class));
    }

    @Test
    @DisplayName("Deve aplicar bloqueios publicando mensagens AMQP (ficheiro multipart)")
    void shouldApplyBlocksFromFile() throws IOException {
        ReflectionTestUtils.setField(controller, "bookingExchangeName", "booking.exchange");
        ReflectionTestUtils.setField(controller, "calendarBlockRoutingKey", "calendar.block");

        byte[] content = "BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "calendar.ics", "text/calendar", content);
        List<SyncBlockDTO> blocks = List.of(
                new SyncBlockDTO(Instant.parse("2026-02-18T12:00:00Z"), Instant.parse("2026-02-18T14:00:00Z"), "uid-2", "summary2")
        );
        // Ajuste: usar any(InputStream.class) em vez de file.getInputStream()
        when(parserService.parseBlocks(any(java.io.InputStream.class))).thenReturn(blocks);

        ResponseEntity<List<SyncBlockDTO>> response = controller.applyFile(11L, file);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo(blocks);
        verify(rabbitTemplate, atLeastOnce())
                .convertAndSend(eq("booking.exchange"), eq("calendar.block"), any(CalendarBlockMessage.class));
    }
}
