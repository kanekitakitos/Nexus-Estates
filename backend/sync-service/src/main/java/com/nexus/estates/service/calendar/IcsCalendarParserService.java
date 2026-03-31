package com.nexus.estates.service.calendar;

import biweekly.Biweekly;
import biweekly.ICalendar;
import biweekly.component.VEvent;
import biweekly.io.TimezoneAssignment;
import biweekly.io.TimezoneInfo;
import biweekly.property.DateEnd;
import biweekly.property.DateStart;
import biweekly.property.ICalProperty;
import biweekly.property.Summary;
import biweekly.property.Uid;
import biweekly.util.DateTimeComponents;
import biweekly.util.ICalDate;
import com.nexus.estates.dto.SyncBlockDTO;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.TimeZone;

/**
 * Serviço responsável por interpretar ficheiros iCalendar (.ics) e normalizar eventos em UTC.
 * <p>
 * Este componente isola a complexidade de parsing iCalendar, convertendo diferentes representações
 * temporais (TZID, floating, VALUE=DATE) para {@link Instant} UTC e devolvendo uma lista de
 * {@link SyncBlockDTO} pronta para publicação/consumo por outros serviços.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 * @see SyncBlockDTO
 */
@Service
public class IcsCalendarParserService {

    /**
     * Interpreta o conteúdo .ics de um InputStream e extrai blocos normalizados.
     *
     * @param icsInputStream stream com conteúdo iCalendar
     * @return lista de blocos normalizados em UTC
     * @throws IllegalArgumentException se o conteúdo estiver inválido
     */
    public List<SyncBlockDTO> parseBlocks(InputStream icsInputStream) {
        try {
            List<ICalendar> calendars = Biweekly.parse(icsInputStream).all();
            boolean hasEvent = calendars.stream().anyMatch(c -> !c.getEvents().isEmpty());
            if (!hasEvent) {
                throw new IllegalArgumentException("Conteúdo .ics inválido");
            }
            return extractBlocks(calendars);
        } catch (java.io.IOException e) {
            throw new IllegalArgumentException("Conteúdo .ics inválido", e);
        }
    }

    /**
     * Interpreta o conteúdo .ics textual e extrai blocos normalizados.
     *
     * @param icsContents conteúdo iCalendar em texto
     * @return lista de blocos normalizados em UTC
     * @throws IllegalArgumentException se o conteúdo estiver inválido
     */
    public List<SyncBlockDTO> parseBlocks(String icsContents) {
        try (InputStream is = new ByteArrayInputStream(icsContents.getBytes(StandardCharsets.UTF_8))) {
            List<ICalendar> calendars = Biweekly.parse(is).all();
            boolean hasEvent = calendars.stream().anyMatch(c -> !c.getEvents().isEmpty());
            if (!hasEvent) {
                throw new IllegalArgumentException("Conteúdo .ics inválido");
            }
            return extractBlocks(calendars);
        } catch (java.io.IOException e) {
            throw new IllegalArgumentException("Conteúdo .ics inválido", e);
        }
    }

    /**
     * Converte calendários parseados em uma lista de blocos de sincronização.
     *
     * @param calendars lista de calendários iCal já parseados
     * @return blocos normalizados com instantes UTC
     */
    private List<SyncBlockDTO> extractBlocks(List<ICalendar> calendars) {
        List<SyncBlockDTO> result = new ArrayList<>();
        for (ICalendar ical : calendars) {
            TimezoneInfo tzinfo = ical.getTimezoneInfo();
            for (VEvent event : ical.getEvents()) {
                DateStart ds = event.getDateStart();
                DateEnd de = event.getDateEnd();
                if (ds == null || de == null) {
                    continue;
                }
                ICalDate start = ds.getValue();
                ICalDate end = de.getValue();

                Instant startUtc = toInstantUtc(start, tzinfo, ds);
                Instant endUtc = toInstantUtc(end, tzinfo, de);

                Uid uid = event.getUid();
                Summary summary = event.getSummary();
                result.add(new SyncBlockDTO(
                        startUtc,
                        endUtc,
                        uid != null ? uid.getValue() : null,
                        summary != null ? summary.getValue() : null
                ));
            }
        }
        return result;
    }

    /**
     * Converte uma data iCal para {@link Instant} em UTC, respeitando TZID/floating/DATE.
     *
     * @param icalDate data iCal
     * @param tzinfo   contexto de timezone do calendário
     * @param property propriedade original (DTSTART/DTEND)
     * @return instante em UTC
     */
    private Instant toInstantUtc(ICalDate icalDate, TimezoneInfo tzinfo, ICalProperty property) {
        DateTimeComponents comps = icalDate.getRawComponents();

        boolean hasTime = icalDate.hasTime();
        boolean floating = tzinfo.isFloating(property);
        TimezoneAssignment assign = tzinfo.getTimezone(property);

        TimeZone tz;
        if (!hasTime) {
            tz = TimeZone.getTimeZone("UTC");
        } else if (floating) {
            tz = TimeZone.getDefault();
        } else {
            tz = (assign != null) ? assign.getTimeZone() : TimeZone.getTimeZone("UTC");
        }

        return comps.toDate(tz).toInstant();
    }
}
