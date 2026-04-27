export const bookingsTokens = {
  ui: {
    sidebar: {
      scopeBtnBaseClass: "h-9 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-colors",
      scopeBtnActiveClass: "bg-black text-white border-black",
      scopeBtnInactiveClass: "bg-white text-black/70 border-black hover:bg-black hover:text-white",
      clearBtnClass:
        "ml-auto inline-flex h-6 items-center justify-center rounded-md border-2 border-foreground dark:border-zinc-700 bg-primary/10 px-1 py-0.5 text-[7px] font-mono font-black uppercase tracking-widest text-primary transition-all",
      clearBtnShadowClass:
        "shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.25)]",
      clearBtnHoverShadowClass:
        "hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5",
      dropdownTriggerClass:
        "flex items-center justify-center gap-2 rounded-md border-2 border-foreground dark:border-zinc-700 bg-primary/10 font-mono font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-primary px-2 py-1 text-[8px]",
      dropdownContentClass:
        "border-2 border-foreground shadow-[4px_4px_0_0_#0D0D0D] p-1 bg-white/80 dark:bg-black/80 backdrop-blur-md",
      cardClass:
        "rounded-2xl border-2 border-foreground bg-background p-4 text-sm text-foreground shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.35)]",
    },
  },
  copy: {
    sidebar: {
      needsAuthTitle: "Precisa de iniciar sessão para ver as suas reservas.",
      goToLogin: "Ir para Login",
      loadingBookings: "A carregar reservas…",
      searchPlaceholder: "PESQUISAR...",
      scopeProperties: "Das Propriedades",
      scopeMine: "Minhas",
      clear: "Limpar",
      statusAllLabel: "STATUS",
      statusPendingShort: "PEND",
      statusConfirmedShort: "CONF",
      statusCancelledShort: "CANC",
      statusCompletedShort: "COMP",
      statusRefundedShort: "REFU",
      statusAll: "Todas",
      statusPending: "Pending",
      statusConfirmed: "Confirmed",
      statusCancelled: "Cancelled",
      statusCompleted: "Completed",
      statusRefunded: "Refunded",
      whenAllShort: "DATA",
      whenUpcomingShort: "FUT",
      whenPastShort: "PAS",
      whenAll: "Todas",
      whenUpcoming: "Futuras",
      whenPast: "Passadas",
      sortAscShort: "ASC",
      sortDescShort: "DESC",
      sortRecent: "Recentes",
      sortOld: "Antigas",
      empty: "Ainda não tem reservas.",
      bookingLabelPrefix: "Reserva #",
      propertyLabel: "Property: ",
      totalLabel: "Total: ",
      bookingHaystackPrefix: "reserva booking ",
    },
    errors: {
      loadProperties: "Não foi possível carregar as propriedades.",
    },
  },
} as const
