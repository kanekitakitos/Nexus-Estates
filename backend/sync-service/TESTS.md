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
- [Classe "SyncMessageControllerTest"](#classe-syncmessagecontrollertest)
- [Classe "AblyWebhookServiceTest"](#classe-ablywebhookservicetest)
- [Classe "MessageServiceTest"](#classe-messageservicetest)
- [Classe "WebhookSubscriptionControllerTest"](#classe-webhooksubscriptioncontrollertest)
- [Classe "WebhookSubscriptionServiceTest"](#classe-webhooksubscriptionservicetest)
- [Classe "WebhookDispatcherServiceTest"](#classe-webhookdispatcherservicetest)
- [Classe "WebhookEventListenerTest"](#classe-webhookeventlistenertest)

### Classe "ExternalApiClientConfigTest"
- shouldCreateRestClientWithDynamicConfig:
  'Verifica que a factory cria um RestClient válido quando invocada com URL base e headers personalizados.'
- shouldCreateRestClientWithDefaultUrl:
  'Verifica que a factory cria um RestClient válido quando invocada sem parâmetros específicos.'

### Classe "RabbitMQConfigTest"
- bookingCreatedQueueHasDlqConfigured:
  'Verifica que a booking.created.queue é durável e tem x-dead-letter-exchange e x-dead-letter-routing-key configurados correctamente.'
- bookingStatusUpdatedQueueHasDlqConfigured:
  'Verifica que a booking.status.updated.queue é durável e aponta para a DLQ correcta.'
- bookingDeadLetterExchangeHasConfiguredName:
  'Verifica que o bookingDeadLetterExchange usa o nome configurado via @Value.'

### Classe "DlqAdminControllerTest"
- shouldDrainBookingCreatedDlq:
  'Verifica que drainBookingCreatedDlq consume mensagens da fila booking.created.dlq até null e devolve lista com todas as mensagens drenadas.'
- shouldDrainBookingStatusUpdatedDlq:
  'Verifica que drainBookingStatusUpdatedDlq consume mensagens da fila booking.status.updated.dlq até null e devolve lista com todas as mensagens drenadas.'

### Classe "IcsAdminControllerTest"
- shouldParseRawIcs:
  'Verifica que parseRaw devolve 200 OK e lista de SyncBlockDTO quando o conteúdo .ics bruto é válido.'
- shouldParseMultipartIcs:
  'Verifica que parseFile devolve 200 OK e lista de SyncBlockDTO quando o ficheiro multipart é válido.'
- shouldApplyBlocksFromRaw:
  'Verifica que applyRaw publica CalendarBlockMessage no RabbitMQ para cada bloco parseado e devolve 200 OK.'
- shouldApplyBlocksFromFile:
  'Verifica que applyFile publica CalendarBlockMessage no RabbitMQ para cada bloco parseado via ficheiro multipart e devolve 200 OK.'

### Classe "PropertyEventListenerTest"
- shouldCallEmailServiceOnMessage:
  'Verifica que, ao receber evento de property criada, o listener chama EmailService.sendEmailFromTemplate com template e dados esperados.'

### Classe "SyncConsumerTest"
- shouldProcessBookingCreatedAndPublishStatusUpdated:
  'Verifica que ao consumir BookingCreatedMessage, o BookingEventListener chama BookingSyncService.syncBooking e publica BookingStatusUpdatedMessage com o resultado correcto para o exchange configurado.'

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

### Classe "SyncMessageControllerTest"
- handleWebhook_ShouldReturnOk_WhenSignatureIsValid:
  'Verifica que o endpoint recebe webhooks do Ably com sucesso (200 OK) se a assinatura HMAC for válida e delega o payload.'
- handleWebhook_ShouldReturnUnauthorized_WhenSignatureIsInvalid:
  'Verifica que o sistema rejeita (401 Unauthorized) pedidos do Ably com assinaturas inválidas.'

### Classe "AblyWebhookServiceTest"
- processPayload_ShouldExtractBookingId_AndDelegateToMessageService:
  'Verifica a extração correta de IDs de canais e a delegação da lógica de domínio para o MessageService.'
- processPayload_ShouldIgnore_WhenChannelIsInvalid:
  'Assegura que formatos inválidos de canais não bloqueiam o fluxo nem disparam exceções indesejadas.'

### Classe "MessageServiceTest"
- handleNewIncomingMessage_ShouldSaveAndNotifyRecipient:
  'Verifica se a persistência e a lógica de orquestração com Proxy e EmailService correm em conformidade com as UserPreferences.'

### Classe "WebhookSubscriptionControllerTest"
- create_ShouldReturnCreatedResponse_WhenValidRequest:
  'Verifica que a criação de uma subscrição retorna 200 OK e expõe o segredo gerado apenas uma vez.'
- list_ShouldReturnListOfSubscriptions:
  'Garante que os utilizadores conseguem recuperar as suas subscrições sem expor o segredo e de acordo com o X-User-Id.'
- delete_ShouldReturnSuccess:
  'Verifica a rota de eliminação delegando para o WebhookSubscriptionService.'

### Classe "WebhookSubscriptionServiceTest"
- createSubscription_ShouldSaveEntityAndReturnSecret:
  'Verifica que a geração de secrets, conversão CSV de eventos e persistência decorrem como planeado.'
- deleteSubscription_ShouldDelete_WhenUserIsOwner:
  'Verifica que os direitos de propriedade (Tenancy) da subscrição são validados na eliminação.'
- toggleSubscription_ShouldThrowException_WhenUserIsNotOwner:
  'Verifica que é lançada uma exceção ao tentar alterar o estado de uma subscrição que não pertence ao utilizador.'

### Classe "WebhookDispatcherServiceTest"
- dispatch_ShouldSerializeSignAndSendPayload_WhenSubscriptionExists:
  'Verifica o coração da US-38: garante serialização JSON correta, cálculo de assinatura HMAC-SHA256, e o POST via ExternalSyncService.'
- dispatch_ShouldNotSendAnything_WhenNoActiveSubscriptionsExist:
  'Verifica que o Dispatcher não executa chamadas HTTP desnecessárias se não existirem webhooks para o evento.'

### Classe "WebhookEventListenerTest"
- onBookingCreated_ShouldDispatchEvent:
  'Verifica que o listener converte a mensagem RabbitMQ em chamada de despacho `booking.created`.'
- onBookingStatusUpdated_ShouldDispatchEvent:
  'Verifica que o listener converte a mensagem RabbitMQ em chamada de despacho `booking.status.updated`.'