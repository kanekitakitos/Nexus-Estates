package com.nexus.estates.controller;

import com.nexus.estates.controller.PropertyController;
import com.nexus.estates.entity.Property;
import com.nexus.estates.service.PropertyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PropertyControllerTest {

    @Test
    @DisplayName("Should return 400 Bad Request when missing required fields")
    void shouldReturnBadRequestWhenMissingFields() {

        PropertyService service = mock(PropertyService.class);
        PropertyController controller = new PropertyController(service);

        Property property = new Property(); // vazio

        var response = controller.create(property);

        assertEquals(400, response.getStatusCodeValue());
    }
}
