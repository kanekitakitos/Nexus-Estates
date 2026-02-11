package com.nexus.estates.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção personalizada para indicar conflitos de agendamento (Double Booking).
 * <p>
 * Mapeada automaticamente para o status HTTP 409 (Conflict).
 * Deve ser lançada quando se tenta criar uma reserva para datas já ocupadas.
 * </p>
 *
 * @author Nexus Estates Team
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class BookingConflictException extends RuntimeException
{
    /**
     * Construtor da exceção.
     *
     * @param message A mensagem descritiva do erro.
     */
    public BookingConflictException(String message) {
        super(message);
    }
}