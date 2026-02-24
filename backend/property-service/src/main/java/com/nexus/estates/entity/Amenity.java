package com.nexus.estates.entity;

import jakarta.persistence.*;


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
public class Amenity {

    /** Identificador único da comodidade (Chave Primária). */
    @Id
    @GeneratedValue
    private Long id;

    /** Nome descritivo da comodidade. Deve ser único no sistema. */
    @Column(nullable = false, unique = true)
    private String name;

    /** Categoria à qual a comodidade pertence (ex: LAZER, SEGURANÇA, CONFORTO). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AmenityCategory category;

    /* Getters & Setters */

    /**
     * @return o identificador único da comodidade
     */
    public Long getId() {
        return id;
    }

    /**
     * @param id novo identificador para a comodidade
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return o nome da comodidade
     */
    public String getName() {
        return name;
    }

    /**
     * @param name novo nome para a comodidade
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return a categoria da comodidade
     */
    public AmenityCategory getCategory() {
        return category;
    }

    /**
     * @param category nova categoria a definir
     */
    public void setCategory(AmenityCategory category) {
        this.category = category;
    }
}