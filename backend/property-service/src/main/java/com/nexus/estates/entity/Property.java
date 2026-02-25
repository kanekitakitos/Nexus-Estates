package com.nexus.estates.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;


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
     * Descrição detalhada da propriedade.
     *
     * <p>Pode conter informações adicionais como características,
     * comodidades ou observações relevantes.</p>
     */
    @Column(columnDefinition = "TEXT")
    private String description;

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
     * Obtém a descrição da propriedade.
     *
     * @return descrição da propriedade
     */
    public String getDescription() {
        return description;
    }

    /**
     * Define a descrição da propriedade.
     *
     * @param description nova descrição
     */
    public void setDescription(String description) {
        this.description = description;
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
