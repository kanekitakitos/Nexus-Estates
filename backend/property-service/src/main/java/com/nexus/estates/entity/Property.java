package com.nexus.estates.entity;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Entidade principal que representa um imóvel no sistema")
public class Property {

    /**
     * Identificador único da propriedade.
     *
     * <p>Gerado automaticamente pelo sistema.</p>
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID único do imóvel", example = "101")
    private Long id;

    /**
     * Nome / título da propriedade.
     *
     * <p>Representa a designação principal do imóvel.</p>
     */
    @Column(nullable = false)
    @Schema(description = "Título do anúncio", example = "Villa Mar Azul")
    private String name;

    /**
     * Descrição detalhada da propriedade suportando múltiplos idiomas.
     *
     * <p>Armazenada como JSONB para permitir chaves de idioma (ex: pt, en).</p>
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Schema(description = "Descrição detalhada em múltiplos idiomas", example = "{\"pt\": \"Vista mar...\"}")
    private Map<String, String> description;

    /**
     * Localização resumida ou região da propriedade.
     */
    @Column(nullable = false)
    @Schema(description = "Região ou localização resumida", example = "Algarve")
    private String location;

    /**
     * Cidade onde a propriedade está localizada.
     */
    @Column(nullable = false)
    @Schema(description = "Cidade", example = "Lagos")
    private String city;

    /**
     * Endereço completo da propriedade.
     */
    @Column(nullable = false)
    @Schema(description = "Morada completa", example = "Rua da Praia, 45")
    private String address;

    /**
     * Preço base por noite.
     *
     * <p>Representa o valor monetário base associado ao imóvel.</p>
     */
    @Column(nullable = false, precision = 10, scale = 2)
    @Schema(description = "Preço base por noite", example = "150.00")
    private BigDecimal basePrice;

    /**
     * Número máximo de hóspedes permitidos.
     */
    @Column(nullable = false)
    @Schema(description = "Capacidade máxima de hóspedes", example = "4")
    private Integer maxGuests;

    /**
     * Estado do anúncio.
     *
     * <p>Indica se a propriedade está ativa na plataforma.</p>
     */
    @Column(nullable = false)
    @Schema(description = "Estado do anúncio (Ativo/Inativo)", example = "true")
    private Boolean isActive = true;

    /**
     * Conjunto de comodidades associadas à propriedade.
     *
     * <p>Relação Many-to-Many que utiliza uma tabela de junção para mapear
     * características como WiFi, Piscina, etc.</p>
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "property_amenities",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    @Schema(description = "Lista de comodidades associadas")
    private Set<Amenity> amenities = new HashSet<>();

    /**
     * Regras de sazonalidade e precificação dinâmica.
     * <p>Relação One-to-Many com cascade para garantir que as regras são geridas com a propriedade.</p>
     */
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(description = "Regras de sazonalidade associadas a esta propriedade")
    private Set<SeasonalityRule> seasonalityRules = new HashSet<>();

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Map<String, String> getDescription() { return description; }
    public void setDescription(Map<String, String> description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public Integer getMaxGuests() { return maxGuests; }
    public void setMaxGuests(Integer maxGuests) { this.maxGuests = maxGuests; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Set<Amenity> getAmenities() { return amenities; }
    public void setAmenities(Set<Amenity> amenities) { this.amenities = amenities; }
    public Set<SeasonalityRule> getSeasonalityRules() { return seasonalityRules; }
    public void setSeasonalityRules(Set<SeasonalityRule> seasonalityRules) { this.seasonalityRules = seasonalityRules; }
}