export const financeTokens = {
  copy: {
    common: {
      empty: "—",
    },
    payment: {
      failed: "Pagamento falhou.",
      incomplete: "Pagamento incompleto.",
      confirmed: "Pagamento confirmado.",
      processing: "Pagamento em processamento.",
      statusPrefix: "Estado do pagamento:",
      paying: "A pagar…",
      stripeLabel: "Stripe",
      testCardHintPrefix: "Reserva #",
      testCardHintSuffix: ". Usa um cartão de teste Stripe (ex: 4242 4242 4242 4242).",
      payPrefix: "Pagar • €",
    },
    paymentDetails: {
      bookingLabel: "Reserva",
      statusLabel: "Estado",
      providerLabel: "Provider",
      paymentLabel: "Pagamento",
      retry: "Tentar novamente",
      clientSecretLabel: "Client secret",
      copySuccess: "Copiado.",
      copyError: "Não foi possível copiar.",
      copyButton: "Copiar",
    },
  },
  ui: {
    stripePaymentPanel: {
      paymentElementContainerClass:
        "rounded-xl border-2 border-foreground bg-background p-3 shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.8)]",
      stripeTheme: "stripe",
      currencyPrefix: "€",
    },
  },
} as const
