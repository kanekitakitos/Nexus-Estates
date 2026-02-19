package com.nexus.estates.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para a entidade {@link Amenity}.
 * * Verifica se os dados de caracterização das comodidades, como nome
 * e categoria, são geridos corretamente.
 */
class AmenityTest {

    @Test
    void testAmenityData() {
        // Arrange
        Amenity amenity = new Amenity();
        Long id = 4L;
        String name = "Piscina Aquecida";
        AmenityCategory category = AmenityCategory.LEISURE;

        // Act
        amenity.setId(id);
        amenity.setName(name);
        amenity.setCategory(category);

        // Assert
        assertEquals(id, amenity.getId(), "O ID deve corresponder ao UUID gerado.");
        assertEquals("Piscina Aquecida", amenity.getName(), "O nome deve ser igual ao definido.");
        assertEquals(AmenityCategory.LEISURE, amenity.getCategory(), "A categoria deve ser LEISURE.");
    }

    @Test
    void testAmenityCategories() {
        Amenity amenity = new Amenity();

        // Teste rápido para garantir que outras categorias do enum funcionam
        amenity.setCategory(AmenityCategory.SAFETY);
        assertEquals(AmenityCategory.SAFETY, amenity.getCategory());

        amenity.setCategory(AmenityCategory.KITCHEN);
        assertEquals(AmenityCategory.KITCHEN, amenity.getCategory());
    }

    @Test
    void testInitialState() {
        Amenity amenity = new Amenity();
        assertNull(amenity.getId());
        assertNull(amenity.getName());
        assertNull(amenity.getCategory());
    }
}