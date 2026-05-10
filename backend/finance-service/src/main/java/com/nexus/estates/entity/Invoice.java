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

    /**
     * Identificador único interno da fatura na base de dados
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Referência para o pagamento que originou a emissão deste documento fiscal
     * <p>
     *     Mapeamento de muitos-para-um, garantindo que a fatura está sempre vinculada a uma transação financeira válida
     * </p>
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;


    /**
     * Identificador do software ou estratégia de faturação que gerou o documento (ex: "MOLONI", "MOCK")
     */
    @Column(nullable = false, length = 32)
    private String provider;

    /**
     * Identificador com validade legal devolvido pela Autoridade Tributária ou provedor
     */
    @Column(name = "legal_id", length = 128)
    private String legalId;

    /**
     * URL ou link de acesso direto para download do documento original em formato PDF
     */
    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    /**
     * Estado atual do ciclo de vida da fatura (ex: "PENDING", "ISSUED", "FAILED")
     */
    @Column(nullable = false, length = 32)
    private String status;

    /**
     * Data e hora exatas em que o documento fiscal foi confirmado e emitido com sucesso pelo provedor externo
     */
    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    /**
     * Data e hora em que este registo de intenção/rascunho de fatura foi criado na nossa base de dados
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


    /**
     * Callback do ciclo de vida do JPA invocado automaticamente antes da primeira inserção na base de dados
     * <p>
     *     Garante que o carimbo temporal de criação ({@code createdAt}) é preenchido com o momento exato do registo
     * </p>
     */
    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
