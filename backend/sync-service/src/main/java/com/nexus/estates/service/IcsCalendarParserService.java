package com.nexus.estates.service;

import biweekly.Biweekly;
import biweekly.ICalendar;
import biweekly.component.VEvent;
import biweekly.io.TimezoneAssignment;
import biweekly.io.TimezoneInfo;
import biweekly.property.DateEnd;
import biweekly.property.DateStart;
import biweekly.property.Summary;
import biweekly.property.ICalProperty;
import biweekly.property.Uid;
import biweekly.util.DateTimeComponents;
import biweekly.util.ICalDate;
import com.nexus.estates.dto.SyncBlockDTO;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.TimeZone;

/**
 * Serviço responsável por interpretar ficheiros iCal (.ics) e normalizar
 * os eventos de bloqueio em instantes UTC.
 * <p>
 * Este componente isola toda a complexidade de parsing do formato iCalendar,
 * garantindo que:
 * </p>
 * <ul>
 *   <li>Eventos com timezone explícito ({@code TZID}) são convertidos corretamente para UTC;</li>
 *   <li>Eventos {@code floating} (sem timezone) são resolvidos com base na configuração local;</li>
 *   <li>Eventos de dia inteiro ({@code VALUE=DATE}) são tratados como limites de dia em UTC;</li>
 *   <li>Datas resultantes são sempre expostas como {@link java.time.Instant} em UTC.</li>
 * </ul>
 * <p>
 * A saída é uma lista de {@link SyncBlockDTO} pronta a ser consumida pelo
 * restante domínio de sincronização de calendários (ex.: publicação de eventos
 * AMQP para o booking-service).
 * </p>
 */
@Service
public class IcsCalendarParserService {

    /**
     * Faz o parsing de um ficheiro iCal (.ics) a partir de um {@link InputStream}.
     * <p>
     * Use este método quando o conteúdo for recebido como ficheiro (ex.: upload
     * multipart ou leitura de disco). O stream não é fechado pelo método.
     * </p>
     *
     * @param icsInputStream stream com o conteúdo bruto do ficheiro .ics.
     * @return lista de blocos normalizados extraídos do calendário.
     * @throws IllegalArgumentException se o conteúdo não respeitar o formato iCal.
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
     * Faz o parsing de um ficheiro iCal (.ics) recebido como {@link String}.
     * <p>
     * O conteúdo é convertido internamente para UTF-8 antes de ser processado
     * pela biblioteca biweekly.
     * </p>
     *
     * @param icsContents conteúdo textual completo de um ficheiro .ics.
     * @return lista de blocos normalizados extraídos do calendário.
     * @throws IllegalArgumentException se o conteúdo não respeitar o formato iCal.
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
     * Converte uma coleção de {@link ICalendar} em blocos normalizados.
     * <p>
     * Apenas eventos ({@link VEvent}) que possuam ambas as propriedades
     * {@code DTSTART} e {@code DTEND} são considerados válidos. Cada par
     * é convertido para instantes UTC através de {@link #toInstantUtc(ICalDate, TimezoneInfo, ICalProperty)}.
     * </p>
     *
     * @param calendars lista de calendários iCal já parseados.
     * @return lista de blocos normalizados representando os eventos de bloqueio.
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
     * Converte uma data/hora iCal para um {@link Instant} em UTC.
     * <p>
     * A resolução do fuso horário respeita a configuração de {@link TimezoneInfo}:
     * </p>
     * <ul>
     *   <li>Datas sem componente de hora ({@code VALUE=DATE}) são assumidas em UTC;</li>
     *   <li>Datas {@code floating} utilizam o timezone por omissão da JVM;</li>
     *   <li>Datas com {@code TZID} usam a {@link TimezoneAssignment} correspondente;</li>
     *   <li>Na ausência de mapeamento, é utilizado UTC como valor por defeito.</li>
     * </ul>
     *
     * @param icalDate data/hora proveniente da propriedade iCal.
     * @param tzinfo   contexto de timezones do calendário.
     * @param property propriedade original (ex.: {@link DateStart} ou {@link DateEnd}) usada para resolução de timezone.
     * @return instante UTC equivalente.
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
