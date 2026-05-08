package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO utilizado para a atualização parcial (PATCH/PUT) dos dados de uma propriedade
 * <p>
 *     Todos os campos são opcionais. Apenas os campos fornecidos na requisição (não nulos)
 *     serão processados e atualizados na base de dados. Isto permite atualizar apenas o preço ou apenas o título sem ter de enviar o objeto inteiro
 * </p>
 * @param title O niovo título do anúncio (opcional)
 * @param description O novo mapa de descrições multi-idioma (opcional)
 * @param location A nova região ou localização geral (opcional)
 * @param city A nova cidade (opcional)
 * @param address A nova morada compelta (opcional)
 * @param basePrice O novo preço base cobrado por noite (opcional)
 * @param maxGuests A nova lotação máxima permitida (opcional)
 * @param isActive O novo estado de visibilidade do anúncio (opcional)
 * @param imageUrl O novo URL da imagem da capa (opcional)
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
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
        Boolean isActive,
        @Schema(description = "Nova URL da imagem principal", example = "https://res.cloudinary.com/...")
        String imageUrl
) {}
