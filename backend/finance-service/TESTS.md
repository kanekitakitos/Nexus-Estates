# finance-service — Testes

## Índice
- [Classe "FinancePaymentServiceTest"](#classe-financepaymentservicetest)
- [Classe "StripeWebhookServiceTest"](#classe-stripewebhookservicetest)
- [Classe "InvoiceOrchestratorTest"](#classe-invoiceorchestratortest)

### Classe "FinancePaymentServiceTest"
- confirmPayment_whenSuccess_notifiesBookingAndEnsuresInvoice:
    'Verifica que confirmPayment confirma o intent no provider, atualiza/persiste Payment, notifica Booking (markPaymentSucceeded) e garante emissão de Invoice via InvoiceOrchestrator.'
- createPaymentIntent_persistsPaymentRecord:
    'Verifica que createPaymentIntent cria intent no provider e persiste o registo Payment com bookingId, provider, paymentIntentId e status PENDING.'

### Classe "StripeWebhookServiceTest"
- handleStripeWebhook_whenDuplicateEvent_doesNotProcessFurther:
    'Verifica idempotência: ao detetar evento duplicado (ProcessedEventRepository lança DataIntegrityViolationException), não processa pagamentos, não chama Proxy e não emite invoice.'
- handleStripeWebhook_whenSignatureInvalid_throwsPaymentProcessingException:
    'Verifica que uma assinatura inválida do Stripe webhook lança PaymentProcessingException e não persiste ProcessedEvent.'

### Classe "InvoiceOrchestratorTest"
- ensureInvoiceForPayment_createsPendingInvoiceWhenMissing_andIssuesWhenProviderEnabled:
    'Verifica que, quando não existe Invoice, o orchestrator cria invoice PENDING e emite (ISSUED) quando o provider está ativo, preenchendo legalId, pdfUrl e issuedAt.'
- ensureInvoiceForPayment_createsPendingInvoiceAndDoesNotIssueWhenProviderNone:
    'Verifica que, quando o provider de faturação é NONE, o orchestrator cria invoice PENDING e não chama issue().'

