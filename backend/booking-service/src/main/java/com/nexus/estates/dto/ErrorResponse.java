package com.nexus.estates.dto;

import java.time.LocalDateTime;

/**
 * Estrutura padronizada para retorno de erros da API.
 *
 * @param timestamp Momento em que o erro ocorreu.
 * @param status Código de status HTTP.
 * @param error Descrição curta do erro.
 * @param message Mensagem detalhada para o cliente.
 * @param path Caminho da requisição que gerou o erro.
 *
 * @author Nexus Estates Team
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {}