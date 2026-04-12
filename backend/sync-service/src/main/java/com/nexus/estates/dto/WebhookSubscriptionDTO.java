package com.nexus.estates.dto;

import com.nexus.estates.entity.WebhookSubscription;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Namespace estrito para DTOs de Subscrições de Webhooks.
 * Utiliza records para imutabilidade e impede a instanciação da classe base.
 */
public final class WebhookSubscriptionDTO {

    // Impede a instanciação desta classe utilitária/namespace
    private WebhookSubscriptionDTO() {
        throw new UnsupportedOperationException("Esta classe é um namespace e não pode ser instanciada.");
    }

    /**
     * Payload esperado quando o utilizador pede para criar um novo webhook.
     */
    public record CreateRequest(
            @NotBlank(message = "O URL de destino é obrigatório.")
            @Pattern(regexp = "^https?://.+", message = "O formato do URL é inválido. (ex: https://meu-dominio.com/webhook)")
            String targetUrl,

            @NotEmpty(message = "Deve subscrever pelo menos um evento (ex: 'booking.created').")
            List<String> subscribedEvents
    )
    {
    }

    /**
     * Resposta padrão ao listar ou consultar webhooks (omite o secret).
     */
    public record Response(
            Long id,
            Long userId,
            String targetUrl,
            boolean isActive,
            List<String> subscribedEvents,
            OffsetDateTime createdAt
    ) {
        /**
         * Método estático de fábrica (Factory Method) para converter a Entidade em DTO.
         */
        public static Response fromEntity(WebhookSubscription entity) {
            List<String> eventsList = Arrays.asList(entity.getSubscribedEvents().split(","));
            return new Response(
                    entity.getId(),
                    entity.getUserId(),
                    entity.getTargetUrl(),
                    entity.isActive(),
                    eventsList,
                    entity.getCreatedAt()
            );
        }
    }

    /**
     * Resposta exclusiva para o momento da criação.
     * Única vez que o 'secret' é devolvido ao cliente.
     */
    public record CreatedResponse(
            Long id,
            Long userId,
            String targetUrl,
            boolean isActive,
            List<String> subscribedEvents,
            OffsetDateTime createdAt,
            String secret
    )
    {
        /**
         * Método estático de fábrica (Factory Method) para a criação.
         * Recebe a entidade e o segredo recém-gerado para construir a resposta.
         */
        public static CreatedResponse fromEntity(WebhookSubscription entity, String secret)
        {
            List<String> eventsList = Arrays.asList(entity.getSubscribedEvents().split(","));
            return new CreatedResponse(
                    entity.getId(),
                    entity.getUserId(),
                    entity.getTargetUrl(),
                    entity.isActive(),
                    eventsList,
                    entity.getCreatedAt(),
                    secret
            );
        }
    }
}