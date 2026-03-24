package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.Map;

@Schema(description = "Payload para atualização parcial de uma propriedade (PATCH). Campos nulos não são alterados.")
public record UpdatePropertyRequest(
        @Schema(description = "Novo título do anúncio", example = "Apartamento Premium no Chiado")
        String title,
        @Schema(description = "Nova descrição (multi-idioma)", example = "{\"pt\":\"Descrição atualizada\"}")
        Map<String, String> description,
        @Schema(description = "Nova localização", example = "Lisboa")
        String location,
        @Schema(description = "Nova cidade", example = "Lisboa")
        String city,
        @Schema(description = "Nova morada", example = "Rua Exemplo, 123")
        String address,
        @Schema(description = "Novo preço base por noite", example = "175.00")
        BigDecimal basePrice,
        @Schema(description = "Nova capacidade máxima de hóspedes", example = "6")
        Integer maxGuests,
        @Schema(description = "Ativar/Desativar anúncio", example = "true")
        Boolean isActive
) {}
