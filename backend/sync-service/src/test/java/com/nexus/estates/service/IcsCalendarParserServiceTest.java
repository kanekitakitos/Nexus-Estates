package com.nexus.estates.service;

import com.nexus.estates.dto.SyncBlockDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.TimeZone;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class IcsCalendarParserServiceTest {

    private final IcsCalendarParserService parser = new IcsCalendarParserService();

    @Test
    @DisplayName("Deve interpretar corretamente eventos em UTC (sufixo Z)")
    void shouldParseUtcEvents() {
        String ics = """
                BEGIN:VCALENDAR
                VERSION:2.0
                BEGIN:VEVENT
                UID:utc-1
                SUMMARY:UTC event
                DTSTART:20260218T120000Z
                DTEND:20260218T140000Z
                END:VEVENT
                END:VCALENDAR
                """;

        List<SyncBlockDTO> blocks = parser.parseBlocks(ics);

        assertThat(blocks).hasSize(1);
        SyncBlockDTO b = blocks.get(0);
        assertThat(b.uid()).isEqualTo("utc-1");
        assertThat(b.summary()).isEqualTo("UTC event");
        assertThat(b.startUtc()).isEqualTo(Instant.parse("2026-02-18T12:00:00Z"));
        assertThat(b.endUtc()).isEqualTo(Instant.parse("2026-02-18T14:00:00Z"));
    }

    @Test
    @DisplayName("Deve converter corretamente eventos com TZID (America/New_York) para UTC")
    void shouldConvertTimezonedEventsToUtc() {
        // Noon in New York (UTC-5 in fevereiro) corresponde a 17:00 UTC
        String ics = """
                BEGIN:VCALENDAR
                VERSION:2.0
                BEGIN:VTIMEZONE
                TZID:America/New_York
                BEGIN:STANDARD
                TZOFFSETFROM:-0400
                TZOFFSETTO:-0500
                TZNAME:EST
                DTSTART:19701101T020000
                END:STANDARD
                END:VTIMEZONE
                BEGIN:VEVENT
                UID:ny-1
                SUMMARY:NY event
                DTSTART;TZID=America/New_York:20260218T120000
                DTEND;TZID=America/New_York:20260218T140000
                END:VEVENT
                END:VCALENDAR
                """;

        List<SyncBlockDTO> blocks = parser.parseBlocks(ics);
        assertThat(blocks).hasSize(1);
        SyncBlockDTO b = blocks.get(0);
        assertThat(b.uid()).isEqualTo("ny-1");
        assertThat(b.summary()).isEqualTo("NY event");

        Instant expectedStart = ZonedDateTime.of(2026, 2, 18, 12, 0, 0, 0, ZoneId.of("America/New_York"))
                .withZoneSameInstant(ZoneId.of("UTC"))
                .toInstant();
        Instant expectedEnd = ZonedDateTime.of(2026, 2, 18, 14, 0, 0, 0, ZoneId.of("America/New_York"))
                .withZoneSameInstant(ZoneId.of("UTC"))
                .toInstant();

        assertThat(b.startUtc()).isEqualTo(expectedStart);
        assertThat(b.endUtc()).isEqualTo(expectedEnd);
    }

    @Test
    @DisplayName("Deve tratar eventos all-day (VALUE=DATE) como instantes UTC de início/fim de dia")
    void shouldHandleAllDayEventsAsUtcMidnightBounds() {
        String ics = """
                BEGIN:VCALENDAR
                VERSION:2.0
                BEGIN:VEVENT
                UID:all-1
                SUMMARY:All-day event
                DTSTART;VALUE=DATE:20260218
                DTEND;VALUE=DATE:20260219
                END:VEVENT
                END:VCALENDAR
                """;

        List<SyncBlockDTO> blocks = parser.parseBlocks(ics);
        assertThat(blocks).hasSize(1);
        SyncBlockDTO b = blocks.get(0);
        assertThat(b.uid()).isEqualTo("all-1");
        assertThat(b.summary()).isEqualTo("All-day event");
        assertThat(b.startUtc()).isEqualTo(Instant.parse("2026-02-18T00:00:00Z"));
        assertThat(b.endUtc()).isEqualTo(Instant.parse("2026-02-19T00:00:00Z"));
    }

    @Test
    @DisplayName("Ignora eventos sem DTEND ou sem DTSTART")
    void shouldIgnoreEventsMissingDates() {
        String ics = """
                BEGIN:VCALENDAR
                VERSION:2.0
                BEGIN:VEVENT
                UID:missing-end
                SUMMARY:No end date
                DTSTART:20260218T120000Z
                END:VEVENT
                BEGIN:VEVENT
                UID:missing-start
                SUMMARY:No start date
                DTEND:20260218T140000Z
                END:VEVENT
                END:VCALENDAR
                """;
        List<SyncBlockDTO> blocks = parser.parseBlocks(ics);
        assertThat(blocks).isEmpty();
    }

    @Test
    @DisplayName("Lança IllegalArgumentException para conteúdo .ics inválido")
    void shouldThrowForInvalidIcs() {
        String invalid = "NOT_AN_ICAL";
        assertThatThrownBy(() -> parser.parseBlocks(invalid))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Conteúdo .ics inválido");
    }

    @Test
    @DisplayName("Eventos floating (sem TZID e sem Z) usam timezone por omissão")
    void shouldHandleFloatingEventsUsingDefaultTimezone() {
        TimeZone previous = TimeZone.getDefault();
        try {
            TimeZone.setDefault(TimeZone.getTimeZone("Europe/Lisbon")); // UTC+0 em fevereiro
            String ics = """
                    BEGIN:VCALENDAR
                    VERSION:2.0
                    BEGIN:VEVENT
                    UID:floating-1
                    SUMMARY:Floating event
                    DTSTART:20260218T12:00:00
                    DTEND:20260218T14:00:00
                    END:VEVENT
                    END:VCALENDAR
                    """;
            List<SyncBlockDTO> blocks = parser.parseBlocks(ics);
            assertThat(blocks).hasSize(1);
            SyncBlockDTO b = blocks.get(0);
            assertThat(b.uid()).isEqualTo("floating-1");
            assertThat(b.summary()).isEqualTo("Floating event");
            assertThat(b.startUtc()).isEqualTo(Instant.parse("2026-02-18T12:00:00Z"));
            assertThat(b.endUtc()).isEqualTo(Instant.parse("2026-02-18T14:00:00Z"));
        } finally {
            TimeZone.setDefault(previous);
        }
    }
}
