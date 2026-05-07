package com.nexus.estates.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;

import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gestor global de exceções para o Property Service.
 * Captura erros e retorna uma resposta JSON amigável em vez de um erro 500 genérico.
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@ControllerAdvice
public class GlobalExceptionHandler {


    /**
     * Trata os casos em que uma propriedade procurada não existe
     * @param ex A exceção lançada pelo serviço
     * @return Uma resposta HTTP 404 (Not Found) contendo a timestamp e a mensagem de erro
     */
    @ExceptionHandler(PropertyNotFoundException.class)
    public ResponseEntity<Object> handlePropertyNotFound(PropertyNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    /**
     * Trata os casos em que uma comodidade pesquisada não é encontrada
     * @param ex A exceção original
     * @return Uma resposta HTTP 404 (Not Found) formatada
     */
    @ExceptionHandler(AmenityNotFoundException.class)
    public ResponseEntity<Object> handleAmenityNotFound(AmenityNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    /**
     * Interceta tentativas de acesso a recursos sem as devidas permissões (Roles /Ownership)
     * @param ex A exceção de segurança do Spring
     * @return Uma resposta HTTP 403 (Forbidden) avisando que o acesso foi negado
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", "Acesso negado.");
        body.put("details", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    /**
     * Trata erros de validação genéricos ou regras de negócio violadas
     * @param ex A exceção indicando o argumento ilegal
     * @return Uma resposta HTTP 400 (Bad Request)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Rede de segurança (Fallbak) para todas as exceções não previstas
     * <p>
     *     Garante que erros críticos de sistema (NullPointers, problemas de Base de Dados)
     *     nunca expõem a infraestrututra interna ao cliente
     * </p>
     * @param ex A exceção inesperada
     * @return Uma resposta HTTP 500 (Internal Server Error) com uma mensagem genérica de segurança
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", "Ocorreu um erro interno no servidor.");
        body.put("details", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
