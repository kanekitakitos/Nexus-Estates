package com.nexus.estates.exception;

import java.util.UUID;

/**
 * Exceção lançada quando uma Amenity não é encontrada.
 *
 * @author Nexus Estates Team
 */
public class AmenityNotFoundException extends RuntimeException {

    public AmenityNotFoundException(UUID id) {
        super("Amenity with id " + id + " not found");
    }
}
