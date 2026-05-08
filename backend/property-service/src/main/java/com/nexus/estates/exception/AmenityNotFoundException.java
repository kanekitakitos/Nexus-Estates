package com.nexus.estates.exception;


/**
 * Exceção lançada quando uma Amenity não é encontrada.
 *
 * @author Nexus Estates Team
 */
public class AmenityNotFoundException extends RuntimeException {

    public AmenityNotFoundException(Long id) {
        super("Amenity with id " + id + " not found");
    }
}
