package com.nexus.estates.dto;

import java.time.Instant;

/**
 * DTO normalizado para representar um intervalo de bloqueio proveniente
 * de um calendário externo (ficheiro .ics).
 * <p>
 * Todos os instantes são representados em UTC para evitar ambiguidades de
 * fuso horário entre diferentes plataformas (Google Calendar, Airbnb, etc.).
 * </p>
 *
 * @param startUtc instante UTC de início do bloqueio.
 * @param endUtc instante UTC de fim do bloqueio.
 * @param uid identificador único do evento no calendário externo (quando disponível).
 * @param summary resumo/título legível do evento externo.
 */
public record SyncBlockDTO(
        Instant startUtc,
        Instant endUtc,
        String uid,
        String summary
) {
}
