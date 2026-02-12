package com.nexus.estates.entity;

import com.nexus.estates.entity.Property;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PropertyTest {

    @Test
    void testPropertyData() {

        Property property = new Property();

        property.setId(1L);
        property.setTitle("Apartamento");
        property.setDescription("Centro da cidade");
        property.setPrice(150000.0);
        property.setOwnerId(5L);

        assertEquals(1L, property.getId());
        assertEquals("Apartamento", property.getTitle());
        assertEquals("Centro da cidade", property.getDescription());
        assertEquals(150000.0, property.getPrice());
        assertEquals(5L, property.getOwnerId());
    }
}
