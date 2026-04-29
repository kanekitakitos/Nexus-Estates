export const chatTokens = {
  copy: {
    errors: {
      startChat: "Não foi possível iniciar o chat.",
      sendMessage: "Falha ao enviar mensagem.",
      realtimeToken: "Falha ao obter token Ably.",
    },
    ui: {
      header: {
        backAriaLabel: "Voltar",
        statusOnline: "Online",
        statusConnecting: "A ligar...",
      },
      list: {
        searchPlaceholder: "Pesquisar por bookingId ou propertyId…",
        loading: "A carregar conversas…",
        empty: "Sem conversas disponíveis.",
        bookingPrefix: "Booking #",
        bookingInitialsPrefix: "B ",
        propertyPrefix: "Property ",
        lineJoiner: " · ",
        dateArrow: " → ",
      },
      composer: {
        messagePlaceholder: "Mensagem",
        sendButton: "Enviar",
      },
    },
  },
} as const
