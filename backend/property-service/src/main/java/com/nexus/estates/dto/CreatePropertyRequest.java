package com.nexus.estates.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO que representa o payload para criação de uma nova propriedade.
 * <p>
 * Utiliza Java Records para garantir imutabilidade e reduzir boilerplate.
 * Inclui validações de Bean Validation para assegurar a integridade dos dados
 * logo na camada de entrada da API.
 * </p>
 *
 * @param title Título da propriedade (Obrigatório).
 * @param description Descrição da propriedade.
 * @param price Preço da propriedade (Deve ser maior que zero).
 * @param ownerId ID do proprietário (Obrigatório).
 *
 * @author Nexus Estates Team
 */
public record CreatePropertyRequest(

        @NotBlank(message = "Title is required")
        String title,

        String description,

        @NotNull(message = "Price is required")
        @Min(value = 1, message = "Price must be greater than zero")
        Double price,

        @NotNull(message = "Owner ID is required")
        Long ownerId

) {}
