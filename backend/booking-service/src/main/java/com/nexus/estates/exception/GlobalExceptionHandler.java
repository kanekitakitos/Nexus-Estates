package com.nexus.estates.exception;

import com.nexus.estates.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Manipulador global de exceções para a API.
 * <p>
 * Interceta exceções lançadas pelos controladores e converte-as em respostas HTTP padronizadas
 * utilizando o formato {@link ErrorResponse} da common-library.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Trata conflitos de reserva (ex: Double Booking).
     *
     * @param ex A exceção de conflito capturada.
     * @param request O pedido HTTP que originou o erro.
     * @return ResponseEntity com status 409 (Conflict) e detalhes do erro.
     */
    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(BookingConflictException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error(HttpStatus.CONFLICT.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    /**
     * Trata erros de validação de dados de entrada (@Valid).
     * <p>
     * Agrega todos os erros de campo numa única mensagem legível.
     * </p>
     *
     * @param ex A exceção contendo os erros de validação.
     * @param request O pedido HTTP que originou o erro.
     * @return ResponseEntity com status 400 (Bad Request) e lista de campos inválidos.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Error")
                .message(errorMessage)
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Trata exceções genéricas não previstas.
     * <p>
     * Serve como rede de segurança para evitar que stack traces sejam expostos ao cliente.
     * </p>
     *
     * @param ex A exceção genérica capturada.
     * @param request O pedido HTTP que originou o erro.
     * @return ResponseEntity com status 500 (Internal Server Error).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred. Please contact support.")
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
