package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;

/**
 * Entidade que representa uma Amenity (Comodidade ou Etiqueta) no sistema.
 *
 * <p>As comodidades são utilizadas para caraterizar as propriedades, permitindo
 * classificar serviços ou atributos específicos que valorizam o imóvel.</p>
 *
 * <p>Exemplos comuns:</p>
 * <ul>
 * <li>Piscina</li>
 * <li>WiFi de alta velocidade</li>
 * <li>Ar Condicionado</li>
 * <li>Estacionamento Privado</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-12
 */
@Entity
@Table(name = "amenities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Amenity {

    /** Identificador único da comodidade (Chave Primária). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** * Nome descritivo da comodidade.
     * <p>Utiliza JSONB para suportar múltiplos idiomas (Internacionalização).</p>
     * Ex: {"pt": "Piscina", "en": "Pool"}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, String> name;

    /** Categoria à qual a comodidade pertence (ex: LAZER, SEGURANÇA, CONFORTO). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AmenityCategory category;

    /** * Nome do ícone para exibição no frontend.
     * Ex: "fa-wifi", "pool"
     */
    private String icon;
}