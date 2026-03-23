package com.nexus.estates.dto;

import java.time.LocalTime;

public record PropertyRuleDTO(
        LocalTime checkInTime,
        LocalTime checkOutTime,
        Integer minNights,
        Integer maxNights,
        Integer bookingLeadTimeDays
) {
}