package com.nexus.estates.service;

import com.nexus.estates.common.dto.PropertyQuoteRequest;
import com.nexus.estates.common.dto.PropertyQuoteResponse;
import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.entity.Amenity;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.PropertyRule;
import com.nexus.estates.entity.SeasonalityRule;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.AmenityRepository;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.repository.PropertyRuleRepository;
import com.nexus.estates.repository.SeasonalityRuleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela lógica de negócio associada às propriedades.
 *
 * <p>Esta camada atua como intermediária entre o controller e o repositório,
 * encapsulando operações de persistência e regras de negócio complexas como
 * o cálculo de preços dinâmicos.</p>
 *
 * @see PropertyRepository
 * @author Nexus Estates Team
 */
@Service
@Slf4j
public class PropertyService {

    private final PropertyRepository repository;
    private final AmenityRepository amenityRepository;
    private final SeasonalityRuleRepository seasonalityRuleRepository;
    private final PropertyRuleRepository propertyRuleRepository;

    /**
     * Construtor do serviço.
     *
     * @param repository repositório responsável pelo acesso aos dados
     * @param amenityRepository repositório responsável pelas comodidades
     * @param seasonalityRuleRepository repositório responsável pelas regras de sazonalidade
     * @param propertyRuleRepository repositório responsável pelas regras da propriedade
     */
    public PropertyService(PropertyRepository repository, AmenityRepository amenityRepository, SeasonalityRuleRepository seasonalityRuleRepository, PropertyRuleRepository propertyRuleRepository) {
        this.repository = repository;
        this.amenityRepository = amenityRepository;
        this.seasonalityRuleRepository = seasonalityRuleRepository;
        this.propertyRuleRepository = propertyRuleRepository;
    }

    /**
     * Cria uma nova propriedade no sistema a partir de um DTO.
     *
     * <p>Realiza o mapeamento dos dados do Request para a Entidade,
     * suportando descrições multi-idioma (JSONB) e preparando a associação de comodidades.</p>
     *
     * @param request dados da propriedade vindos do controller (DTO)
     * @return propriedade persistida
     */
    @Transactional
    public Property create(CreatePropertyRequest request) {
        log.info("Iniciando criação de propriedade: {}", request.title());

        Property property = new Property();

        // Mapeamento dos campos do DTO para a Entity
        property.setName(request.title());
        // Conversão de Double (DTO) para BigDecimal (Entity)
        property.setBasePrice(BigDecimal.valueOf(request.price()));
        property.setLocation(request.location());

        // Atribui o mapa de descrições (que será guardado como JSONB no Postgres)
        property.setDescription(request.description());

        // Implementação da lógica de associação de amenityIds
        if (request.amenityIds() != null && !request.amenityIds().isEmpty()) {
            log.debug("Comodidades detetadas para associação: {}", request.amenityIds());
            List<Amenity> amenities = amenityRepository.findAllById(request.amenityIds());
            property.setAmenities(new HashSet<>(amenities));
        }

        Property savedProperty = repository.save(property);

        // Cria e associa as regras padrão
        PropertyRule defaultRule = PropertyRule.builder()
                .property(savedProperty)
                .checkInTime(LocalTime.of(16, 0))
                .checkOutTime(LocalTime.of(11, 0))
                .minNights(1)
                .maxNights(30)
                .bookingLeadTimeDays(0)
                .build();
        propertyRuleRepository.save(defaultRule);
        savedProperty.setPropertyRule(defaultRule);

        return savedProperty;
    }

    /**
     * Atualiza a lista de comodidades de uma propriedade existente.
     *
     * <p>Este método permite a gestão dinâmica de atributos da propriedade,
     * resolvendo a relação Many-to-Many entre Property e Amenity.</p>
     *
     * @param propertyId identificador da propriedade a atualizar
     * @param amenityIds conjunto de IDs das novas comodidades
     * @return propriedade atualizada
     * @throws PropertyNotFoundException caso o ID seja inválido
     */
    @Transactional
    public Property updateAmenities(Long propertyId, Set<Long> amenityIds) {
        log.info("Atualizando comodidades da propriedade ID: {}", propertyId);

        Property property = findById(propertyId);

        if (amenityIds != null && !amenityIds.isEmpty()) {
            List<Amenity> amenities = amenityRepository.findAllById(amenityIds);
            property.setAmenities(new HashSet<>(amenities));
        } else {
            property.getAmenities().clear();
        }

        return repository.save(property);
    }

    /**
     * Obtém todas as propriedades registadas.
     *
     * @return lista de propriedades
     */
    public List<Property> findAll() {
        return repository.findAll();
    }

