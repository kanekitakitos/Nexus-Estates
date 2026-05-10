package com.nexus.estates.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Representa uma conversa iniciada a partir de uma propriedade (PROPERTY_INQUIRY).
 *
 * <p>Notas de negócio:</p>
 * <ul>
 *   <li>Uma inquiry é única por (propertyId, guestId), prevenindo threads duplicadas.</li>
 *   <li>A “equipa” da propriedade (PRIMARY_OWNER/MANAGER/STAFF) acede à mesma thread (shared inbox).</li>
 * </ul>
 */
@Entity
@Table(name = "property_inquiries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyInquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "guest_id", nullable = false)
    private Long guestId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
