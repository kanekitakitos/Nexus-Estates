package com.nexus.estates.entity;


import com.nexus.estates.common.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Representação persistente de uma Reserva no sistema.
 * <p>
 * Esta entidade mapeia a tabela {@code bookings} e serve como a fonte da verdade para o estado
 * de uma transação de reserva.
 * </p>
 *
 * <p><b>Invariantes:</b></p>
 * <ul>
 *   <li>{@code checkOutDate} deve ser sempre posterior a {@code checkInDate}.</li>
 *   <li>{@code totalPrice} deve ser sempre positivo.</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    /**
     * Identificador único universal (UUID) da reserva.
     * Gerado automaticamente pela estratégia da base de dados.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 Referências Externas (Microservices Decoupling)
    /**
     * Identificador da Propriedade associada.
     * <p>
     * Nota: Não existe chave estrangeira física (FK) para permitir o desacoplamento
     * entre microserviços. A integridade referencial é garantida ao nível da aplicação.
     * </p>
     */
    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    /**
     * Identificador do Utilizador (Hóspede).
     * <p>Referência lógica para o User Service.</p>
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // 📅 Dados da Estadia
    /** Data de início da ocupação. */
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    /** Data de fim da ocupação. */
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    /** Número de hóspedes incluídos na reserva. */
    @Column(name = "guest_count", nullable = false)
    private int guests;

    /**
     * Valor monetário total da reserva.
     * <p>
     * Armazenado com precisão de 2 casas decimais (scale=2) e 10 dígitos totais (precision=10).
     * </p>
     */
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice; // Ex: 1250.50

    /** Código ISO 4217 da moeda (ex: "EUR", "USD"). */
    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "EUR";

    //  Estado da Reserva
    /** Estado atual no ciclo de vida da reserva. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    /**
     * ID da intenção de pagamento do provedor de pagamento.
     */
    @Column(name = "payment_intent_id")
    private String paymentIntentId;

    //  Auditoria
    /** Timestamp de criação do registo (UTC). Imutável. */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /** Timestamp da última alteração do registo (UTC). */
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /** Justificação textual em caso de cancelamento. Nullable. */
    @Column(name = "cancellation_reason")
    private String cancellationReason;
}