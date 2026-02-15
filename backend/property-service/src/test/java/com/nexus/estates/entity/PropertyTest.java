package com.nexus.estates.entity;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para a entidade Property.
 *
 * <p>Valida o correto funcionamento dos getters e setters.</p>
 */
@WebMvcTest(Property.class)
class PropertyTest {

    @Test
    void testPropertyData() {

        UUID id = UUID.randomUUID();

        Property property = new Property();

        property.setId(id);
        property.setName("Apartamento");
        property.setDescription("Centro da cidade");
        property.setCity("Lisboa");
        property.setAddress("Av. da Liberdade");
        property.setBasePrice(new BigDecimal("150.00"));
        property.setMaxGuests(4);
        property.setIsActive(true);

        assertEquals(id, property.getId());
        assertEquals("Apartamento", property.getName());
        assertEquals("Centro da cidade", property.getDescription());
        assertEquals("Lisboa", property.getCity());
        assertEquals("Av. da Liberdade", property.getAddress());
        assertEquals(new BigDecimal("150.00"), property.getBasePrice());
        assertEquals(4, property.getMaxGuests());
        assertTrue(property.getIsActive());
    }
}
