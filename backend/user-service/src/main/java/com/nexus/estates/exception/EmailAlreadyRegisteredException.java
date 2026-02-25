package com.nexus.estates.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando se tenta registar um email que já existe na base de dados.
 * <p>
 * Resulta numa resposta HTTP 409 (Conflict).
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 * @see com.nexus.estates.exception.GlobalExceptionHandler
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class EmailAlreadyRegisteredException extends RuntimeException {
    public EmailAlreadyRegisteredException(String message) {
        super(message);
    }
}
