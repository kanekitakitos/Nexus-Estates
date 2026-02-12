package com.nexus.estates.entity;

import jakarta.persistence.*;

/**
 * Entidade que representa uma propriedade imobiliária no sistema.
 *
 * <p>Uma propriedade corresponde a um imóvel que pode ser listado,
 * reservado ou gerido dentro da plataforma Nexus Estates.</p>
 *
 * <p>Esta entidade é persistida na tabela <b>properties</b>.</p>
 */
@Entity
@Table(name = "properties")
public class Property {

    /**
     * Identificador único da propriedade.
     *
     * <p>Gerado automaticamente pela base de dados.</p>
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Título da propriedade.
     *
     * <p>Representa o nome ou designação principal do imóvel.</p>
     */
    private String title;

    /**
     * Descrição detalhada da propriedade.
     *
     * <p>Pode conter informações adicionais como localização,
     * características ou observações relevantes.</p>
     */
    private String description;

    /**
     * Preço associado à propriedade.
     *
     * <p>Representa o valor monetário do imóvel.</p>
     */
    private Double price;

    /**
     * Identificador do proprietário da propriedade.
     *
     * <p>Campo obrigatório. Representa a relação lógica com o utilizador
     * dono do imóvel.</p>
     */
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

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
     * Obtém o título da propriedade.
     *
     * @return título da propriedade
     */
    public String getTitle() {
        return title;
    }

    /**
     * Define o título da propriedade.
     *
     * @param title novo título
     */
    public void setTitle(String title) {
        this.title = title;
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
     * Obtém o preço da propriedade.
     *
     * @return preço da propriedade
     */
    public Double getPrice() {
        return price;
    }

    /**
     * Define o preço da propriedade.
     *
     * @param price novo preço
     */
    public void setPrice(Double price) {
        this.price = price;
    }

    /**
     * Obtém o identificador do proprietário.
     *
     * @return ID do proprietário
     */
    public Long getOwnerId() {
        return ownerId;
    }

    /**
     * Define o identificador do proprietário.
     *
     * @param ownerId novo ID do proprietário
     */
    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
