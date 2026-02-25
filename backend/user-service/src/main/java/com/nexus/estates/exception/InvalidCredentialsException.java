package com.nexus.estates.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada durante o processo de login quando a password fornecida não corresponde
 * à armazenada para o utilizador.
 * <p>
 * Resulta numa resposta HTTP 401 (Unauthorized).
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
