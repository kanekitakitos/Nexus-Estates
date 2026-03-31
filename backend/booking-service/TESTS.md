# booking-service — Testes

## Índice
- [Classe "BookingControllerTest"](#classe-bookingcontrollertest)
- [Classe "BookingEventPublisherTest"](#classe-bookingeventpublishertest)
- [Classe "BookingEventPublisherExtendedTest"](#classe-bookingeventpublisherextendedtest)
- [Classe "CalendarBlockConsumerTest"](#classe-calendarblockconsumertest)
- [Classe "BookingRepositoryTest"](#classe-bookingrepositorytest)
- [Classe "BookingPaymentServiceTest"](#classe-bookingpaymentservicetest)
- [Classe "BookingServiceTest"](#classe-bookingservicetest)
- [Classe "BookingServiceIntegrationTest"](#classe-bookingserviceintegrationtest)
- [Classe "PaymentExceptionsTest"](#classe-paymentexceptionstest)

### Classe "BookingControllerTest"
- shouldCreateBookingSuccessfully:
    'Verifica que o POST /api/bookings cria uma reserva com sucesso e devolve 201 com id e status PENDING_PAYMENT.'
- shouldReturn400BadRequestWhenInputIsInvalid:
    'Verifica que o POST /api/bookings com payload inválido (datas/guestCount/userId) devolve 400 e corpo de erro.'
- shouldReturn409ConflictWhenDatesOverlap:
    'Verifica que, quando o BookingService lança BookingConflictException, o controller devolve 409 e a mensagem.'
- shouldReturnBookingWhenIdExists:
    'Verifica que o GET /api/bookings/{id} devolve 200 e os dados quando a reserva existe.'
- shouldReturnBookingsByProperty:
    'Verifica que o GET /api/bookings/property/{propertyId} devolve lista com propertyId correto.'
- shouldReturnEmptyListForProperty:
    'Verifica que o GET /api/bookings/property/{propertyId} devolve lista vazia quando não há reservas.'
- shouldReturnBookingsByUser:
    'Verifica que o GET /api/bookings/user/{userId} devolve lista com userId correto.'

### Classe "BookingEventPublisherTest"
- shouldPublishBookingCreatedEvent:
    'Verifica que o publisher envia BookingCreatedMessage para o exchange e routing key configurados.'
- shouldHandleStatusUpdatedEventAndUpdateBooking:
    'Verifica que, ao receber BookingStatusUpdatedMessage, o booking é carregado do repositório e guardado após atualização.'

### Classe "BookingEventPublisherExtendedTest"
- shouldPublishBookingUpdatedEventSuccessfully:
    'Verifica que publishBookingUpdated envia BookingUpdatedMessage com o routing key booking.updated.'
- shouldPublishBookingCancelledEventSuccessfully:
    'Verifica que publishBookingCancelled envia BookingCancelledMessage com o routing key booking.cancelled.'
- shouldHandleStatusUpdatedEventAndUpdateBooking:
    'Verifica que handleStatusUpdated altera o status do booking e persiste no repositório.'
- shouldHandleEventWhenBookingNotFound:
    'Verifica que, se o booking não existir, o evento não tenta guardar alterações (never save).'
- shouldHandleRabbitTemplateExceptionGracefully:
    'Verifica que uma falha do RabbitTemplate em convertAndSend é propagada e que o envio foi tentado.'
- shouldPublishEventWithDifferentRoutingKeys:
    'Verifica que um publisher configurado com exchange/routing key diferentes publica o evento com esses valores.'

### Classe "CalendarBlockConsumerTest"
- shouldCreateBlockWhenNoOverlap:
    'Verifica que um CalendarBlockMessage cria um bloqueio quando não existe booking sobreposto (save é chamado).'
- shouldNotCreateBlockWhenOverlap:
    'Verifica que um CalendarBlockMessage não cria bloqueio quando existe booking sobreposto (save não é chamado).'

### Classe "BookingRepositoryTest"
- shouldReturnTrueWhenBookingOverlaps:
    'Verifica que existsOverlappingBooking devolve true para múltiplos cenários de overlap (antes/dentro/exato/abrange).'
- shouldReturnFalseWhenNoOverlap:
    'Verifica que existsOverlappingBooking devolve false quando o intervalo não sobrepõe a reserva existente.'

### Classe "BookingPaymentServiceTest"
- shouldCreatePaymentIntentSuccessfully:
    'Verifica que createPaymentIntent cria um intent via FinanceClient para booking PENDING_PAYMENT e devolve PaymentResponse válido.'
- shouldThrowExceptionWhenCreatingPaymentIntentForConfirmedBooking:
    'Verifica que createPaymentIntent falha para booking CONFIRMED e não chama FinanceClient.'
- shouldThrowExceptionWhenCreatingPaymentIntentForCancelledBooking:
    'Verifica que createPaymentIntent falha para booking CANCELLED e não chama FinanceClient.'
- shouldConfirmPaymentSuccessfully:
    'Verifica que confirmPayment delega ao FinanceClient e devolve PaymentResponse.Success com status SUCCEEDED.'
- shouldProcessDirectPaymentSuccessfully:
    'Verifica que processDirectPayment delega ao FinanceClient e devolve status SUCCEEDED.'
- shouldProcessRefundSuccessfully:
    'Verifica que processRefund para booking CONFIRMED cria reembolso via FinanceClient e publica BookingCancelledMessage.'
- shouldThrowExceptionWhenProcessingRefundForNonConfirmedBooking:
    'Verifica que processRefund falha quando o booking não está CONFIRMED e não chama FinanceClient.'
- shouldGetTransactionDetailsSuccessfully:
    'Verifica que getTransactionDetails devolve TransactionInfo com o transactionId esperado.'
- shouldThrowExceptionWhenTransactionNotFound:
    'Verifica que getTransactionDetails converte erro do FinanceClient em PaymentNotFoundException com mensagem contextual.'
- shouldGetPaymentStatusSuccessfully:
    'Verifica que getPaymentStatus devolve o status retornado pelo FinanceClient.'
- shouldCheckIfPaymentMethodIsSupported:
    'Verifica que supportsPaymentMethod interpreta o mapa de retorno do FinanceClient para um boolean.'
- shouldGetProviderInfoSuccessfully:
    'Verifica que getProviderInfo devolve ProviderInfo retornado pelo FinanceClient.'

### Classe "BookingServiceTest"
- createBooking_ShouldThrowRuleViolation_WhenNightsLessThanMin:
    'Verifica que createBooking lança RuleViolationException quando o quote indica mínimo de noites não cumprido.'
- createBooking_ShouldThrowRuleViolation_WhenNightsMoreThanMax:
    'Verifica que createBooking lança RuleViolationException quando o quote indica máximo de noites excedido.'
- createBooking_ShouldThrowRuleViolation_WhenLeadTimeNotMet:
    'Verifica que createBooking lança RuleViolationException quando o quote indica lead time não cumprido.'
- createBooking_ShouldSucceed_WhenRulesAreMet:
    'Verifica que createBooking persiste a reserva e publica evento quando quote é válido e não há overlap.'

### Classe "BookingServiceIntegrationTest"
- shouldCreateBookingInIntegratedFlow:
    'Verifica o fluxo integrado (mocks de Proxy/clients): quote válido, sem overlap, reserva criada e evento publicado.'

### Classe "PaymentExceptionsTest"
- shouldCreatePaymentProcessingExceptionWithMessage:
    'Verifica construção de PaymentProcessingException com mensagem e sem causa.'
- shouldCreatePaymentProcessingExceptionWithMessageAndCause:
    'Verifica construção de PaymentProcessingException com mensagem e causa.'
- shouldCreatePaymentNotFoundExceptionWithMessage:
    'Verifica construção de PaymentNotFoundException com mensagem e sem causa.'
- shouldCreatePaymentNotFoundExceptionWithMessageAndCause:
    'Verifica construção de PaymentNotFoundException com mensagem e causa.'
- shouldCreateInvalidRefundExceptionWithMessage:
    'Verifica construção de InvalidRefundException com mensagem e sem causa.'
- shouldCreateInvalidRefundExceptionWithMessageAndCause:
    'Verifica construção de InvalidRefundException com mensagem e causa.'
- shouldCreateInvalidRefundExceptionWithAmountAndReason:
    'Verifica construção de InvalidRefundException com transactionId, requestedAmount, availableAmount e refundReason.'
- shouldVerifyExceptionInheritance:
    'Verifica que as exceções de pagamento herdam de RuntimeException.'
- shouldVerifyExceptionStackTrace:
    'Verifica que a stack trace é criada e referencia a classe de teste.'

