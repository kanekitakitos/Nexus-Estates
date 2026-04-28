package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entidade de faturação emitida pelo provider configurado (Moloni/Vendus/Mock).
 *
 * <p>Armazena identificador legal, URL do PDF e estado de emissão.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
@Entity
@Table(name = "invoices")
@Getter
@Setter
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(nullable = false, length = 32)
    private String provider;

    @Column(name = "legal_id", length = 128)
    private String legalId;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
