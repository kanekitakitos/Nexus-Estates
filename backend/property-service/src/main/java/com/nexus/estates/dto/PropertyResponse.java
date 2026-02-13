package com.nexus.estates.dto;

import com.nexus.estates.entity.Property;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO que representa a resposta de dados de uma propriedade.
 *
 * <p>Separa a camada de persistência (Entity) da camada de exposição (API),
 * evitando o vazamento de detalhes internos do modelo de dados.</p>
 *
 * @param id Identificador único da propriedade.
 * @param name Nome / título da propriedade.
 * @param description Descrição detalhada da propriedade.
 * @param city Cidade onde a propriedade está localizada.
 * @param address Endereço da propriedade.
 * @param basePrice Preço base por noite.
 * @param maxGuests Número máximo de hóspedes.
 * @param isActive Estado do anúncio.
 *
 * @author Nexus Estates Team
 */
public record PropertyResponse(
        UUID id,
        String name,
        String description,
        String city,
        String address,
        BigDecimal basePrice,
        Integer maxGuests,
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
                property.getCity(),
                property.getAddress(),
                property.getBasePrice(),
                property.getMaxGuests(),
                property.getIsActive()
        );
    }
}
