package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.util.Map;
import java.util.Set;

/**
 * DTO que representa o payload para criação de uma nova propriedade, refatorado
 * para suportar internacionalização (JSONB) e associação de comodidades.
 * <p>
 * Utiliza Java Records para garantir imutabilidade e reduzir boilerplate.
 * Inclui validações de Bean Validation para assegurar a integridade dos dados
 * e o cumprimento dos requisitos de negócio (Título, Preço e Localização).
 * </p>
 *
 * @param title       Título da propriedade (Obrigatório, entre 5 e 100 caracteres).
 * @param description Mapa de descrições indexado por idioma (ex: "pt", "en") para suporte JSONB.
 * @param price       Preço da propriedade (Deve ser um valor decimal superior a zero).
 * @param ownerId     ID do proprietário responsável pelo anúncio (Obrigatório).
 * @param location    Localização geográfica ou morada da propriedade (Obrigatório).
 * @param amenityIds  Conjunto de IDs das comodidades (Amenities) a associar à propriedade.
 *
 * @author Nexus Estates Team
 */
@Schema(description = "Payload para criação de uma nova propriedade imobiliária")
public record CreatePropertyRequest(

        @Schema(description = "Título do anúncio da propriedade", example = "Apartamento T3 com Vista Mar")
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
        String title,

        @Schema(description = "Descrição detalhada em múltiplos idiomas", example = "{\"pt\": \"Excelente apartamento...\", \"en\": \"Excellent apartment...\"}")
        @NotEmpty(message = "Description is required in at least one language")
        Map<String, String> description,

        @Schema(description = "Preço base por noite", example = "150.00")
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than zero")
        Double price,

        @Schema(description = "ID do proprietário do imóvel", example = "123")
        @NotNull(message = "Owner ID is required")
        Long ownerId,

        @Schema(description = "Localização ou morada resumida", example = "Algarve, Portugal")
        @NotBlank(message = "Location is required")
        String location,

        @Schema(description = "Lista de IDs das comodidades associadas", example = "[1, 5, 12]")
        Set<Long> amenityIds

) {}