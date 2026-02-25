package com.nexus.estates.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando o token de autenticação é inválido ou expirou.
 * <p>
 * Resulta numa resposta HTTP 400 (Bad Request).
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @see com.nexus.estates.exception.GlobalExceptionHandler
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }
}
