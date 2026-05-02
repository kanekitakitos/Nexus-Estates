package com.nexus.estates.service;

import com.nexus.estates.common.dto.PropertyQuoteRequest;
import com.nexus.estates.common.dto.PropertyQuoteResponse;
import com.nexus.estates.common.dto.RuleOverrideDTO;
import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.PropertyRule;
import com.nexus.estates.entity.RuleOverride;
import com.nexus.estates.entity.SeasonalityRule;
import com.nexus.estates.repository.AmenityRepository;
import com.nexus.estates.repository.PermissionRepository;
import com.nexus.estates.repository.PropertyChangeLogRepository;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.repository.PropertyRuleRepository;
import com.nexus.estates.repository.RuleOverrideRepository;
import com.nexus.estates.repository.SeasonalityRuleRepository;
import com.nexus.estates.service.repository.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para a classe de serviço {@link PropertyService}.
 */
@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    @Mock
    private PropertyRepository repository;
    @Mock
    private AmenityRepository amenityRepository;
    @Mock
    private SeasonalityRuleRepository seasonalityRuleRepository;
    @Mock
    private PropertyRuleRepository propertyRuleRepository;
    @Mock
    private PermissionRepository permissionRepository;
    @Mock
    private PropertyChangeLogRepository changeLogRepository;
    @Mock
    private RuleOverrideRepository ruleOverrideRepository;
    @Mock
    private ImageStorageService imageStorageService;

    @InjectMocks
    private PropertyService service;

    private CreatePropertyRequest validRequest;
    private Property savedProperty;

    @BeforeEach
    void setUp() {
        validRequest = new CreatePropertyRequest(
                "Casa de Luxo Teste",
                Map.of("pt", "Descrição detalhada"),
                100.0,
                1L,
                "Lisboa",
                "Lisboa",
                "Avenida Principal, 123",
                4,
                Set.of(5L, 10L),
                null
        );

        savedProperty = new Property();
        savedProperty.setId(1L);
        savedProperty.setName(validRequest.title());
        savedProperty.setBasePrice(BigDecimal.valueOf(100.00));
        savedProperty.setMaxGuests(4);
        savedProperty.setAmenities(new HashSet<>());
    }

    @Test
    @DisplayName("Deve criar uma propriedade com sucesso")
    void shouldCreatePropertyWithSuccess() {
        when(amenityRepository.findAllById(any())).thenReturn(new ArrayList<>());
        when(repository.save(any(Property.class))).thenReturn(savedProperty);

        Property result = service.create(validRequest, null);

        assertNotNull(result);
        verify(repository).save(any(Property.class));
        verify(propertyRuleRepository).save(any());
    }

    @Test
    @DisplayName("ValidateAndQuote - Deve falhar se dia de check-in não for permitido por override")
    void validateAndQuote_ShouldFail_WhenCheckInDayNotAllowedByOverride() {
        // Arrange: Reserva numa Terça-feira (2024-08-06)
        LocalDate checkIn = LocalDate.of(2024, 8, 6); 
        PropertyQuoteRequest request = new PropertyQuoteRequest(checkIn, checkIn.plusDays(7), 2);
        
        // Override: Apenas Sábado permitido em Agosto
        RuleOverride override = RuleOverride.builder()
                .startDate(LocalDate.of(2024, 8, 1))
                .endDate(LocalDate.of(2024, 8, 31))
                .allowedCheckInDays(Set.of(DayOfWeek.SATURDAY))
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(savedProperty));
        when(ruleOverrideRepository.findOverlappingOverrides(eq(1L), any(), any()))
                .thenReturn(List.of(override));

        // Act
        PropertyQuoteResponse response = service.validateAndQuote(1L, request);

        // Assert
        assertFalse(response.valid());
        assertTrue(response.validationErrors().stream().anyMatch(e -> e.contains("Check-in só é permitido em: [SATURDAY]")));
    }

    @Test
    @DisplayName("ValidateAndQuote - Deve aplicar minNights mais estrito do override")
    void validateAndQuote_ShouldApplyStrictMinNightsFromOverride() {
        // Arrange: Reserva de 3 noites
        PropertyQuoteRequest request = new PropertyQuoteRequest(
                LocalDate.of(2024, 8, 10), LocalDate.of(2024, 8, 13), 2);
        
        // Regra Base: 2 noites | Override: 7 noites
        PropertyRule baseRule = new PropertyRule();
        baseRule.setMinNights(2);
        savedProperty.setPropertyRule(baseRule);

        RuleOverride override = RuleOverride.builder()
                .startDate(LocalDate.of(2024, 8, 1))
                .endDate(LocalDate.of(2024, 8, 31))
                .minNightsOverride(7)
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(savedProperty));
        when(ruleOverrideRepository.findOverlappingOverrides(eq(1L), any(), any()))
                .thenReturn(List.of(override));

        // Act
        PropertyQuoteResponse response = service.validateAndQuote(1L, request);

        // Assert
        assertFalse(response.valid());
        assertTrue(response.validationErrors().stream().anyMatch(e -> e.contains("mínimo de noites é 7")));
    }

    @Test
    @DisplayName("Deve adicionar um RuleOverride com sucesso")
    void addRuleOverride_ShouldSaveSuccessfully() {
        RuleOverrideDTO dto = new RuleOverrideDTO(null, LocalDate.now(), LocalDate.now().plusDays(30), 7, Set.of(DayOfWeek.SATURDAY), Set.of(DayOfWeek.SATURDAY));
        when(repository.findById(1L)).thenReturn(Optional.of(savedProperty));
        when(ruleOverrideRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        RuleOverride result = service.addRuleOverride(1L, dto);

        assertNotNull(result);
        assertEquals(7, result.getMinNightsOverride());
        verify(ruleOverrideRepository).save(any());
    }

    // --- Testes de Sazonalidade Preservados ---

    @Test
    @DisplayName("Deve calcular preço base sem regras de sazonalidade")
    void shouldCalculatePriceWithoutRules() {
        Long propertyId = 1L;
        LocalDate checkIn = LocalDate.of(2024, 6, 1);
        LocalDate checkOut = LocalDate.of(2024, 6, 4); 

        when(repository.findById(propertyId)).thenReturn(Optional.of(savedProperty));
        when(seasonalityRuleRepository.findByPropertyIdAndDateRange(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        BigDecimal totalPrice = service.calculateTotalPrice(propertyId, checkIn, checkOut, null);

        assertEquals(0, new BigDecimal("300.00").compareTo(totalPrice));
    }

    @Test
    @DisplayName("Deve priorizar regra de canal sobre regra de data")
    void shouldPrioritizeChannelRuleOverDateRule() {
        Long propertyId = 1L;
        LocalDate date = LocalDate.of(2024, 8, 1);
        LocalDate checkOut = date.plusDays(1); 

        SeasonalityRule dateRule = new SeasonalityRule();
        dateRule.setStartDate(date);
        dateRule.setEndDate(date);
        dateRule.setPriceModifier(new BigDecimal("1.20")); 

        SeasonalityRule channelRule = new SeasonalityRule();
        channelRule.setStartDate(date);
        channelRule.setEndDate(date);
        channelRule.setChannel("Airbnb");
        channelRule.setPriceModifier(new BigDecimal("1.10")); 

        when(repository.findById(propertyId)).thenReturn(Optional.of(savedProperty));
        when(seasonalityRuleRepository.findByPropertyIdAndDateRange(any(), any(), any()))
                .thenReturn(List.of(dateRule, channelRule));

        BigDecimal totalPrice = service.calculateTotalPrice(propertyId, date, checkOut, "Airbnb");

        assertEquals(0, new BigDecimal("110.00").compareTo(totalPrice));
    }
}
