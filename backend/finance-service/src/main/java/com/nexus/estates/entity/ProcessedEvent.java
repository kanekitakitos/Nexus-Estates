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
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String provider;

    @Column(name = "event_id", nullable = false, length = 128)
    private String eventId;

    @Column(name = "event_type", nullable = false, length = 128)
    private String eventType;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    @PrePersist
    void onCreate() {
        processedAt = LocalDateTime.now();
    }
}
