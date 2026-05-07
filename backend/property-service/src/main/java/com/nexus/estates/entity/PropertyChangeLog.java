package com.nexus.estates.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * Entidade que representa o registo histórico de alterações (Auditorria) de uma propriedade
 * <p>
 *     Armazena de forma granular as modificações feitas aos atributos de um imóvel,
 *     permitindo rastrear quem fez a alteração, quando ocorreu, e qual era o valor antes e depois da modificação
 *     É essencial para a resolução de disputas e garante total transparência na gestão
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */

//Getter e Setters
@Entity
@Table(name = "property_change_logs")
public class PropertyChangeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "property_id", nullable = false)
    private Long propertyId;
    @Column(name = "user_id")
    private Long userId;
    @Column(nullable = false)
    private String action;
    @Column(name = "field_name")
    private String fieldName;
    @Column(name = "old_value", length = 1000)
    private String oldValue;
    @Column(name = "new_value", length = 1000)
    private String newValue;
    @Column(name = "changed_at", nullable = false)
    private OffsetDateTime changedAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }
    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }
    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
    public OffsetDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(OffsetDateTime changedAt) { this.changedAt = changedAt; }
}
