package com.nexus.estates.exception;


/**
 * Exceção lançada quando uma propriedade não é encontrada.
 */
public class PropertyNotFoundException extends RuntimeException {

    public PropertyNotFoundException(Long id) {
        super("Property not found with ID: " + id);
    }
}