    /**
     * Obtém uma propriedade pelo seu identificador.
     *
     * @param id identificador da propriedade
     * @return propriedade encontrada
     * @throws PropertyNotFoundException caso a propriedade não exista
     */
    public Property findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException(id));
    }

    /**
     * Valida as regras da propriedade e calcula o preço total para uma estadia proposta.
     * <p>
     * Este método centraliza a lógica de negócio, garantindo que o Booking Service
     * não precisa de conhecer os detalhes de implementação das regras ou sazonalidade.
     * </p>
     *
     * @param propertyId ID da propriedade.
     * @param request Pedido de cotação contendo datas e hóspedes.
     * @return Resposta com validação (sucesso/falha) e preço.
     */
    @Transactional(readOnly = true)
    public PropertyQuoteResponse validateAndQuote(Long propertyId, PropertyQuoteRequest request) {
        Property property = findById(propertyId);
        List<String> errors = new ArrayList<>();

        // 1. Validação de Capacidade
        if (request.guestCount() > property.getMaxGuests()) {
            errors.add("O número de hóspedes (" + request.guestCount() + ") excede a capacidade máxima de " + property.getMaxGuests());
        }

        // 2. Validação de Regras Operacionais (Min/Max Nights, Lead Time)
        PropertyRule rule = property.getPropertyRule();
        if (rule != null) {
            long nights = ChronoUnit.DAYS.between(request.checkInDate(), request.checkOutDate());
            
            if (rule.getMinNights() != null && nights < rule.getMinNights()) {
                errors.add("O número mínimo de noites é " + rule.getMinNights());
            }
            if (rule.getMaxNights() != null && nights > rule.getMaxNights()) {
                errors.add("O número máximo de noites é " + rule.getMaxNights());
            }
            
            if (rule.getBookingLeadTimeDays() != null) {
                LocalDate minCheckInDate = LocalDate.now().plusDays(rule.getBookingLeadTimeDays());
                if (request.checkInDate().isBefore(minCheckInDate)) {
                    errors.add("A reserva deve ser feita com pelo menos " + rule.getBookingLeadTimeDays() + " dias de antecedência.");
                }
            }
        }

        // Se houver erros, retorna falha imediatamente
        if (!errors.isEmpty()) {
            return PropertyQuoteResponse.failure(errors);
        }

        // 3. Cálculo de Preço (Sazonalidade)
        BigDecimal totalPrice = calculateTotalPrice(propertyId, request.checkInDate(), request.checkOutDate(), null);
        
        return PropertyQuoteResponse.success(totalPrice, "EUR"); // Assumindo EUR por defeito
    }

    /**
     * Calcula o preço total de uma estadia para uma propriedade, aplicando regras de sazonalidade.
     *
     * <p>Este método itera por cada dia da reserva, aplicando o multiplicador de preço
     * da regra de sazonalidade mais específica que se aplica a esse dia.
     * A hierarquia de prioridade é: Regra de Canal > Regra de Dia da Semana > Regra de Período.</p>
     *
     * @param propertyId ID da propriedade.
     * @param checkInDate Data de check-in.
     * @param checkOutDate Data de check-out.
     * @param channel Canal de venda (opcional, pode ser null).
     * @return O preço total da estadia.
     * @throws PropertyNotFoundException se a propriedade não for encontrada.
     */
    public BigDecimal calculateTotalPrice(Long propertyId, LocalDate checkInDate, LocalDate checkOutDate, String channel) {
        Property property = findById(propertyId);
        
        // Busca todas as regras de sazonalidade que se sobrepõem ao período da reserva
        // O repositório deve ter este método definido para aceitar propertyId, start e end
        List<SeasonalityRule> allRules = seasonalityRuleRepository.findByPropertyIdAndDateRange(propertyId, checkInDate, checkOutDate);

        BigDecimal total = BigDecimal.ZERO;
        
        // Iterar dia a dia desde o check-in até ao dia ANTES do check-out (pois a última noite conta, mas sai-se no dia seguinte)
        for (LocalDate date = checkInDate; date.isBefore(checkOutDate); date = date.plusDays(1)) {
            final LocalDate currentDate = date;
            
            // Filtra regras aplicáveis a este dia específico
            List<SeasonalityRule> applicableRules = allRules.stream()
                .filter(rule -> !currentDate.isBefore(rule.getStartDate()) && !currentDate.isAfter(rule.getEndDate()))
                .filter(rule -> rule.getDayOfWeek() == null || rule.getDayOfWeek() == currentDate.getDayOfWeek())
                .filter(rule -> rule.getChannel() == null || (channel != null && rule.getChannel().equalsIgnoreCase(channel)))
                .collect(Collectors.toList());

            // Determina o multiplicador: Preço base (1.0) ou o da regra mais prioritária
            BigDecimal modifier = BigDecimal.ONE;
            
            if (!applicableRules.isEmpty()) {
                // Encontra a regra com maior prioridade
                SeasonalityRule bestRule = applicableRules.stream()
                        .max(Comparator.comparingInt(this::getRulePriority))
                        .orElseThrow(); // Seguro pois a lista não está vazia
                
                modifier = bestRule.getPriceModifier();
            }

            // Preço do dia = Preço Base * Multiplicador
            BigDecimal dailyPrice = property.getBasePrice().multiply(modifier);
            total = total.add(dailyPrice);
        }

        return total;
    }

    /**
     * Define a prioridade de uma regra de sazonalidade.
     * Regras com canal e dia da semana são mais prioritárias.
     *
     * @param rule A regra de sazonalidade.
     * @return Um valor inteiro representando a prioridade. Maior valor = maior prioridade.
     */
    private int getRulePriority(SeasonalityRule rule) {
        int priority = 0;
        // Regra de canal é muito específica
        if (rule.getChannel() != null && !rule.getChannel().isEmpty()) {
            priority += 100;
        }
        // Regra de dia da semana é específica
        if (rule.getDayOfWeek() != null) {
            priority += 50;
        }
        // Regras apenas por data têm prioridade base
        return priority;
    }
}