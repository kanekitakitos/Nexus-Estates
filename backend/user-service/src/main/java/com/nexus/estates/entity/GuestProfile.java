package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.util.List;

/**
 * Entidade JPA que representa o Perfil expandido de um hóspede
 * <p>
 *     Esta entidade complementa a conta de utilizador ({@link User}) com informações exclusivas
 *     para a gestão hoteleira e relacionamento com o cliente (CRM interno), como notas privadas
 *     e etiquetas de categorização
 *     Está anotada com {@code @Audited} para manter o histórico de alterações no Envers
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Entity
@Table(name = "guest_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Audited
public class GuestProfile {

    /**
     * Identificador único do perfil de hóspede
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * A conta de utilizador principal associada a este perfil
     * Relação de 1-para-1 garantida através da restrição de unicidade
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * Notas internas sobre o hóspede
     * Armazenado como TEXT para suportar descrições longas
     */
    @Column(columnDefinition = "TEXT")
    private String internalNotes;


    /**
     * Lista etiquetas (tags) para segmentação rápida (ex: "VIP", "Late Checkout")
     * Guardada numa tabela de coleção separada gerida pelo JPA
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "guest_profile_tags", joinColumns = @JoinColumn(name = "guest_profile_id"))
    @Column(name = "tag")
    private List<String> tags;
}
