# sync-service — Testes

## Índice
- [Classe "ExternalApiClientConfigTest"](#classe-externalapiclientconfigtest)
- [Classe "RabbitMQConfigTest"](#classe-rabbitmqconfigtest)
- [Classe "DlqAdminControllerTest"](#classe-dlqadmincontrollertest)
- [Classe "IcsAdminControllerTest"](#classe-icsadmincontrollertest)
- [Classe "PropertyEventListenerTest"](#classe-propertyeventlistenertest)
- [Classe "SyncConsumerTest"](#classe-syncconsumertest)
- [Classe "BookingSyncServiceTest"](#classe-bookingsyncservicetest)
- [Classe "EmailServiceTest"](#classe-emailservicetest)
- [Classe "ExternalAuthServiceTest"](#classe-externalauthservicetest)
- [Classe "ExternalSyncServiceTest"](#classe-externalsyncservicetest)
- [Classe "ExternalSyncServiceIT"](#classe-externalsyncserviceit)
- [Classe "IcsCalendarParserServiceTest"](#classe-icscalendarparserservicetest)

### Classe "ExternalApiClientConfigTest"
- shouldCreateExternalApiRestClient:
    'Verifica que o bean RestClient para APIs externas é criado (context loads) e não é nulo.'

### Classe "RabbitMQConfigTest"
- shouldCreateRabbitBeans:
    'Verifica que as configurações RabbitMQ (queues/exchanges/bindings) são carregadas e os beans principais existem.'

### Classe "DlqAdminControllerTest"
- shouldReturnDlqMessages:
    'Verifica que o endpoint de administração de DLQ devolve lista de mensagens (simulada via RabbitTemplate/Receiver).'

### Classe "IcsAdminControllerTest"
- shouldParseIcsAndReturnBlocks:
    'Verifica que o endpoint de parsing ICS devolve 200 OK e lista de SyncBlockDTO a partir de conteúdo .ics válido.'
- shouldReturnBadRequestOnInvalidIcs:
    'Verifica que conteúdo .ics inválido resulta em 400 Bad Request.'

### Classe "PropertyEventListenerTest"
- shouldCallEmailServiceOnMessage:
    'Verifica que, ao receber evento de property criada, o listener chama EmailService.sendEmailFromTemplate com template e dados esperados.'

### Classe "SyncConsumerTest"
- shouldConsumeBookingCreatedAndPublishStatusUpdated:
    'Verifica que ao consumir BookingCreatedMessage, o consumidor chama BookingSyncService e publica BookingStatusUpdatedMessage.'

### Classe "BookingSyncServiceTest"
- shouldReturnConfirmedWhenExternalApproves:
    'Verifica que syncBooking devolve BookingStatus CONFIRMED quando o conector externo retorna approved=true.'
- shouldReturnCancelledWhenExternalRejects:
    'Verifica que syncBooking devolve BookingStatus CANCELLED quando approved=false e mantém a reason.'
- shouldReturnCancelledWhenIntegrationFails:
    'Verifica que syncBooking devolve CANCELLED com mensagem de fallback quando o conector retorna Optional.empty().'

### Classe "EmailServiceTest"
- shouldProcessTemplateAndSendEmailAndLogSuccess:
    'Verifica fluxo de sucesso: processa template, envia email e persiste EmailLog com status SUCCESS.'
- shouldLogFailureWhenEmailSendingFails:
    'Verifica fluxo de falha tolerante: captura exceção do mailSender e persiste EmailLog com status FAILED e errorMessage.'

### Classe "ExternalAuthServiceTest"
- shouldApplyBearerAuth:
    'Verifica que applyAuthentication coloca Authorization: Bearer <token> quando authType=BEARER.'
- shouldApplyBasicAuth:
    'Verifica que applyAuthentication coloca Authorization: Basic <base64(user:pass)> quando authType=BASIC.'
- shouldApplyApiKey:
    'Verifica que applyAuthentication coloca X-API-Key quando authType=API_KEY.'
- shouldApplyCustomHeaders:
    'Verifica que applyAuthentication aplica headers customizados quando fornecidos em customHeaders.'

### Classe "ExternalSyncServiceTest"
- shouldReturnOptionalWithResponseOnSuccess:
    'Verifica que post retorna Optional presente quando RestClient devolve body válido e que authService.applyAuthentication é chamado.'
- shouldReturnTrueOnPostWithoutResponseSuccess:
    'Verifica que postWithoutResponse retorna true quando RestClient devolve bodiless entity e que authService.applyAuthentication é chamado.'

### Classe "ExternalSyncServiceIT"
- confirmedWhenExternalApproves:
    'Verifica integração com MockWebServer: BookingSyncService retorna CONFIRMED quando a API externa devolve approved=true.'
- emptyOptionalOnServerError:
    'Verifica integração: ExternalSyncService.post retorna Optional.empty() em erros HTTP 500 repetidos.'
- circuitBreakerOpensAfterFailures:
    'Verifica integração com Resilience4j: após falhas consecutivas, o CircuitBreaker externalApi entra em estado OPEN.'

### Classe "IcsCalendarParserServiceTest"
- shouldParseUtcEvents:
    'Verifica parsing de eventos com sufixo Z (UTC) e mapeamento correto de startUtc/endUtc.'
- shouldConvertTimezonedEventsToUtc:
    'Verifica conversão de eventos com TZID (ex.: America/New_York) para UTC.'
- shouldHandleAllDayEventsAsUtcMidnightBounds:
    'Verifica que eventos all-day (VALUE=DATE) são convertidos para limites UTC à meia-noite.'
- shouldIgnoreEventsMissingDates:
    'Verifica que eventos sem DTSTART ou sem DTEND são ignorados (lista vazia).'
- shouldThrowForInvalidIcs:
    'Verifica que conteúdo inválido lança IllegalArgumentException com mensagem apropriada.'
- shouldHandleFloatingEventsUsingDefaultTimezone:
    'Verifica que eventos floating (sem TZID e sem Z) usam o timezone por omissão (TimeZone.getDefault).'

