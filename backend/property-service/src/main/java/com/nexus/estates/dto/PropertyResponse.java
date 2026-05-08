package com.nexus.estates.dto;

import com.nexus.estates.entity.Property;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO que representa a resposta de dados de uma propriedade.
 *
 * <p>Separa a camada de persistência (Entity) da camada de exposição (API),
 * evitando o vazamento de detalhes internos do modelo de dados.</p>
 *
 * @param id Identificador único da propriedade.
 * @param name Nome / título da propriedade.
 * @param description Descrição detalhada da propriedade (Mapa de idiomas para JSONB).
 * @param location Localização resumida ou região da propriedade.
 * @param city Cidade onde a propriedade está localizada.
 * @param address Endereço da propriedade.
 * @param basePrice Preço base por noite.
 * @param maxGuests Número máximo de hóspedes.
 * @param isActive Estado do anúncio.
 *
 * @author Nexus Estates Team
 */
@Schema(description = "Resposta detalhada de uma propriedade imobiliária")
public record PropertyResponse(
        @Schema(description = "ID único da propriedade", example = "1")
        Long id,

        @Schema(description = "Título do anúncio", example = "Villa Sol")
        String name,

        @Schema(description = "Descrição em múltiplos idiomas", example = "{\"pt\": \"Casa de férias...\"}")
        Map<String, String> description, // Alterado para Map para suportar JSONB

        @Schema(description = "Localização resumida", example = "Albufeira")
        String location,                 // Adicionado campo location solicitado na tarefa

        @Schema(description = "Cidade", example = "Faro")
        String city,

        @Schema(description = "Endereço completo", example = "Rua das Flores, 123")
        String address,

        @Schema(description = "Preço base por noite", example = "200.00")
        BigDecimal basePrice,

        @Schema(description = "Capacidade máxima de hóspedes", example = "6")
        Integer maxGuests,

        @Schema(description = "Estado do anúncio (Ativo/Inativo)", example = "true")
        Boolean isActive
) {

    /**
     * Construtor de conveniência para conversão Entity → DTO.
     *
     * @param property entidade Property
     */
    public PropertyResponse(Property property) {
        this(
                property.getId(),
                property.getName(),
                property.getDescription(),
                property.getLocation(),
                property.getCity(),
                property.getAddress(),
                property.getBasePrice(),
                property.getMaxGuests(),
                property.getIsActive()
        );
    }
}