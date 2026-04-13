package com.nexus.estates.dto;

import com.nexus.estates.common.dto.PropertyRuleDTO;
import com.nexus.estates.common.dto.SeasonalityRuleDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Schema(description = "Resposta expandida de uma propriedade com relacionamentos")
public record ExpandedPropertyResponse(
        Long id,
        String name,
        Map<String, String> description,
        String location,
        String city,
        String address,
        BigDecimal basePrice,
        Integer maxGuests,
        Boolean isActive,
        List<String> amenities,
        PropertyRuleDTO rules,
        List<SeasonalityRuleDTO> seasonality,
        String imageUrl
) {}
