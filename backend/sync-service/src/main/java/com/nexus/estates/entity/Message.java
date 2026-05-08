package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entidade que representa uma mensagem de chat persistida no sync-service.
 * <p>
 * Armazena o histórico de conversas localmente para garantir persistência permanente,
 * independente da política de retenção do serviço de tempo real externo.
 * </p>
 *
 * <p>Modelo:</p>
 * <ul>
 *   <li>{@code contextType/contextId} identificam a thread (BOOKING, PROPERTY_INQUIRY, ...).</li>
 *   <li>{@code bookingId} é um campo legado para compatibilidade/migração.</li>
 * </ul>
 */

@Entity
@Table(name = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Contexto lógico da mensagem (BOOKING, PROPERTY_INQUIRY).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "context_type", nullable = false)
    private MessageContextType contextType;

    /**
     * Identificador do contexto:
     * - BOOKING: bookingId
     * - PROPERTY_INQUIRY: inquiryId
     */
    @Column(name = "context_id", nullable = false)
    private Long contextId;

    /**
     * Campo legado (compatibilidade) para mensagens antigas de booking.
     */
    @Column(name = "booking_id")
    private Long bookingId;

    /**
     * ID do remetente da mensagem (pode ser um usuário ou sistema).
     */
    @Column(nullable = false)
    private String senderId;

    /**
     * Conteúdo textual da mensagem.
     * Em uma implementação futura, pode ser expandido para suportar rich text ou anexos.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Data e hora em que a mensagem foi criada/recebida.
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
