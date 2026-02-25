package com.nexus.estates.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando uma operação tenta aceder a um utilizador que não existe.
 * <p>
 * Resulta numa resposta HTTP 404 (Not Found).
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
