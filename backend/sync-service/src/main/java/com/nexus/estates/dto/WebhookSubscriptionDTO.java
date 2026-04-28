package com.nexus.estates.dto;

import com.nexus.estates.entity.WebhookSubscription;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Namespace estrito para Data Transfer Objects (DTOs) de Subscrições de Webhooks.
 * <p>
 * Esta classe utiliza {@code record} para garantir a imutabilidade dos dados
 * transferidos entre as camadas de apresentação e serviço. Atua como um namespace
 * para agrupar as estruturas de request e response relacionadas com webhooks.
 * Impede a instanciação direta por ser uma classe utilitária.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2023-11-01
 * @see com.nexus.estates.entity.WebhookSubscription
 */
public final class WebhookSubscriptionDTO {

    /**
     * Construtor privado para impedir a instanciação desta classe utilitária/namespace.
     *
     * @throws UnsupportedOperationException se tentarem instanciar via reflexão.
     */
    private WebhookSubscriptionDTO() {
        throw new UnsupportedOperationException("Esta classe é um namespace e não pode ser instanciada.");
    }

    /**
     * Payload esperado quando o utilizador pede para criar um novo webhook.
     * Representa os dados necessários fornecidos pelo cliente da API.
     *
     * @param targetUrl O URL de destino para onde os eventos do webhook serão enviados. Deve ser um URL válido (HTTP/HTTPS).
     * @param subscribedEvents A lista de eventos que o cliente deseja subscrever (ex: 'booking.created'). Não pode estar vazia.
     */
    @Schema(description = "Payload esperado quando o utilizador pede para criar um novo webhook.")
    public record CreateRequest(
            @Schema(description = "URL de destino para o webhook", example = "https://meu-dominio.com/webhook", requiredMode = Schema.RequiredMode.REQUIRED)
            @NotBlank(message = "O URL de destino é obrigatório.")
            @Pattern(regexp = "^https?://.+", message = "O formato do URL é inválido. (ex: https://meu-dominio.com/webhook)")
            String targetUrl,

            @Schema(description = "Lista de eventos subscritos", example = "[\"booking.created\"]", requiredMode = Schema.RequiredMode.REQUIRED)
            @NotEmpty(message = "Deve subscrever pelo menos um evento (ex: 'booking.created').")
            List<String> subscribedEvents
    ) {
    }

    /**
     * Resposta padrão ao listar ou consultar webhooks.
     * Esta resposta omite intencionalmente o segredo de assinatura ('secret') por motivos de segurança,
     * devolvendo apenas metadados descritivos sobre o webhook.
     *
     * @param id Identificador único da subscrição de webhook.
     * @param userId Identificador do utilizador que criou a subscrição.
     * @param targetUrl O URL configurado para receber as notificações.
     * @param isActive Estado atual do webhook (ativo/inativo).
     * @param subscribedEvents Lista de eventos que estão a ser escutados.
     * @param createdAt Data e hora em que a subscrição foi criada.
     */
    @Schema(description = "Resposta padrão ao listar ou consultar webhooks (omite o secret).")
    public record Response(
            @Schema(description = "ID do webhook", example = "1")
            Long id,
            @Schema(description = "ID do utilizador", example = "100")
            Long userId,
            @Schema(description = "URL de destino configurado", example = "https://meu-dominio.com/webhook")
            String targetUrl,
            @Schema(description = "Indica se o webhook está ativo", example = "true")
            boolean isActive,
            @Schema(description = "Eventos atualmente subscritos", example = "[\"booking.created\"]")
            List<String> subscribedEvents,
            @Schema(description = "Data de criação")
            OffsetDateTime createdAt
    ) {
        /**
         * Método estático de fábrica (Factory Method) para converter uma entidade {@link WebhookSubscription}
         * no seu correspondente DTO {@link Response}.
         *
         * @param entity A entidade de domínio a converter.
         * @return O DTO preenchido com os dados da entidade, adequado para ser retornado na API.
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
     * Resposta exclusiva para o momento da criação de um novo webhook.
     * <p>
     * Esta é a <strong>única</strong> vez que o 'secret' é devolvido ao cliente.
     * O 'secret' é utilizado pelo cliente para validar a assinatura criptográfica dos payloads recebidos.
     * </p>
     *
     * @param id Identificador único da subscrição de webhook.
     * @param userId Identificador do utilizador que criou a subscrição.
     * @param targetUrl O URL configurado para receber as notificações.
     * @param isActive Estado atual do webhook (ativo/inativo).
     * @param subscribedEvents Lista de eventos que estão a ser escutados.
     * @param createdAt Data e hora em que a subscrição foi criada.
     * @param secret O segredo criptográfico gerado. (Deve ser armazenado de forma segura pelo cliente).
     */
    @Schema(description = "Resposta exclusiva para o momento da criação. Única vez que o 'secret' é devolvido ao cliente.")
    public record CreatedResponse(
            @Schema(description = "ID do webhook", example = "1")
            Long id,
            @Schema(description = "ID do utilizador", example = "100")
            Long userId,
            @Schema(description = "URL de destino configurado", example = "https://meu-dominio.com/webhook")
            String targetUrl,
            @Schema(description = "Indica se o webhook está ativo", example = "true")
            boolean isActive,
            @Schema(description = "Eventos atualmente subscritos", example = "[\"booking.created\"]")
            List<String> subscribedEvents,
            @Schema(description = "Data de criação")
            OffsetDateTime createdAt,
            @Schema(description = "Segredo gerado para assinatura HMAC. Mostrado APENAS na criação.", example = "a1b2c3d4e5f6...")
            String secret
    ) {
        /**
         * Método estático de fábrica (Factory Method) para a criação.
         * Combina a entidade com o segredo recém-gerado, construindo o DTO completo para retornar ao cliente.
         *
         * @param entity A entidade de domínio acabada de ser guardada.
         * @param secret O segredo em texto limpo gerado durante a criação.
         * @return O DTO contendo todos os dados, incluindo o segredo.
         */
        public static CreatedResponse fromEntity(WebhookSubscription entity, String secret) {
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