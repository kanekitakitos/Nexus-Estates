package com.nexus.estates.exception;

import java.util.UUID;

/**
 * Exceção lançada quando uma propriedade não é encontrada.
 */
public class PropertyNotFoundException extends RuntimeException {

    public PropertyNotFoundException(UUID id) {
        super("Property not found with ID: " + id);
    }
}