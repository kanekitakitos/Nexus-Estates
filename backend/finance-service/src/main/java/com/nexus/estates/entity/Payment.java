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

    /**
     * Identificador único do pagamento na base de dados local
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID da reserva (no booking-service) á qual este pagamento pertence
     */
    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    /**
     * Nome do gateway de pagamento utilizado (ex: Stripe)
     */
    @Column(nullable = false, length = 32)
    private String provider;

    /**
     * Identificador único da transação gerado pelo prrovedor externo
     */
    @Column(name = "payment_intent_id", nullable = false, length = 128, unique = true)
    private String paymentIntentId;

    /**
     * Código ISO da moeda utilizada na transação
     */
    @Column(nullable = false, length = 8)
    private String currency;

    /**
     * Valor total cobrado na transação
     */
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /**
     * Estado atual do pagamento
     */
    @Column(nullable = false, length = 32)
    private String status;

    /**
     * Data e hora em que o registo foi criado
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Sata e hora da última alteração de estado do pagamento
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Callback do JPA invocado automaticamente antes de inserir o registo pela primeira vez
     * <p>
     *     Garante que as datas de criação e atualização são preenchidas com o momento exato da inserção
     * </p>
     */
    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }


    /**
     * Callback do JPA invocado automaticamente antes de qualquer atualização na base de dados
     * <p>
     *     Atualiza o timestamp de modicação para fins de auditoria
     * </p>
     */
    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
