package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidade de pagamento processado/gerido pelo finance-service.
 *
 * <p>Representa o estado e dados essenciais da transação (provider, intent, montante, moeda).</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(nullable = false, length = 32)
    private String provider;

    @Column(name = "payment_intent_id", nullable = false, length = 128, unique = true)
    private String paymentIntentId;

    @Column(nullable = false, length = 8)
    private String currency;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
