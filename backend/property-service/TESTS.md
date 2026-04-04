# property-service — Testes

## Índice
- [Classe "AmenityControllerTest"](#classe-amenitycontrollertest)
- [Classe "PropertyControllerTest"](#classe-propertycontrollertest)
- [Classe "PropertyControllerNewEndpointsTest"](#classe-propertycontrollernewendpointstest)
- [Classe "AmenityTest"](#classe-amenitytest)
- [Classe "PropertyTest"](#classe-propertytest)
- [Classe "PropertyPermissionTest"](#classe-propertypermissiontest)
- [Classe "SeasonalityRuleTest"](#classe-seasonalityruletest)
- [Classe "AmenityServiceTest"](#classe-amenityservicetest)
- [Classe "CloudinaryServiceTest"](#classe-cloudinaryservicetest)
- [Classe "PermissionServiceTest"](#classe-permissionservicetest)
- [Classe "PropertyRuleServiceTest"](#classe-propertyruleservicetest)
- [Classe "PropertyServiceNewTest"](#classe-propertyservicenewtest)
- [Classe "PropertyServiceTest"](#classe-propertyservicetest)

### Classe "AmenityControllerTest"
- shouldCreateAmenityWithSuccess:
    'Verifica que POST /api/amenities cria uma comodidade com CSRF e devolve 201 com id e name.pt.'
- shouldReturnBadRequestWhenNameIsNull:
    'Verifica que POST /api/amenities devolve 400 quando name é nulo (validação).'
- shouldListAllAmenities:
    'Verifica que GET /api/amenities devolve lista de comodidades e mantém name.pt.'
- shouldGetAmenityById:
    'Verifica que GET /api/amenities/{id} devolve 200 e os dados da comodidade.'
- shouldUpdateAmenityWithSuccess:
    'Verifica que PUT /api/amenities/{id} atualiza a comodidade (com CSRF) e devolve 200 com name.pt atualizado.'
- shouldDeleteAmenityWithNoContent:
    'Verifica que DELETE /api/amenities/{id} devolve 204 No Content (com CSRF).'

### Classe "PropertyControllerTest"
- shouldReturnCreatedWhenRequestIsValid:
    'Verifica que create(CreatePropertyRequest) devolve 201 Created e invoca PropertyService.create.'
- shouldAddAmenityToProperty:
    'Verifica que addAmenity devolve 200 OK e ApiResponse.success após PropertyService.addAmenity.'
- shouldRemoveAmenityFromProperty:
    'Verifica que removeAmenity devolve 200 OK e ApiResponse.success após PropertyService.removeAmenity.'
- shouldReturnUploadParameters:
    'Verifica que getUploadParams devolve Future com 200 OK e ApiResponse contendo os parâmetros de upload.'

### Classe "PropertyControllerNewEndpointsTest"
- listByUser:
    'Verifica que listByUser devolve 200 OK e ApiResponse.success quando PropertyService.listByUserWithFilters retorna Page.'
- getExpanded:
    'Verifica que getExpanded devolve 200 OK e ExpandedPropertyResponse não nulo.'
- patch:
    'Verifica que patch chama PropertyService.updateProperty e devolve 200 OK.'
- delete:
    'Verifica que delete devolve 204 No Content e invoca PropertyService.deleteProperty.'
- history:
    'Verifica que history devolve 200 OK e lista de PropertyChangeLog.'
- documentUploadParams:
    'Verifica que documentUploadParams devolve 200 OK e inclui context_property_id nos parâmetros de upload.'

### Classe "AmenityTest"
- testAmenityData:
    'Verifica getters/setters de Amenity para id, name(Map i18n) e category.'
- testAmenityCategories:
    'Verifica que diferentes valores do enum AmenityCategory podem ser atribuídos.'
- testInitialState:
    'Verifica estado inicial (campos nulos) numa Amenity nova.'

### Classe "PropertyTest"
- testPropertyData:
    'Verifica getters/setters de Property para id, name, description(Map), location, city, address, basePrice, maxGuests e isActive.'

### Classe "PropertyPermissionTest"
- testPropertyPermissionData:
    'Verifica getters/setters de PropertyPermission para id, propertyId, userId e accessLevel.'
- testConstructorAndNulls:
    'Verifica estado inicial (campos nulos) numa PropertyPermission nova.'

### Classe "SeasonalityRuleTest"
- isActiveOn_ShouldReturnTrue_WhenDateIsWithinRange:
    'Verifica que isActiveOn devolve true para datas dentro do intervalo startDate/endDate.'
- isActiveOn_ShouldReturnFalse_WhenDateIsOutsideRange:
    'Verifica que isActiveOn devolve false para datas fora do intervalo.'
- isActiveOn_ShouldCheckDayOfWeek_WhenSpecified:
    'Verifica que isActiveOn respeita o DayOfWeek quando configurado.'
- matchesChannel_ShouldReturnTrue_WhenChannelMatches:
    'Verifica que matchesChannel devolve true quando o canal coincide (case-insensitive).'
- matchesChannel_ShouldReturnTrue_WhenRuleHasNoChannel:
    'Verifica que matchesChannel devolve true quando a regra não tem canal (regra global).'
- validateDateRange_ShouldThrowException_WhenRangeIsInvalid:
    'Verifica via reflexão que validateDateRange lança exceção quando endDate é anterior a startDate.'

### Classe "AmenityServiceTest"
- shouldCreateAmenityWithSuccess:
    'Verifica que AmenityService.create persiste uma comodidade e mantém traduções (pt/en).'
- shouldFindAllAmenities:
    'Verifica que AmenityService.findAll devolve lista e preserva traduções.'
- shouldFindAmenityByIdWithSuccess:
    'Verifica que AmenityService.findById devolve a entidade quando existe.'
- shouldThrowAmenityNotFoundExceptionWhenIdDoesNotExist:
    'Verifica que AmenityService.findById lança AmenityNotFoundException para ID inexistente.'

### Classe "CloudinaryServiceTest"
- shouldGenerateRequiredParameters:
    'Verifica que CloudinaryService gera signature, timestamp, api_key e configurações (cloud_name, folder) no mapa de upload.'
- shouldSetCorrectExpiration:
    'Verifica que expires_at - timestamp é 900 segundos (15 minutos).'

### Classe "PermissionServiceTest"
- shouldCreatePermissionWithSuccess:
    'Verifica que PermissionService.create persiste e devolve a permissão com id.'
- shouldFindAllPermissions:
    'Verifica que PermissionService.findAll devolve lista de permissões.'
- shouldFindPermissionById:
    'Verifica que PermissionService.findById devolve a permissão quando existe.'
- shouldThrowExceptionWhenPermissionNotFound:
    'Verifica que PermissionService.findById lança RuntimeException quando não existe.'
- shouldDeletePermission:
    'Verifica que PermissionService.delete invoca deleteById no repositório.'

### Classe "PropertyRuleServiceTest"
- getRules_ShouldReturnRules_WhenPropertyExistsAndHasRules:
    'Verifica que getRules devolve regras configuradas quando a propriedade tem PropertyRule.'
- getRules_ShouldReturnDefaultRules_WhenPropertyExistsButHasNoRules:
    'Verifica que getRules devolve valores default quando a propriedade não tem regras.'
- getRules_ShouldThrowException_WhenPropertyDoesNotExist:
    'Verifica que getRules lança PropertyNotFoundException quando a propriedade não existe.'
- updateRules_ShouldUpdateExistingRules:
    'Verifica que updateRules atualiza regras existentes e persiste via PropertyRuleRepository.'
- updateRules_ShouldCreateNewRules_WhenNoneExist:
    'Verifica que updateRules cria regras novas quando não existiam e persiste via PropertyRuleRepository.'

### Classe "PropertyServiceNewTest"
- updateInvalidPrice:
    'Verifica que updateProperty lança IllegalArgumentException quando basePrice é inválido (zero).'
- validUpdate:
    'Verifica que updateProperty altera campos (name, basePrice, maxGuests, isActive) e grava change logs.'

### Classe "PropertyServiceTest"
- shouldCreatePropertyWithSuccess:
    'Verifica que PropertyService.create persiste a propriedade, associa amenities e cria regra default (PropertyRule).'
- shouldCalculatePriceWithoutRules:
    'Verifica que calculateTotalPrice calcula preço base sem regras (ex.: 3 noites * 100.00 = 300.00).'
- shouldCalculatePriceWithDateRangeRule2:
    'Verifica que calculateTotalPrice aplica modificador por data (+50% num dia) e soma corretamente.'
- shouldPrioritizeChannelRuleOverDateRule1:
    'Verifica que calculateTotalPrice prioriza regra de canal sobre regra de data quando channel é fornecido.'
- shouldCalculatePriceWithoutRules0:
    'Verifica novamente cálculo base sem regras (cenário duplicado no ficheiro).'
- shouldCalculatePriceWithDateRangeRule:
    'Verifica aplicação de regra por data (cenário duplicado no ficheiro).'
- shouldPrioritizeChannelRuleOverDateRule:
    'Verifica novamente prioridade de regra de canal (cenário duplicado no ficheiro).'
- validateAndQuote_ShouldFail_WhenCapacityExceeded:
    'Verifica que validateAndQuote falha quando guestCount excede maxGuests (retorna valid=false e erros).'
- validateAndQuote_ShouldFail_WhenMinNightsViolated:
    'Verifica que validateAndQuote falha quando viola minNights da PropertyRule.'
- validateAndQuote_ShouldSucceed_WhenValid:
    'Verifica que validateAndQuote devolve valid=true e calcula preço total quando dados são válidos.'

