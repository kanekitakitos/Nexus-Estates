package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;


/**
 * Entidade JPA que representa a subscrição de um Webhook por parte de um utilizador
 * <p>
 *     Armazena as configurações necessárias para notificar sistemas externos sobre eventos
 *     que ocorrem na plataforma Nexus Estates. Incluiu o URL de destino para as chamadas HTTP POST
 *     e o segredo criptográdico usado para assianlar e validar a autenticidade dos payloads enviados
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Entity
@Table(name = "webhook_subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookSubscription {

    //Identificador único da subscrição de webhook
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    //ID do utilizador (proprietário) que configurou este webhook
    @Column(name = "user_id", nullable = false)
    private long userId;

    //O URL externo que irá receber os payloads HTTP POST dos eventos
    @Column(name = "target_url", nullable = false)
    private String targetUrl;

    //A chave secreta (texto limpo) gerada no momento da criação, usada para calcular a assinatura HMAC-SHA256
    @Column(nullable = false)
    private String secret;

    //Indica se o webhook está ativo. Se falso, os eventos associados não serão enviados
    @Column(name = "is_active")
    private boolean isActive = true;

    //String separada por vírgulas contendon aas chaves dos eventos subscritos
    @Column(name = "subscribed_events")
    private String subscribedEvents;

    //Registo exato do momento em que a subscrição foi criada
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    //Registo do momento em que a subscrição sofreu a última alteração
    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
