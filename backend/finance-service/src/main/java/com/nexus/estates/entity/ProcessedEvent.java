package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entidade de eventos de provedores já processados (idempotência).
 *
 * <p>Garante que eventos duplicados não terão efeitos colaterais (ex: dupla emissão de invoice).</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
@Entity
@Table(
        name = "processed_events",
        uniqueConstraints = {
                @UniqueConstraint(name = "ux_processed_events_provider_event_id", columnNames = {"provider", "event_id"})
        }
)

@Getter
@Setter
public class ProcessedEvent {

    /**
     * Identificador único do registo de processamento local
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * O sistema que gerou o evento original
     */
    @Column(nullable = false, length = 32)
    private String provider;

    /**
     * O ID único do envento enviadon pelo provedor usado para detetar duplicados
     */
    @Column(name = "event_id", nullable = false, length = 128)
    private String eventId;

    /**
     * O tipo de evento que ocorreu
     */
    @Column(name = "event_type", nullable = false, length = 128)
    private String eventType;

    /**
     * Timestamp exato de quando o evento foi processado com sucesso pelo nosso sistema
     */
    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    /**
     * Callback do JPA invocado automaticamente antes de guardar o evento
     * <p>
     *     Regista o momento exato em que a transação foi data como tratada
     * </p>
     */
    @PrePersist
    void onCreate() {
        processedAt = LocalDateTime.now();
    }
}
