package com.nexus.estates.common.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper genérico para todas as respostas da API.
 * <p>
 * Garante um contrato de resposta consistente para o frontend, encapsulando
 * tanto cenários de sucesso como de erro num formato previsível.
 * </p>
 *
 * @param <T> O tipo do objeto de dados retornado (payload).
 * @author Nexus Estates Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    /** Indica se a operação foi bem-sucedida. */
    private boolean success;

    /** Mensagem informativa ou de feedback para o utilizador. */
    private String message;

    /** O payload da resposta (pode ser nulo em caso de erro). */
    private T data;

    /** Detalhes do erro, caso success seja false. */
    private ErrorResponse error;

    /**
     * Cria uma resposta de sucesso padrão.
     *
     * @param data O objeto de dados a retornar.
     * @param message Mensagem de sucesso.
     * @param <T> O tipo dos dados.
     * @return Uma instância de {@link ApiResponse} configurada para sucesso.
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * Cria uma resposta de erro padrão.
     *
     * @param message A mensagem descritiva do erro.
     * @param errorCode O código interno ou categoria do erro.
     * @param <T> O tipo genérico (geralmente Void em erros).
     * @return Uma instância de {@link ApiResponse} configurada para falha.
     */
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ErrorResponse.builder()
                        .error(errorCode)
                        .message(message)
                        .timestamp(LocalDateTime.now())
                        .build())
                .build();
    }
}