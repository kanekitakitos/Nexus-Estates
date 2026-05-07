package com.nexus.estates.exception;


/**
 * Exceção lançada quando uma propriedade não é encontrada.
 * @author Nexus Estates Team
 * @version 1.0
 */
public class PropertyNotFoundException extends RuntimeException {

    /**
     * Constrói a exceção com uma mensagem detalahada contendo o ID que falhou
     * @param id O identificador único da propriedade que foi procurada
     */
    public PropertyNotFoundException(Long id) {
        super("Propriedade não encontrada com o ID: " + id);
    }
}
