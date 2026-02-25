package com.nexus.estates.exception;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador global para tratamento de exceções na aplicação.
 * <p>
 * Utiliza {@link RestControllerAdvice} para intercetar exceções e formatá-las
 * numa resposta HTTP consistente, utilizando o wrapper {@link ApiResponse}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Constrói uma resposta de erro padronizada.
     *
     * @param ex A exceção original.
     * @param status O status HTTP a ser retornado.
     * @param request O pedido HTTP que causou o erro.
     * @param validationErrors Um mapa opcional de erros de validação.
     * @return Um {@link ResponseEntity} contendo o {@link ApiResponse} de erro.
     */
    private <T> ResponseEntity<ApiResponse<T>> buildErrorResponse(Exception ex, HttpStatus status, HttpServletRequest request, Map<String, String> validationErrors) {
        ErrorResponse.ErrorResponseBuilder errorBuilder = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(validationErrors != null ? "Um ou mais campos são inválidos." : ex.getMessage())
                .path(request.getRequestURI());

        if (validationErrors != null) {
            errorBuilder.validationErrors(validationErrors);
        }

        ApiResponse<T> apiResponse = ApiResponse.<T>builder()
                .success(false)
                .message(validationErrors != null ? "Erro de validação" : ex.getMessage())
                .error(errorBuilder.build())
                .build();

        return new ResponseEntity<>(apiResponse, status);
    }

    /**
     * Trata exceções de validação de DTOs (Bean Validation).
     *
     * @param ex A exceção {@link MethodArgumentNotValidException}.
     * @param request O pedido HTTP.
     * @return Um ResponseEntity com status 400 (Bad Request) e os detalhes dos campos inválidos.
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

    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ResponseEntity<ApiResponse<Object>> handleEmailAlreadyRegistered(EmailAlreadyRegisteredException ex, HttpServletRequest request) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request, null);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleUserNotFound(UserNotFoundException ex, HttpServletRequest request) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request, null);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidCredentials(InvalidCredentialsException ex, HttpServletRequest request) {
        return buildErrorResponse(ex, HttpStatus.UNAUTHORIZED, request, null);
    }
}
