package com.nexus.estates.service;

import com.nexus.estates.common.dto.PropertyQuoteRequest;
import com.nexus.estates.common.dto.PropertyQuoteResponse;
import com.nexus.estates.common.dto.PropertyRuleDTO;
import com.nexus.estates.common.dto.RuleOverrideDTO;
import com.nexus.estates.common.dto.SeasonalityRuleDTO;
import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.dto.ExpandedPropertyResponse;
import com.nexus.estates.dto.UpdatePropertyRequest;
import com.nexus.estates.audit.ActorContext;
import com.nexus.estates.entity.Amenity;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.PropertyChangeLog;
import com.nexus.estates.entity.PropertyRule;
import com.nexus.estates.entity.RuleOverride;
import com.nexus.estates.entity.SeasonalityRule;
import com.nexus.estates.exception.AmenityNotFoundException;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.AmenityRepository;
import com.nexus.estates.repository.PermissionRepository;
import com.nexus.estates.repository.PropertyChangeLogRepository;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.repository.PropertyRuleRepository;
import com.nexus.estates.repository.RuleOverrideRepository;
import com.nexus.estates.repository.SeasonalityRuleRepository;
import com.nexus.estates.service.repository.ImageStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
    private final PermissionRepository permissionRepository;
    private final PropertyChangeLogRepository changeLogRepository;
    private final RuleOverrideRepository ruleOverrideRepository;
    private final ImageStorageService imageStorageService;

    /**
     * Construtor do serviço.
     */
    public PropertyService(PropertyRepository repository,
                           AmenityRepository amenityRepository,
                           SeasonalityRuleRepository seasonalityRuleRepository,
                           PropertyRuleRepository propertyRuleRepository,
                           PermissionRepository permissionRepository,
                           PropertyChangeLogRepository changeLogRepository,
                           RuleOverrideRepository ruleOverrideRepository,
                           ImageStorageService imageStorageService) {
        this.repository = repository;
        this.amenityRepository = amenityRepository;
        this.seasonalityRuleRepository = seasonalityRuleRepository;
        this.propertyRuleRepository = propertyRuleRepository;
        this.permissionRepository = permissionRepository;
        this.changeLogRepository = changeLogRepository;
        this.ruleOverrideRepository = ruleOverrideRepository;
        this.imageStorageService = imageStorageService;
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
    public Property create(CreatePropertyRequest request, String userIdHeader) {
        Long resolvedOwnerId = request.ownerId();
        if (resolvedOwnerId == null) {
            resolvedOwnerId = parseUserIdHeader(userIdHeader);
        }
        if (resolvedOwnerId == null) {
            resolvedOwnerId = ActorContext.get().map(ActorContext.Actor::userId).orElse(null);
        }
        if (resolvedOwnerId == null) {
            throw new IllegalArgumentException("Owner ID is required.");
        }

        CreatePropertyRequest effectiveRequest = request.ownerId() != null
                ? request
                : new CreatePropertyRequest(
                request.title(),
                request.description(),
                request.price(),
                resolvedOwnerId,
                request.location(),
                request.city(),
                request.address(),
                request.maxGuests(),
                request.amenityIds(),
                request.imageUrl()
        );

        log.info("Iniciando criação de propriedade: {}", effectiveRequest.title());

        Property property = new Property();

        // Mapeamento dos campos do DTO para a Entity
        property.setName(effectiveRequest.title());
        // Conversão de Double (DTO) para BigDecimal (Entity)
        property.setBasePrice(BigDecimal.valueOf(effectiveRequest.price()));
        property.setLocation(effectiveRequest.location());
        property.setCity(effectiveRequest.city());
        property.setAddress(effectiveRequest.address());
        property.setMaxGuests(effectiveRequest.maxGuests());
        property.setImageUrl(effectiveRequest.imageUrl());

        // Atribui o mapa de descrições (que será guardado como JSONB no Postgres)
        property.setDescription(effectiveRequest.description());

        // Implementação da lógica de associação de amenityIds
        if (effectiveRequest.amenityIds() != null && !effectiveRequest.amenityIds().isEmpty()) {
            log.debug("Comodidades detetadas para associação: {}", effectiveRequest.amenityIds());
            List<Amenity> amenities = amenityRepository.findAllById(effectiveRequest.amenityIds());
            property.setAmenities(new HashSet<>(amenities));
        }

        Property savedProperty = repository.save(property);

        try {
            com.nexus.estates.entity.PropertyPermission perm = new com.nexus.estates.entity.PropertyPermission();
            perm.setPropertyId(savedProperty.getId());
            perm.setUserId(resolvedOwnerId);
            perm.setAccessLevel(com.nexus.estates.entity.AccessLevel.PRIMARY_OWNER);
            permissionRepository.save(perm);
        } catch (Exception e) {
            log.warn("Falha ao criar permissão do proprietário para a propriedade {}: {}", savedProperty.getId(), e.getMessage());
        }

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

    private Long parseUserIdHeader(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(userIdHeader);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Adiciona uma sobreposição de regra sazonal.
     *
     * @param propertyId ID da propriedade.
     * @param dto Dados da sobreposição.
     * @return A sobreposição criada.
     */
    @Transactional
    public RuleOverride addRuleOverride(Long propertyId, RuleOverrideDTO dto) {
        Property property = findById(propertyId);
        
        RuleOverride override = RuleOverride.builder()
                .property(property)
                .startDate(dto.startDate())
                .endDate(dto.endDate())
                .minNightsOverride(dto.minNightsOverride())
                .allowedCheckInDays(dto.allowedCheckInDays())
                .allowedCheckOutDays(dto.allowedCheckOutDays())
                .build();
        
        return ruleOverrideRepository.save(override);
    }

    /**
     * Lista todos os overrides de uma propriedade.
     *
     * @param propertyId ID da propriedade.
     * @return Lista de overrides.
     */
    @Transactional(readOnly = true)
    public List<RuleOverride> listOverrides(Long propertyId) {
        return ruleOverrideRepository.findAll().stream()
                .filter(r -> r.getProperty().getId().equals(propertyId))
                .toList();
    }

    /**
     * Remove um override.
     *
     * @param overrideId ID do override a remover.
     */
    @Transactional
    public void deleteOverride(Long overrideId) {
        ruleOverrideRepository.deleteById(overrideId);
    }

    /**
     * Substitui a lista de comodidades de uma propriedade.
     *
     * @param propertyId identificador da propriedade a atualizar
     * @param amenityIds conjunto de IDs das novas comodidades
     * @return propriedade atualizada
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
     * Adiciona uma comodidade específica a uma propriedade.
     *
     * @param propertyId ID da propriedade.
     * @param amenityId ID da comodidade a adicionar.
     * @return Propriedade atualizada.
     */
    @Transactional
    public Property addAmenity(Long propertyId, Long amenityId) {
        log.info("Adicionando comodidade {} à propriedade {}", amenityId, propertyId);
        Property property = findById(propertyId);
        Amenity amenity = amenityRepository.findById(amenityId)
                .orElseThrow(() -> new AmenityNotFoundException(amenityId));

        property.getAmenities().add(amenity);
        return repository.save(property);
    }

    /**
     * Remove uma comodidade específica de uma propriedade.
     *
     * @param propertyId ID da propriedade.
     * @param amenityId ID da comodidade a remover.
     * @return Propriedade atualizada.
     */
    @Transactional
    public Property removeAmenity(Long propertyId, Long amenityId) {
        log.info("Removendo comodidade {} da propriedade {}", amenityId, propertyId);
        Property property = findById(propertyId);
        Amenity amenity = amenityRepository.findById(amenityId)
                .orElseThrow(() -> new AmenityNotFoundException(amenityId));

        property.getAmenities().remove(amenity);
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

    @Transactional(readOnly = true)
    public Page<Property> listByUserWithFilters(Long userId, String city, Boolean isActive,
                                                BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        List<Long> ids = permissionRepository.findByUserId(userId)
                .stream().map(com.nexus.estates.entity.PropertyPermission::getPropertyId).toList();
        if (ids.isEmpty()) {
            return Page.empty(pageable);
        }
        return repository.findByIdsWithFilters(ids, city, isActive, minPrice, maxPrice, pageable);
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

    @Transactional(readOnly = true)
    public ExpandedPropertyResponse getExpandedById(Long id) {
        Property p = repository.findExpandedById(id)
                .orElseThrow(() -> new PropertyNotFoundException(id));
        return convertToExpandedDto(p);
    }

    private String resolveAmenityName(Map<String, String> name) {
        if (name == null || name.isEmpty()) return null;
        String pt = name.get("pt");
        if (pt != null && !pt.isBlank()) return pt;
        String en = name.get("en");
        if (en != null && !en.isBlank()) return en;
        return name.values().stream().filter(v -> v != null && !v.isBlank()).findFirst().orElse(null);
    }

    @Transactional
    public Property updateProperty(Long id, UpdatePropertyRequest req, Long actorUserId) {
        Long effectiveActorUserId = resolveActorUserId(actorUserId);
        Property p = findById(id);
        if (req.title() != null) {
            if (req.title().length() < 3) {
                throw new IllegalArgumentException("O título deve ter pelo menos 3 caracteres.");
            }
            recordChange(id, effectiveActorUserId, "UPDATE", "name", p.getName(), req.title());
            p.setName(req.title());
        }
        if (req.description() != null) {
            recordChange(id, effectiveActorUserId, "UPDATE", "description", asString(p.getDescription()), asString(req.description()));
            p.setDescription(req.description());
        }
        if (req.location() != null) {
            recordChange(id, effectiveActorUserId, "UPDATE", "location", p.getLocation(), req.location());
            p.setLocation(req.location());
        }
        if (req.city() != null) {
            recordChange(id, effectiveActorUserId, "UPDATE", "city", p.getCity(), req.city());
            p.setCity(req.city());
        }
        if (req.address() != null) {
            recordChange(id, effectiveActorUserId, "UPDATE", "address", p.getAddress(), req.address());
            p.setAddress(req.address());
        }
        if (req.basePrice() != null) {
            if (req.basePrice().scale() > 2 || req.basePrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("O preço base deve ser positivo e com no máximo 2 casas decimais.");
            }
            recordChange(id, effectiveActorUserId, "UPDATE", "basePrice", p.getBasePrice() == null ? null : p.getBasePrice().toPlainString(), req.basePrice().toPlainString());
            p.setBasePrice(req.basePrice());
        }
        if (req.maxGuests() != null) {
            if (req.maxGuests() < 1) {
                throw new IllegalArgumentException("O número máximo de hóspedes deve ser pelo menos 1.");
            }
            recordChange(id, effectiveActorUserId, "UPDATE", "maxGuests", p.getMaxGuests() == null ? null : p.getMaxGuests().toString(), req.maxGuests().toString());
            p.setMaxGuests(req.maxGuests());
        }
        if (req.isActive() != null) {
            recordChange(id, effectiveActorUserId, "UPDATE", "isActive", String.valueOf(p.getIsActive()), String.valueOf(req.isActive()));
            p.setIsActive(req.isActive());
        }
        if (req.imageUrl() != null) {
            recordChange(id, effectiveActorUserId, "UPDATE", "imageUrl", p.getImageUrl(), req.imageUrl());
            p.setImageUrl(req.imageUrl());
        }
        return repository.save(p);
    }

    @Transactional
    public void deleteProperty(Long id, Long actorUserId) {
        Long effectiveActorUserId = resolveActorUserId(actorUserId);
        Property p = findById(id);
        repository.delete(p);
        recordChange(id, effectiveActorUserId, "DELETE", null, null, null);
    }

    private void recordChange(Long propertyId, Long userId, String action, String field, String oldV, String newV) {
        PropertyChangeLog logChange = new PropertyChangeLog();
        logChange.setPropertyId(propertyId);
        logChange.setUserId(userId);
        logChange.setAction(action);
        logChange.setFieldName(field);
        logChange.setOldValue(oldV);
        logChange.setNewValue(newV);
        logChange.setChangedAt(OffsetDateTime.now());
        changeLogRepository.save(logChange);
    }

    private Long resolveActorUserId(Long actorUserId) {
        if (actorUserId != null) {
            return actorUserId;
        }
        return ActorContext.get().map(ActorContext.Actor::userId).orElse(null);
    }

    private String asString(Map<String, String> map) {
        return map == null ? null : map.toString();
    }

    @Transactional(readOnly = true)
    public List<PropertyChangeLog> getHistory(Long propertyId) {
        findById(propertyId);
        return changeLogRepository.findByPropertyIdOrderByChangedAtDesc(propertyId);
    }

    /**
     * Valida as regras da propriedade (incluindo sobreposições sazonais) e calcula o preço total.
     */
    @Transactional(readOnly = true)
    public PropertyQuoteResponse validateAndQuote(Long propertyId, PropertyQuoteRequest request) {
        Property property = findById(propertyId);
        List<String> errors = new ArrayList<>();

        // 1. Validação de Capacidade
        if (request.guestCount() > property.getMaxGuests()) {
            errors.add("O número de hóspedes (" + request.guestCount() + ") excede a capacidade máxima de " + property.getMaxGuests());
        }

        // 2. Procurar Overrides que intersetam o período da estadia
        List<RuleOverride> overrides = ruleOverrideRepository.findOverlappingOverrides(
                propertyId, request.checkInDate(), request.checkOutDate());

        // 3. Validação de Regras (Base + Overrides)
        long nights = ChronoUnit.DAYS.between(request.checkInDate(), request.checkOutDate());
        PropertyRule baseRule = property.getPropertyRule();

        // --- Regra: Min Nights ---
        int effectiveMinNights = (baseRule != null) ? baseRule.getMinNights() : 1;
        // Se houver overrides que toquem na estadia, a regra mais estrita (maior) prevalece
        for (RuleOverride ro : overrides) {
            if (ro.getMinNightsOverride() != null && ro.getMinNightsOverride() > effectiveMinNights) {
                effectiveMinNights = ro.getMinNightsOverride();
            }
        }
        if (nights < effectiveMinNights) {
            errors.add("Para este período, o número mínimo de noites é " + effectiveMinNights);
        }

        // --- Regra: Allowed Check-in Days ---
        for (RuleOverride ro : overrides) {
            // Se o dia de Check-in cair dentro do período deste override
            if (!request.checkInDate().isBefore(ro.getStartDate()) && !request.checkInDate().isAfter(ro.getEndDate())) {
                if (ro.getAllowedCheckInDays() != null && !ro.getAllowedCheckInDays().isEmpty()) {
                    if (!ro.getAllowedCheckInDays().contains(request.checkInDate().getDayOfWeek())) {
                        errors.add("Neste período, o Check-in só é permitido em: " + ro.getAllowedCheckInDays());
                    }
                }
            }
        }

        // --- Regra: Allowed Check-out Days ---
        for (RuleOverride ro : overrides) {
            // Se o dia de Check-out cair dentro do período deste override
            if (!request.checkOutDate().isBefore(ro.getStartDate()) && !request.checkOutDate().isAfter(ro.getEndDate())) {
                if (ro.getAllowedCheckOutDays() != null && !ro.getAllowedCheckOutDays().isEmpty()) {
                    if (!ro.getAllowedCheckOutDays().contains(request.checkOutDate().getDayOfWeek())) {
                        errors.add("Neste período, o Check-out só é permitido em: " + ro.getAllowedCheckOutDays());
                    }
                }
            }
        }

        // --- Regra: Lead Time (Base) ---
        if (baseRule != null && baseRule.getBookingLeadTimeDays() != null) {
            LocalDate minCheckInDate = LocalDate.now().plusDays(baseRule.getBookingLeadTimeDays());
            if (request.checkInDate().isBefore(minCheckInDate)) {
                errors.add("A reserva deve ser feita com pelo menos " + baseRule.getBookingLeadTimeDays() + " dias de antecedência.");
            }
        }

        // Retorno de erros se existirem
        if (!errors.isEmpty()) {
            return PropertyQuoteResponse.failure(errors);
        }

        // 4. Cálculo de Preço (Sazonalidade)
        BigDecimal totalPrice = calculateTotalPrice(propertyId, request.checkInDate(), request.checkOutDate(), null);
        
        return PropertyQuoteResponse.success(totalPrice, "EUR");
    }

    /**
     * Calcula o preço total de uma estadia para uma propriedade, aplicando regras de sazonalidade.
     */
    public BigDecimal calculateTotalPrice(Long propertyId, LocalDate checkInDate, LocalDate checkOutDate, String channel) {
        Property property = findById(propertyId);

        // Busca todas as regras de sazonalidade que se sobrepõem ao período da reserva
        List<SeasonalityRule> allRules = seasonalityRuleRepository.findByPropertyIdAndDateRange(propertyId, checkInDate, checkOutDate);

        BigDecimal total = BigDecimal.ZERO;

        for (LocalDate date = checkInDate; date.isBefore(checkOutDate); date = date.plusDays(1)) {
            final LocalDate currentDate = date;

            List<SeasonalityRule> applicableRules = allRules.stream()
                .filter(rule -> !currentDate.isBefore(rule.getStartDate()) && !currentDate.isAfter(rule.getEndDate()))
                .filter(rule -> rule.getDayOfWeek() == null || rule.getDayOfWeek() == currentDate.getDayOfWeek())
                .filter(rule -> rule.getChannel() == null || rule.getChannel().equalsIgnoreCase(channel))
                .toList();

            BigDecimal modifier = BigDecimal.ONE;

            if (!applicableRules.isEmpty()) {
                SeasonalityRule bestRule = applicableRules.stream()
                        .max(Comparator.comparingInt(this::getRulePriority))
                        .orElseThrow();

                modifier = bestRule.getPriceModifier();
            }

            total = total.add(property.getBasePrice().multiply(modifier));
        }

        return total;
    }

    /**
     * Define a prioridade de uma regra de sazonalidade.
     */
    private int getRulePriority(SeasonalityRule rule) {
        int priority = 0;
        if (rule.getChannel() != null && !rule.getChannel().isEmpty()) {
            priority += 100;
        }
        if (rule.getDayOfWeek() != null) {
            priority += 50;
        }
        return priority;
    }



    public ExpandedPropertyResponse convertToExpandedDto(Property p) {
        List<String> amenityNames = p.getAmenities().stream()
                .map(Amenity::getName)
                .map(this::resolveAmenityName)
                .toList();

        var rule = p.getPropertyRule();
        var ruleDto = rule == null ? null :
                new PropertyRuleDTO(
                        rule.getCheckInTime(), rule.getCheckOutTime(),
                        rule.getMinNights(), rule.getMaxNights(), rule.getBookingLeadTimeDays()
                );

        List<SeasonalityRuleDTO> seasonality = p.getSeasonalityRules().stream()
                .map(r -> new SeasonalityRuleDTO(
                        r.getId(), r.getStartDate(), r.getEndDate(), r.getPriceModifier(), r.getDayOfWeek(), r.getChannel()
                )).toList();

        return new ExpandedPropertyResponse(
                p.getId(), p.getName(), p.getDescription(), p.getLocation(), p.getCity(), p.getAddress(),
                p.getBasePrice(), p.getMaxGuests(), p.getIsActive(), amenityNames, ruleDto, seasonality,
                imageStorageService.resolveDeliveryUrl(p.getImageUrl())
        );
    }
}
