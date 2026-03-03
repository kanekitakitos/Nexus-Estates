package com.nexus.estates.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Entidade que representa uma propriedade imobiliária no sistema.
 *
 * <p>Uma propriedade corresponde a um imóvel que pode ser listado,
 * reservado ou gerido dentro da plataforma Nexus Estates.</p>
 *
 * <p>Esta entidade é persistida na tabela <b>properties</b>.</p>
 *
 * @author Nexus Estates Team
 */
@Entity
@Table(name = "properties")
public class Property {

    /**
     * Identificador único da propriedade.
     *
     * <p>Gerado automaticamente pelo sistema.</p>
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nome / título da propriedade.
     *
     * <p>Representa a designação principal do imóvel.</p>
     */
    @Column(nullable = false)
    private String name;

    /**
     * Descrição detalhada da propriedade suportando múltiplos idiomas.
     *
     * <p>Armazenada como JSONB para permitir chaves de idioma (ex: pt, en).</p>
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> description;

    /**
     * Localização resumida ou região da propriedade.
     */
    @Column(nullable = false)
    private String location;

    /**
     * Cidade onde a propriedade está localizada.
     */
    @Column(nullable = false)
    private String city;

    /**
     * Endereço completo da propriedade.
     */
    @Column(nullable = false)
    private String address;

    /**
     * Preço base por noite.
     *
     * <p>Representa o valor monetário base associado ao imóvel.</p>
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    /**
     * Número máximo de hóspedes permitidos.
     */
    @Column(nullable = false)
    private Integer maxGuests;

    /**
     * Estado do anúncio.
     *
     * <p>Indica se a propriedade está ativa na plataforma.</p>
     */
    @Column(nullable = false)
    private Boolean isActive = true;

    /**
     * Conjunto de comodidades associadas à propriedade.
     *
     * <p>Relação Many-to-Many que utiliza uma tabela de junção para mapear
     * características como WiFi, Piscina, etc.</p>
     */
    @ManyToMany
    @JoinTable(
            name = "property_amenities",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private Set<Amenity> amenities = new HashSet<>();

    /* Getters & Setters */

    /**
     * @return conjunto de comodidades da propriedade
     */
    public Set<Amenity> getAmenities() {
        return amenities;
    }

    /**
     * @param amenities novo conjunto de comodidades
     */
    public void setAmenities(Set<Amenity> amenities) {
        this.amenities = amenities;
    }

    /**
     * Obtém o identificador da propriedade.
     *
     * @return ID da propriedade
     */
    public Long getId() {
        return id;
    }

    /**
     * Define o identificador da propriedade.
     *
     * @param id novo ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Obtém o nome da propriedade.
     *
     * @return nome da propriedade
     */
    public String getName() {
        return name;
    }

    /**
     * Define o nome da propriedade.
     *
     * @param name novo nome
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Obtém a descrição da propriedade (Mapa de idiomas).
     *
     * @return mapa de descrições
     */
    public Map<String, String> getDescription() {
        return description;
    }

    /**
     * Define a descrição da propriedade.
     *
     * @param description novo mapa de descrições
     */
    public void setDescription(Map<String, String> description) {
        this.description = description;
    }

    /**
     * Obtém a localização da propriedade.
     *
     * @return localização
     */
    public String getLocation() {
        return location;
    }

    /**
     * Define a localização da propriedade.
     *
     * @param location nova localização
     */
    public void setLocation(String location) {
        this.location = location;
    }

    /**
     * Obtém a cidade da propriedade.
     *
     * @return cidade
     */
    public String getCity() {
        return city;
    }

    /**
     * Define a cidade da propriedade.
     *
     * @param city nova cidade
     */
    public void setCity(String city) {
        this.city = city;
    }

    /**
     * Obtém o endereço da propriedade.
     *
     * @return endereço
     */
    public String getAddress() {
        return address;
    }

    /**
     * Define o endereço da propriedade.
     *
     * @param address novo endereço
     */
    public void setAddress(String address) {
        this.address = address;
    }

    /**
     * Obtém o preço base da propriedade.
     *
     * @return preço base
     */
    public BigDecimal getBasePrice() {
        return basePrice;
    }

    /**
     * Define o preço base da propriedade.
     *
     * @param basePrice novo preço base
     */
    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    /**
     * Obtém o número máximo de hóspedes.
     *
     * @return limite de hóspedes
     */
    public Integer getMaxGuests() {
        return maxGuests;
    }

    /**
     * Define o número máximo de hóspedes.
     *
     * @param maxGuests novo limite
     */
    public void setMaxGuests(Integer maxGuests) {
        this.maxGuests = maxGuests;
    }

    /**
     * Verifica se a propriedade está ativa.
     *
     * @return estado do anúncio
     */
    public Boolean getIsActive() {
        return isActive;
    }

    /**
     * Define o estado da propriedade.
     *
     * @param active novo estado
     */
    public void setIsActive(Boolean active) {
        isActive = active;
    }
}