package com.nexus.estates.exception;


/**
 * Exceção lançada quando uma Amenity não é encontrada.
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public class AmenityNotFoundException extends RuntimeException {

    /**
     * Contrói a exceção indicando o ID da comodidade em falta
     * @param id O identificador úncio da comodidade
     */
    public AmenityNotFoundException(Long id) {
        super("Amenity with id " + id + " not found");
    }
}
