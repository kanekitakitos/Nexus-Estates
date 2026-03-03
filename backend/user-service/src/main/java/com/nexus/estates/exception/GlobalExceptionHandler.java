package com.nexus.estates.exception;

import com.nexus.estates.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Handler global de exceções do User Service.
 * <p>
 * - Centraliza o tratamento de erros e garante respostas consistentes
 *   usando a common-library ({@link com.nexus.estates.common.dto.ApiResponse}).
 * - Para erros de validação, agrega mensagens por campo.
 * - Para exceções conhecidas, mapeia para o HttpStatus correspondente.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @see com.nexus.estates.common.dto.ApiResponse
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Constrói uma resposta padronizada de erro com detalhes completos.
     * Usa ApiResponse.error(status, error, message, path, validationErrors).
     *
     * @param ex exceção original
     * @param status código HTTP a devolver
     * @param request pedido HTTP que originou o erro
     * @param validationErrors mapa de erros de validação (opcional)
     * @return ResponseEntity com ApiResponse de erro
     */
    private <T> ResponseEntity<ApiResponse<T>> buildErrorResponse(Exception ex, HttpStatus status, HttpServletRequest request, Map<String, String> validationErrors) {
        ApiResponse<T> apiResponse = ApiResponse.error(
                status.value(),
                status.getReasonPhrase(),
                validationErrors != null ? "Erro de validação" : ex.getMessage(),
                request.getRequestURI(),
                validationErrors
        );
        return new ResponseEntity<>(apiResponse, status);
    }

    /**
     * Trata erros de validação (Bean Validation) e devolve 400 com
     * o mapa de campos inválidos.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request, errors);
    }

    /**
     * Trata exceções conhecidas e mapeia para o HttpStatus apropriado:
     * - EmailAlreadyRegisteredException → 409 CONFLICT
     * - UserNotFoundException → 404 NOT_FOUND
     * - InvalidCredentialsException → 401 UNAUTHORIZED
     * - InvalidTokenException → 400 BAD_REQUEST
     * - AccessDeniedException → 403 FORBIDDEN
     */
    @ExceptionHandler({
            EmailAlreadyRegisteredException.class,
            UserNotFoundException.class,
            InvalidCredentialsException.class,
            InvalidTokenException.class,
            AccessDeniedException.class
    })
    public ResponseEntity<ApiResponse<Object>> handleKnownExceptions(Exception ex, HttpServletRequest request) {
        HttpStatus status =
                ex instanceof EmailAlreadyRegisteredException ? HttpStatus.CONFLICT :
                ex instanceof UserNotFoundException ? HttpStatus.NOT_FOUND :
                ex instanceof InvalidCredentialsException ? HttpStatus.UNAUTHORIZED :
                ex instanceof InvalidTokenException ? HttpStatus.BAD_REQUEST :
                ex instanceof AccessDeniedException ? HttpStatus.FORBIDDEN :
                HttpStatus.INTERNAL_SERVER_ERROR;
        return buildErrorResponse(ex, status, request, null);
    }
}
