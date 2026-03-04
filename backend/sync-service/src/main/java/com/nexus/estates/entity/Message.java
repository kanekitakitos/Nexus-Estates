package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entidade que representa uma mensagem de chat associada a uma reserva.
 * <p>
 * Armazena o histórico de conversas localmente para garantir persistência permanente,
 * independente da política de retenção do serviço de tempo real externo.
 * </p>
 * Para criar tabela
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
     * ID da reserva à qual esta mensagem pertence.
     * Serve como chave de agrupamento para o histórico do chat.
     */
    @Column(nullable = false)
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
