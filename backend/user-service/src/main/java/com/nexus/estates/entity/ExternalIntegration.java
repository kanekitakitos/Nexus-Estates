package com.nexus.estates.entity;

import com.nexus.estates.config.EncryptedStringAttributeConverter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

@Entity
@Table(name = "external_integrations",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_provider", columnNames = {"user_id", "provider_name"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Audited
@Schema(description = "Integração externa associada a um utilizador (API Key encriptada)")
/**
 * Entidade de integrações externas (API Keys) associadas a utilizadores.
 * <p>
 * Garante armazenamento seguro da credencial através de encriptação AES-256-GCM.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 */
public class ExternalIntegration {

    /**
     * Identificador único da integração externa.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Utilizador proprietário da integração.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Nome do provider externo (tipado via enum).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "provider_name", nullable = false, length = 50)
    private ExternalProviderName providerName;

    /**
     * API Key encriptada com AES-256-GCM usando {@link EncryptedStringAttributeConverter}.
     */
    @Convert(converter = EncryptedStringAttributeConverter.class)
    @Column(name = "api_key", nullable = false, columnDefinition = "TEXT")
    private String apiKey;

    /**
     * Estado da integração (ativa/inativa).
     */
    @Column(name = "active", nullable = false)
    private boolean active;
}
