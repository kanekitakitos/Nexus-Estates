package com.nexus.estates.entity;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para a entidade Property.
 *
 * <p>Valida o correto funcionamento dos getters e setters.</p>
 */
class PropertyTest {

    @Test
    void testPropertyData() {

        Long id = 5L;
        // Criamos o mapa de descrição para simular o JSONB
        Map<String, String> descriptions = Map.of(
                "pt", "Centro da cidade",
                "en", "City center"
        );

        Property property = new Property();

        property.setId(id);
        property.setName("Apartamento");
        property.setDescription(descriptions); // Agora passamos o Map
        property.setLocation("Lisboa Centro"); // Adicionado para bater com a nova Entity
        property.setCity("Lisboa");
        property.setAddress("Av. da Liberdade");
        property.setBasePrice(new BigDecimal("150.00"));
        property.setMaxGuests(4);
        property.setIsActive(true);

        assertEquals(id, property.getId());
        assertEquals("Apartamento", property.getName());
        assertEquals(descriptions, property.getDescription());
        assertEquals("Lisboa Centro", property.getLocation());
        assertEquals("Lisboa", property.getCity());
        assertEquals("Av. da Liberdade", property.getAddress());
        assertEquals(new BigDecimal("150.00"), property.getBasePrice());
        assertEquals(4, property.getMaxGuests());
        assertTrue(property.getIsActive());
    }
}