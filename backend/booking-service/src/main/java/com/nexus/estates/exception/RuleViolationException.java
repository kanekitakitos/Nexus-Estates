package com.nexus.estates.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando uma tentativa de reserva viola as regras operacionais da propriedade.
 *
 * <p>Exemplos de violações:</p>
 * <ul>
 *     <li>Número de noites inferior ao mínimo exigido.</li>
 *     <li>Número de noites superior ao máximo permitido.</li>
 *     <li>Tentativa de reserva com antecedência insuficiente (Lead Time).</li>
 * </ul>
 *
 * <p>Esta exceção é mapeada para o código HTTP 400 (Bad Request).</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class RuleViolationException extends RuntimeException {

    /**
     * Cria uma nova exceção com uma mensagem descritiva da regra violada.
     *
     * @param message A mensagem de erro explicativa.
     */
    public RuleViolationException(String message) {
        super(message);
    }
}