package com.nexus.estates.common.messaging;

import java.time.Instant;

/**
 * Mensagem de integração que representa um bloqueio de calendário externo
 * para uma propriedade, proveniente de um feed iCal (.ics).
 *
 * @param propertyId identificador da propriedade alvo do bloqueio.
 * @param startUtc instante UTC de início do bloqueio.
 * @param endUtc instante UTC de fim do bloqueio.
 * @param sourceUid identificador único do evento no calendário externo (quando disponível).
 * @param sourceSummary descrição/título do evento no calendário externo (quando disponível).
 */
public record CalendarBlockMessage(
        Long propertyId,
        Instant startUtc,
        Instant endUtc,
        String sourceUid,
        String sourceSummary
){
}

