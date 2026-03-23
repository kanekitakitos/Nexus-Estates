package com.nexus.estates.service;

import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.entity.Amenity;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.SeasonalityRule;
import com.nexus.estates.repository.AmenityRepository;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.repository.PropertyRuleRepository;
import com.nexus.estates.repository.SeasonalityRuleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para a classe de serviço {@link PropertyService}.
 *
 * <p>Esta classe utiliza o framework Mockito para isolar as dependências de persistência
 * (PropertyRepository, AmenityRepository e SeasonalityRuleRepository), permitindo validar
 * a lógica de negócio de mapeamento, cálculo de preços dinâmicos e associação de comodidades.</p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 */
@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    /** Mock do repositório de propriedades. */
    @Mock
    private PropertyRepository repository;

    /** Mock do repositório de comodidades. */
    @Mock
    private AmenityRepository amenityRepository;

    /** Mock do repositório de regras de sazonalidade. */
    @Mock
    private SeasonalityRuleRepository seasonalityRuleRepository;

    /** Mock do repositório de regras de propriedade. */
    @Mock
    private PropertyRuleRepository propertyRuleRepository;

    /** Instância do serviço com as dependências mockadas injetadas. */
    @InjectMocks
    private PropertyService service;

    private CreatePropertyRequest validRequest;
    private Property savedProperty;

    /**
     * Configuração inicial executada antes de cada teste.
     */
    @BeforeEach
    void setUp() {
        // Dados para teste de criação
        validRequest = new CreatePropertyRequest(
                "Casa de Luxo Teste",
                Map.of("pt", "Descrição detalhada", "en", "Detailed description"),
                100.0, // Preço base de 100 para facilitar cálculos
                1L,
                "Avenida Principal, 123",
                Set.of(5L, 10L)
        );

        savedProperty = new Property();
        savedProperty.setId(1L);
        savedProperty.setName(validRequest.title());
        // Define explicitamente a escala para evitar surpresas
        savedProperty.setBasePrice(BigDecimal.valueOf(100.00)); 
    }

    @Test
    @DisplayName("Deve criar uma propriedade e associar comodidades com sucesso")
    void shouldCreatePropertyWithSuccess() {
        // Arrange
        when(amenityRepository.findAllById(any())).thenReturn(new ArrayList<>());
        when(repository.save(any(Property.class))).thenReturn(savedProperty);

        // Act
        Property result = service.create(validRequest);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(amenityRepository, times(1)).findAllById(validRequest.amenityIds());
        verify(repository, times(1)).save(any(Property.class));
        // Verifica se a regra padrão foi criada e salva
        verify(propertyRuleRepository, times(1)).save(any());
    }

    /**
     * Valida o cálculo de preço total sem regras de sazonalidade.
     * Cenário: Estadia de 3 noites, preço base 100.00. Total esperado: 300.00.
     */
    @Test
    @DisplayName("Deve calcular preço base sem regras de sazonalidade")
    void shouldCalculatePriceWithoutRules() {
        // Arrange
        Long propertyId = 1L;
        LocalDate checkIn = LocalDate.of(2024, 6, 1);
        LocalDate checkOut = LocalDate.of(2024, 6, 4); // 3 noites

        when(repository.findById(propertyId)).thenReturn(java.util.Optional.of(savedProperty));
        when(seasonalityRuleRepository.findByPropertyIdAndDateRange(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        // Act
        BigDecimal totalPrice = service.calculateTotalPrice(propertyId, checkIn, checkOut, null);

        // Assert
        // Comparação usando compareTo é mais segura para BigDecimal pois ignora escala (300.0 == 300.00)
        assertEquals(0, new BigDecimal("300.00").compareTo(totalPrice), 
                "O preço total deve ser 300.00");
    }

    /**
     * Valida o cálculo com uma regra de intervalo de datas.
     * Cenário: Estadia de 2 noites.
     * Dia 1: Sem regra (100.00).
     * Dia 2: Regra de Época Alta (+50% -> 1.50). Preço dia 2 = 150.00.
     * Total esperado: 250.00.
     */
    @Test
    @DisplayName("Deve aplicar regra de sazonalidade por data")
    void shouldCalculatePriceWithDateRangeRule() {
        // Arrange
        Long propertyId = 1L;
        LocalDate checkIn = LocalDate.of(2024, 7, 14);
        LocalDate checkOut = LocalDate.of(2024, 7, 16); // 2 noites: 14 e 15

        // Regra para dia 15 de Julho: +50%
        SeasonalityRule rule = new SeasonalityRule();
        rule.setStartDate(LocalDate.of(2024, 7, 15));
        rule.setEndDate(LocalDate.of(2024, 7, 15));
        rule.setPriceModifier(new BigDecimal("1.50"));

        when(repository.findById(propertyId)).thenReturn(java.util.Optional.of(savedProperty));
        when(seasonalityRuleRepository.findByPropertyIdAndDateRange(any(), any(), any()))
                .thenReturn(List.of(rule));

        // Act
        BigDecimal totalPrice = service.calculateTotalPrice(propertyId, checkIn, checkOut, null);

        // Assert
        // Dia 14: 100.00
        // Dia 15: 150.000 (100 * 1.50)
        // Total: 250.000
        assertEquals(0, new BigDecimal("250.00").compareTo(totalPrice),
                "O preço total deve ser 250.00");
    }

    /**
     * Valida a hierarquia de regras.
     * Cenário: Estadia de 1 noite.
     * Existem duas regras para o mesmo dia:
     * 1. Regra de Data: +20% (1.20)
     * 2. Regra de Canal (Airbnb): +10% (1.10)
     * Esperado: A regra de Canal deve ter prioridade sobre a regra de data.
     * Preço base 100 * 1.10 = 110.00.
     */
    @Test
    @DisplayName("Deve priorizar regra de canal sobre regra de data")
    void shouldPrioritizeChannelRuleOverDateRule() {
        // Arrange
        Long propertyId = 1L;
        LocalDate date = LocalDate.of(2024, 8, 1);
        LocalDate checkOut = date.plusDays(1); // 1 noite

        SeasonalityRule dateRule = new SeasonalityRule();
        dateRule.setStartDate(date);
        dateRule.setEndDate(date);
        dateRule.setPriceModifier(new BigDecimal("1.20")); // +20%

        SeasonalityRule channelRule = new SeasonalityRule();
        channelRule.setStartDate(date);
        channelRule.setEndDate(date);
        channelRule.setChannel("Airbnb");
        channelRule.setPriceModifier(new BigDecimal("1.10")); // +10%

        when(repository.findById(propertyId)).thenReturn(java.util.Optional.of(savedProperty));
        when(seasonalityRuleRepository.findByPropertyIdAndDateRange(any(), any(), any()))
                .thenReturn(List.of(dateRule, channelRule));

        // Act
        BigDecimal totalPrice = service.calculateTotalPrice(propertyId, date, checkOut, "Airbnb");

        // Assert
        // Deve aplicar o modificador de canal (1.10)
        // 100 * 1.10 = 110.00
        assertEquals(0, new BigDecimal("110.00").compareTo(totalPrice),
                "Deve aplicar a regra de canal (110.00) e ignorar a de data");
    }

    /**
     * Valida o cálculo de preço total sem regras de sazonalidade.
     * Cenário: Estadia de 3 noites, preço base 100.00. Total esperado: 300.00.
     */
    @Test
    @DisplayName("Deve calcular preço base sem regras de sazonalidade")
    void shouldCalculatePriceWithoutRules() {
        // Arrange
        Long propertyId = 1L;
        LocalDate checkIn = LocalDate.of(2024, 6, 1);
        LocalDate checkOut = LocalDate.of(2024, 6, 4); // 3 noites

        when(repository.findById(propertyId)).thenReturn(java.util.Optional.of(savedProperty));
        when(seasonalityRuleRepository.findByPropertyIdAndDateRange(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        // Act
        BigDecimal totalPrice = service.calculateTotalPrice(propertyId, checkIn, checkOut, null);

        // Assert
        // Comparação usando compareTo é mais segura para BigDecimal pois ignora escala (300.0 == 300.00)
        assertEquals(0, new BigDecimal("300.00").compareTo(totalPrice), 
                "O preço total deve ser 300.00");
    }

    /**
     * Valida o cálculo com uma regra de intervalo de datas.
     * Cenário: Estadia de 2 noites.
     * Dia 1: Sem regra (100.00).
     * Dia 2: Regra de Época Alta (+50% -> 1.50). Preço dia 2 = 150.00.
     * Total esperado: 250.00.
     */
    @Test
    @DisplayName("Deve aplicar regra de sazonalidade por data")
    void shouldCalculatePriceWithDateRangeRule() {
        // Arrange
        Long propertyId = 1L;
        LocalDate checkIn = LocalDate.of(2024, 7, 14);
        LocalDate checkOut = LocalDate.of(2024, 7, 16); // 2 noites: 14 e 15

        // Regra para dia 15 de Julho: +50%
        SeasonalityRule rule = new SeasonalityRule();
        rule.setStartDate(LocalDate.of(2024, 7, 15));
        rule.setEndDate(LocalDate.of(2024, 7, 15));
        rule.setPriceModifier(new BigDecimal("1.50"));

        when(repository.findById(propertyId)).thenReturn(java.util.Optional.of(savedProperty));
        when(seasonalityRuleRepository.findByPropertyIdAndDateRange(any(), any(), any()))
                .thenReturn(List.of(rule));

        // Act
        BigDecimal totalPrice = service.calculateTotalPrice(propertyId, checkIn, checkOut, null);

        // Assert
        // Dia 14: 100.00
        // Dia 15: 150.000 (100 * 1.50)
        // Total: 250.000
        assertEquals(0, new BigDecimal("250.00").compareTo(totalPrice),
                "O preço total deve ser 250.00");
    }

    /**
     * Valida a hierarquia de regras.
     * Cenário: Estadia de 1 noite.
     * Existem duas regras para o mesmo dia:
     * 1. Regra de Data: +20% (1.20)
     * 2. Regra de Canal (Airbnb): +10% (1.10)
     * Esperado: A regra de Canal deve ter prioridade sobre a regra de data.
     * Preço base 100 * 1.10 = 110.00.
     */
    @Test
    @DisplayName("Deve priorizar regra de canal sobre regra de data")
    void shouldPrioritizeChannelRuleOverDateRule() {
        // Arrange
        Long propertyId = 1L;
        LocalDate date = LocalDate.of(2024, 8, 1);
        LocalDate checkOut = date.plusDays(1); // 1 noite

        SeasonalityRule dateRule = new SeasonalityRule();
        dateRule.setStartDate(date);
        dateRule.setEndDate(date);
        dateRule.setPriceModifier(new BigDecimal("1.20")); // +20%

        SeasonalityRule channelRule = new SeasonalityRule();
        channelRule.setStartDate(date);
        channelRule.setEndDate(date);
        channelRule.setChannel("Airbnb");
        channelRule.setPriceModifier(new BigDecimal("1.10")); // +10%

        when(repository.findById(propertyId)).thenReturn(java.util.Optional.of(savedProperty));
        when(seasonalityRuleRepository.findByPropertyIdAndDateRange(any(), any(), any()))
                .thenReturn(List.of(dateRule, channelRule));

        // Act
        BigDecimal totalPrice = service.calculateTotalPrice(propertyId, date, checkOut, "Airbnb");

        // Assert
        // Deve aplicar o modificador de canal (1.10)
        // 100 * 1.10 = 110.00
        assertEquals(0, new BigDecimal("110.00").compareTo(totalPrice),
                "Deve aplicar a regra de canal (110.00) e ignorar a de data");
    }
}