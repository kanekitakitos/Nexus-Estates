export const nexusEyebrowClass =
  "font-mono text-[9px] font-black uppercase tracking-[0.32em] text-[#0D0D0D]/65 dark:text-zinc-400"

export const nexusEyebrowAccentClass =
  "font-mono text-[10px] font-black uppercase tracking-[0.28em] text-primary"

export const nexusMutedBodyClass = "text-[#8C7B6B] dark:text-zinc-400"

export const nexusHardBorder = "border-[2px] border-[#0D0D0D] dark:border-zinc-100"

export const nexusHardBorderHeavy = "border-[3px] border-[#0D0D0D] dark:border-[#FAFAF5]"

export const nexusShadowSm = "shadow-[3px_3px_0_0_#0D0D0D] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.85)]"
export const nexusShadowMd = "shadow-[6px_6px_0_0_#0D0D0D] dark:shadow-[6px_6px_0_0_rgba(24,24,27,1)]"
export const nexusShadowLg = "shadow-[10px_10px_0_0_#0D0D0D] dark:shadow-[10px_10px_0_0_rgba(24,24,27,1)]"

export const nexusGlowPrimary = "shadow-[0_0_15px_rgba(249,115,22,0.3)] dark:shadow-[0_0_20px_rgba(249,115,22,0.2)]"
export const nexusGlowEmerald = "shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.2)]"

export const nexusGlass = "bg-[#FAFAF5]/85 dark:bg-zinc-900/85 backdrop-blur-xl"

export const nexusCardPressHover =
  "transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:translate-x-0.5 hover:translate-y-0.5"

export const nexusKineticLight = "hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0 transition-transform duration-200"
export const nexusKineticHeavy = "hover:-translate-y-2 hover:-translate-x-2 active:translate-y-0.5 active:translate-x-0.5 transition-transform duration-300"

export const proPanel =
  "rounded-2xl border-[2px] border-[#0D0D0D] bg-white shadow-[6px_6px_0_0_#0D0D0D] dark:border-zinc-100 dark:bg-zinc-950 dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.15)]"

export const proSectionTitle = "font-serif text-xl font-bold italic tracking-tight text-[#0D0D0D] dark:text-zinc-100 uppercase"

export const proMeta =
  "text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[#8C7B6B] dark:text-zinc-500"

export const propertyCopy = {
  collaboratorManager: {
    invalidEmail: "Email inválido",
    alreadyAdded: "Colaborador já adicionado",
    inviteOkPrefix: "Protocolo:",
    inviteOkSuffix: "indexado com sucesso",
    networkFail: "Falha na rede Nexus",
    roleViewer: "Leitura",
    roleEditor: "Editor",
    roleAdmin: "Admin",
    roleOwner: "Proprietário",
    roleFallback: "ROLE",
    emailPlaceholder: "nome@empresa.com",
    verifying: "Verificando",
    invite: "Convidar",
    empty: "Sem colaboradores externos indexados.",
    cardTitle: "Colaboradores",
    cardSubtitle: "Convites e níveis de acesso",
  },
  manager: {
    deleteError: "Erro ao eliminar",
  },
  amenities: {
    loadCatalogError: "Erro ao carregar catálogo",
  },
  form: {
    saveOk: "Operação concluída com sucesso",
    syncFail: "Falha na sincronização",
  },
  managementRoot: {
    eyebrow: "Asset_Management // Central",
    titleFallback: "Asset_Manager",
    modeView: "Prévia",
    modeEdit: "Dados",
    modeRules: "Regras",
    discard: "Descartar",
    saving: "A guardar…",
    save: "Guardar",
    saveOk: "Nexus Asset // Actualização executada com sucesso",
    saveFail: "Erro Crítico // Falha na sincronização do ativo",
    invalidAssetId: "Asset ID Inválido",
    deleteOk: "Ativo Desativado // Removido dos registos activos",
    deleteFail: "Falha no Decommission // Contacte o suporte técnico",
    deactivateTitle: "Desativar ativo?",
    deactivateDescription:
      "Esta ação é irreversível nos protocolos Nexus. O ativo será removido dos registos activos.",
    deactivateConfirm: "Desativar",
    deactivateCancel: "Cancelar",
  },
  filters: {
    headerKicker: "00 // Filtros",
    headerTitle: "Explorar",
    titleAttrPrefix: "Filtrar por",
    compactSearchPlaceholder: "PESQUISAR...",
    searchPlaceholder: "PESQUISAR ATIVO...",
    locationPlaceholder: "CIDADE / ZONA...",
    priceMin: "MIN",
    priceMax: "MAX",
    sortLabelDefault: "Padrão",
    sortLabelAsc: "Asc",
    sortLabelDesc: "Desc",
    sortIndicator: "ORDEM",
  },
  details: {
    identityTitle: "Identidade & Preço",
    identitySubtitle: "Definição base do ativo",
    fieldTitle: "Título do Ativo",
    fieldPrice: "Preço por Noite (€)",
    fieldDescription: "Descrição Técnica",
    mediaTitle: "Imagem Principal",
    mediaSubtitle: "Representação visual de catálogo",
    mediaHint:
      'Esta imagem será o "face" do ativo em todos os protocolos de listagem e sincronização externa. Recomenda-se formato 16:9.',
    featuredLabel: "Destaque de Portfólio",
    operationalTitle: "Estado Operacional",
    statusAvailable: "Ativo / Disponível",
    statusMaintenance: "Protocolo Manutenção",
    statusBooked: "Ocupação / Bloqueado",
    logisticsTitle: "Localização & Lotação",
    logisticsSubtitle: "Geografia e fluxos",
    fieldRegion: "Região / Zona",
    fieldCity: "Cidade",
    fieldCapacity: "Capacidade Máx.",
    criticalZone: "Critical_Zone",
    deleteProtocolTitle: "Protocolo de Exclusão",
    deleteWarningPrefix: "AVISO:",
    deleteWarningBodyPrefix: "A remoção deste ativo da rede Nexus é terminal e irreversível. Todos os dados associados no",
    deleteWarningCore: "Nexus_Core",
    deleteWarningBodySuffix: "serão apagados.",
    deleting: "EXPURGANDO DADOS...",
    authorizeDelete: "AUTORIZAR EXCLUSÃO",
    amenitiesKicker: "Protocolo_Comfort // Matrix",
    amenitiesTitle: "Comodidades do Ativo",
  },
  rules: {
    headerKicker: "Global_Override // Property_Rules",
    headerTitle: "Regras operacionais",
    headerSubtitle:
      "Configure os protocolos de janelas temporais, gestão de rendimentos via sazonalidade e a matriz de autoridade da rede Nexus para este ativo.",
    operationalCardTitle: "Horários e estadia",
    operationalCardSubtitle: "Check-in, check-out e limites",
    checkInLabel: "Check-in",
    checkInHelp: "Bloqueia entradas de hóspedes antes deste horário.",
    checkOutLabel: "Check-out",
    checkOutHelp: "Limite forçado para abandono da propriedade.",
    minNightsLabel: "Noites mínimas",
    maxNightsLabel: "Noites máximas",
    bookingLeadDaysLabel: "Antecedência (dias)",
    timezoneLabel: "Fuso Horário (UTC)",
    timezoneDefault: "Europe/Lisbon",
    timezoneOptionUTC: "UTC (Universal)",
    timezoneOptionLisbon: "Lisbon / London (WET)",
    timezoneOptionMadrid: "Madrid / Paris (CET)",
    timezoneOptionNewYork: "New York (EST)",
    timezoneOptionSaoPaulo: "São Paulo (BRT)",
    yieldCardTitle: "Preço sazonal",
    yieldCardSubtitle: "Janelas e multiplicadores",
    yieldAddDisabled: "Preencher Janelas",
    yieldAddEnabled: "Nova janela",
    yieldEmptyTitle: "Sem regras de preço sazonal",
    yieldEmptySubtitle: "Adiciona intervalos (ex.: época alta) com multiplicador sobre o preço base.",
    seasonStartLabel: "Início",
    seasonEndLabel: "Fim",
    seasonMultiplierLabel: "Multiplicador",
    removeActionTitle: "Remover",
    sectionIndex: "03",
  },
  preview: {
    noTitle: "Sem título",
    featured: "Destaque",
    statusAvailable: "Disponível",
    statusMaintenance: "Manutenção",
    statusBooked: "Ocupada",
    cityNull: "CITY_NULL",
    locationVoid: "LOCATION_VOID",
    clickToExpand: "Clica para ampliar",
    placeholderTagEmpty: "PROTOCOL_UNTAGGED · Recomenda-se etiquetagem para SEO e indexação Nexus",
    comfortVoid: "COMFORT_VOID",
    assignmentVerified: "Atribuição Verificada",
    teamNull: "EQUIP_NULL",
    managementTitle: "Gestão Operacional",
    configure: "Configurar",
    checkInOutProtocol: "Protocolo de Check-in/Out",
    checkIn: "Entrada",
    checkOut: "Saída",
    stay: "Estadia",
    leadTime: "Antecedência",
    yieldWindowsPrefix: "Janelas de Rendimento",
    protocolPrefix: "Protocolo_",
    yieldVoid: "YIELD_VOID",
    updatedViewPrefix: "Vista Atualizada //",
    systemPreview: "Nexus_Core // System_Preview",
    descriptionTitle: "Descrição",
    descriptionMissing:
      "MISSING_DESCRIPTION // Operador, descreva este ativo para o catálogo comercial da Nexus Estates.",
    geoTitle: "Geolocalização & Morada",
    tagsTitle: "Indexação de Tags",
    cityUndefined: "CITY_UNDEFINED",
    noStreetProtocol: "NO_STREET_PROTOCOL",
    locationSystemError: "LOCATION_SYSTEM_ERROR",
    servicesTitle: "Serviços & Comodidades",
    teamTitle: "Equipa & Colaboradores",
    kpiBasePriceLabel: "Preço base",
    kpiBasePriceHint: "por noite (configurável)",
    kpiCapacityLabel: "Lotação",
    kpiCapacityHint: "hóspedes máx.",
    kpiRatingLabel: "Avaliação",
    kpiRatingHint: "índice interno",
    kpiIdentifierLabel: "Identificador",
    kpiIdentifierHint: "referência",
    kpiVoid: "VOID",
    kpiZero: "00",
    kpiNa: "N/A",
    kpiNull: "NULL",
    timeFallback: "00:00",
    infinity: "∞",
    daysLabel: "DIAS",
  },
  cards: {
    fallbackTitle: "Asset",
    featuredBadge: "HOT",
    refPrefix: "REF_",
    yieldLabel: "RENDIMENTO",
    capacityLabel: "CAPACIDADE",
    systemActive: "Nexus_System_Active",
    versionTag: "Ver: 1.0.4",
    yieldEstimated: "Rendimento_Estimado //",
    audienceTarget: "Audiência_Alvo //",
    paxSuffix: "PAX",
    editAsset: "Editar_Ativo",
    locationSeparator: " - ",
  },
  list: {
    headerKicker: "Nexus_Inventory // Protocol",
    headerTitlePrefix: "Inventário de",
    headerTitleAccent: "Ativos",
    headerSubtitle: "Gestão editorial do teu alojamento local — mesmo ADN visual da landing Nexus Estates.",
    addCta: "Novo ativo",
    emptyTitle: "Nexus_Null // Vazio",
    emptyBody: "O protocolo de busca não retornou ativos para os critérios atuais.",
  },
  stats: {
    totalAssetsLabel: "Total_Ativos",
    totalAssetsSuffix: "SYS",
    operationalLabel: "Operacional",
    operationalSuffix: "OK",
    unavailableLabel: "Indisponível",
    unavailableSuffix: "LIVE",
  },
  gallery: {
    placeholderTitle: "Nexus Asset",
    placeholderModalTitle: "Nexus Gallery",
    featuredBadge: "Premium_Asset",
    prevTitle: "Anterior",
    nextTitle: "Próxima",
    fullscreenTitle: "Ecrã Inteiro",
    indexDivider: " // ",
    padChar: "0",
    uploadTitle: "Anexar Média Visual",
    uploadProtocol: "Protocolo_Upload // PNG_JPG_WEBP // Max_25MB_Asset",
    thumbAlt: "",
  },
  wizard: {
    stepEssenceLabel: "Identidade",
    stepEssenceN: "1",
    stepLocationLabel: "Localização",
    stepLocationN: "2",
    stepAmenitiesLabel: "Comodidades",
    stepAmenitiesN: "3",
    stepPermissionsLabel: "Equipa",
    stepPermissionsN: "4",
    stepPreviewLabel: "Revisão",
    stepPreviewN: "5",
    editProtocol: "Protocolo_Edição // Ativo",
    createProtocol: "Protocolo_Criação // Novo",
    essenceTitleLabel: "Título",
    essenceDescriptionLabel: "Descrição",
    essenceBaseValueLabel: "Valor Base (€)",
    locationRegionLabel: "Região",
    locationCityLabel: "Cidade",
    locationAddressLabel: "Morada",
    permissionsHint:
      "Opcional. Podes convidar colegas antes de publicar — as permissões efetivas dependem do nível de acesso Nexus.",
    previewTitleFallback: "—",
    previewSummaryTitle: "Protocolo_Final // Resumo",
    previewSummarySubtitle: "Confere os dados principais antes de guardar no Nexus_Core.",
    previewLabelTitle: "Título",
    previewLabelLocation: "Local",
    previewLabelBasePrice: "Preço base",
    previewLabelCapacity: "Lotação",
    previewLocationJoiner: " · ",
    previewPriceSuffix: " €",
    previewGuestsSuffix: " hóspedes",
    footerExit: "Sair",
    footerBack: "Anterior",
    footerSaving: "A guardar…",
    footerSave: "Guardar propriedade",
    footerNext: "Seguinte",
  },
  amenitiesField: {
    protocolEyebrow: "Nexus_Comfort_Matrix // Protocol",
    title: "Services & Comfort",
    revert: "Revert_State",
    padChar: "0",
    categoryIndexSuffix: "_INDEX",
    defaultCategory: "General",
    loading: "Initializing_Comfort_DB",
    loadingDivider: " //",
    syncPending: "Protocolo_Sincronização_Pendente",
    syncPendingDivider: " //",
    syncPendingNote: "Aguardando confirmação do operador",
  },
} as const

export const propertyPreviewUi = {
  fallbackImageUrl:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
  placeholderImages: ["/placeholder-property.jpg"],
  heroContainerClass:
    "group relative aspect-[16/9] cursor-pointer overflow-hidden rounded-2xl border-2 border-[#0D0D0D] bg-zinc-100 shadow-[8px_8px_0_0_#FF5E1A] dark:border-zinc-300 dark:bg-zinc-900 lg:aspect-[21/9]",
  boingActiveColor: "#F97316",
  kpiValueClass: "mt-3 font-serif text-3xl font-bold italic tabular-nums tracking-tighter text-[#0D0D0D] dark:text-white",
  kpiHintClass: "mt-1 text-xs text-[#8C7B6B] dark:text-zinc-500 font-medium",
  kpiIdentifierColorClass: "border-[#0D0D0D] shadow-[#0D0D0D]/10 bg-white dark:bg-zinc-900",
  aboutSectionClass: "overflow-hidden border-2 border-primary/20 bg-[#FAFAF5] dark:bg-zinc-900",
  aboutDescFilledClass: "text-[#0D0D0D]/90 dark:text-zinc-200",
  locationLeftMetaColorClass: "mb-4 flex items-center gap-2 text-[#8C7B6B]",
  locationCityClass: "text-2xl font-bold tracking-tighter text-[#0D0D0D] dark:text-white uppercase",
  locationAddressClass: "mt-2 text-sm leading-relaxed text-[#8C7B6B] dark:text-zinc-400 italic",
  locationSystemClass: "mt-3 font-mono text-[10px] font-black uppercase tracking-widest text-[#0D0D0D]/40 dark:text-zinc-500",
  tagsDividerClass: "border-[#0D0D0D]/5 dark:border-white/5 md:border-l-2 md:pl-8",
  tagChipClass:
    "rounded-md border-2 border-[#0D0D0D]/10 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-[#0D0D0D] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-none",
  untaggedClass:
    "font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#8C7B6B]/30 italic leading-loose",
  amenityChipClass:
    "rounded-lg border border-[#0D0D0D]/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0D0D0D] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
  comfortVoidClass:
    "font-mono text-[10px] font-black uppercase tracking-widest text-[#8C7B6B]/30 italic",
  teamTitleRowClass: "mb-6 flex items-center gap-2 text-[#8C7B6B]",
  teamRowClass:
    "flex items-center justify-between gap-4 border-b border-[#0D0D0D]/5 pb-3 last:border-0 dark:border-zinc-800",
  teamEmailClass: "truncate text-sm font-bold text-[#0D0D0D] dark:text-zinc-200",
  assignmentVerifiedClass: "font-mono text-[8px] uppercase tracking-widest text-[#8C7B6B]",
  permLevelBadgeClass:
    "shrink-0 rounded-md border-2 border-[#0D0D0D] bg-white px-2 py-0.5 font-mono text-[9px] font-black uppercase text-[#0D0D0D] shadow-[2px_2px_0_0_#0D0D0D]",
  teamNullClass:
    "font-mono text-[10px] font-black uppercase tracking-widest text-[#8C7B6B]/30 italic py-4",
  rulesOuterClass: "overflow-hidden border-2 border-[#0D0D0D] dark:border-white/20",
  rulesHeaderClass:
    "flex items-center justify-between border-b-2 border-[#0D0D0D] px-6 py-5 dark:border-white/10 bg-[#FAFAF5] dark:bg-zinc-900/80",
  rulesIconBadgeClass: "flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D0D0D] text-white",
  rulesButtonClass:
    "group flex items-center gap-2 rounded-xl border-2 border-[#0D0D0D] bg-white px-4 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] transition-all hover:bg-primary hover:text-white dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-300 shadow-[4px_4px_0_0_#0D0D0D]",
  rulesLeftPanelClass: "border-[#0D0D0D]/10 p-6 md:p-8 dark:border-white/10 lg:border-r-2",
  checkOutCardClass: "flex-1 rounded-2xl border-2 border-[#0D0D0D]/5 bg-[#FAFAF5]/50 p-6 text-center",
  checkOutTimeClass: "font-serif text-4xl font-bold italic text-[#0D0D0D] dark:text-white",
  checkOutLabelClass: "mt-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#8C7B6B]",
  infoBoxClass: "rounded-xl border-2 border-[#0D0D0D]/5 bg-[#FAFAF5]/30 p-5",
  infoValueClass: "mt-3 font-serif text-lg font-bold italic text-[#0D0D0D] dark:text-white",
  seasonsPanelClass: "bg-[#FAFAF5]/30 p-6 md:p-8 dark:bg-zinc-900/20",
  seasonRowClass: "flex items-center justify-between rounded-xl border-2 border-[#0D0D0D]/5 bg-white p-4",
  yieldVoidClass:
    "py-12 text-center opacity-30 font-mono text-[10px] font-black uppercase tracking-widest",
  footerClass:
    "flex flex-col gap-4 border-t border-[#0D0D0D]/15 pt-8 text-sm text-[#8C7B6B] dark:border-zinc-800 md:flex-row md:items-center md:justify-between",
  footerIdClass:
    "flex items-center gap-1.5 underline underline-offset-4 decoration-primary/30",
  footerSystemClass: "font-mono text-[10px] uppercase tracking-widest text-[#8C7B6B]/80 font-black",
  dateLocale: "pt-PT",
  dateStyle: "short",
  timeStyle: "short",
} as const

export const propertyManagementRootUi = {
  headerClass:
    "sticky top-0 z-[60] mb-8 flex flex-col gap-4 p-4 md:p-2 border-2 border-[#000000] dark:border-white/20 rounded-2xl bg-[#FAFAF5]/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-[4px_4px_0_0_#0D0D0D] dark:shadow-none md:flex-row md:items-center md:justify-between transition-all duration-300",
  backButtonClass:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#000000] bg-white transition-all hover:bg-primary hover:text-white shadow-[2px_2px_0_0_#0D0D0D] dark:bg-zinc-900 dark:border-white/20",
  eyebrowClass:
    "mb-0.5 block font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#8C7B6B] opacity-70",
  titleClass:
    "truncate font-serif text-lg font-bold italic uppercase tracking-tighter text-[#0D0D0D] dark:text-white md:text-xl",
  modeSwitcherClass:
    "flex rounded-xl border-2 border-[#0D0D0D] bg-white dark:bg-zinc-900 dark:border-white/10 p-1 shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-none",
  modeInactiveClass: "text-[#8C7B6B] hover:bg-[#F0ECD9]/50 dark:hover:bg-zinc-800",
  saveButtonClass:
    "!h-10 !px-5 !bg-emerald-600 !border-emerald-700 !text-white !text-[10px] !font-bold !uppercase !tracking-widest shadow-[3px_3px_0_0_#064e3b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
} as const

export const propertyFilterBarUi = {
  headerIconClass:
    "flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-primary shadow-[2px_2px_0_0_#0D0D0D]",
  headerTitleClass:
    "font-serif text-xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] dark:text-white",
  statusActiveClass:
    "bg-primary text-primary-foreground shadow-[3px_3px_0_0_#0D0D0D] -translate-x-0.5 -translate-y-0.5",
  priceInputClass:
    "w-full rounded-md border-2 border-[#0D0D0D] bg-white px-3 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] transition-all placeholder:text-[#8C7B6B]/60 focus:bg-white focus:shadow-[2px_2px_0_0_#0D0D0D] focus:outline-none dark:border-zinc-600 dark:bg-zinc-950 dark:text-white",
  sortTriggerClass:
    "flex items-center justify-center gap-2 rounded-md border-2 border-foreground dark:border-zinc-700 bg-primary/10 font-mono font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-primary",
  sortContentClass:
    "w-40 border-2 border-foreground shadow-[4px_4px_0_0_#0D0D0D] p-1 bg-white/80 dark:bg-black/80 backdrop-blur-md",
  searchInputClass:
    "w-full rounded-xl border-2 border-[#0D0D0D] bg-white pr-4 font-mono font-bold uppercase tracking-widest text-[#0D0D0D] transition-all placeholder:font-black placeholder:text-[#8C7B6B]/55 focus:bg-white focus:shadow-[4px_4px_0_0_#0D0D0D] focus:outline-none dark:border-zinc-600 dark:bg-zinc-950 dark:text-white",
  rootBorderClass: "sticky top-0 z-20 rounded-[1.15rem] border-2 border-[#0D0D0D] dark:border-zinc-700",
} as const

export const propertyCollaboratorUi = {
  roleTriggerClass:
    "flex w-full min-w-[140px] items-center justify-between gap-2 rounded-xl border-2 border-[#000000] bg-white px-4 py-3 font-mono text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] transition-all hover:bg-[#FAFAF5] dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 shadow-[2px_2px_0_0_#000000] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.1)] md:w-auto",
  roleContentClass: "w-48 border-2 border-[#000000] bg-white p-1 shadow-[4px_4px_0_0_#000000] dark:border-zinc-100 dark:bg-zinc-950",
  emailBoxClass:
    "min-w-0 flex-1 rounded-xl border-2 border-[#000000] bg-white px-4 py-3 dark:border-zinc-100 dark:bg-zinc-950 shadow-[2px_2px_0_0_#000000] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.1)]",
  emailInputClass:
    "w-full bg-transparent text-sm font-medium text-[#0D0D0D] outline-none placeholder:text-[#8C7B6B]/40 dark:text-white",
  itemClass:
    "flex items-center justify-between gap-4 rounded-xl border border-[#000000]/10 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/50 hover:shadow-md transition-shadow",
  itemEmailClass: "truncate text-sm font-medium text-[#0D0D0D] dark:text-zinc-100",
  permBadgeClass:
    "rounded-lg bg-[#FAFAF5] border border-[#0D0D0D]/10 px-3 py-1 font-mono text-[9px] font-black uppercase text-[#8C7B6B] dark:bg-zinc-800 dark:text-zinc-400",
  removeButtonClass: "p-1.5 text-[#8C7B6B] hover:text-rose-600 transition-colors",
  emptyStateClass:
    "p-10 text-center border-2 border-dashed border-[#0D0D0D]/10 rounded-2xl bg-[#FAFAF5]/30 dark:bg-zinc-900/20",
  emptyTextClass: "text-sm text-[#8C7B6B] italic font-serif",
  cardIconBgColor: "bg-blue-500/10 border-blue-500/20",
  cardIconTextColor: "text-blue-500",
} as const

export const propertyDetailsUi = {
  statusInactiveClass:
    "border-[#0D0D0D]/12 bg-white hover:border-[#0D0D0D]/25 dark:border-zinc-700 dark:bg-zinc-900/80",
  statusLabelClass: "text-xs font-medium text-[#0D0D0D] dark:text-zinc-200",
  mediaHintClass: "text-xs leading-relaxed text-[#8C7B6B] dark:text-zinc-500 font-medium font-serif italic",
  featuredRowClass:
    "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-[#0D0D0D]/5 bg-[#FAFAF5]/50 px-4 py-3 transition-colors hover:border-primary/20 dark:border-white/5 dark:bg-zinc-900/40",
  featuredIconInactiveClass: "text-[#8C7B6B]",
  featuredLabelClass: "text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] dark:text-zinc-300",
  operationalBoxClass:
    "rounded-3xl border-2 border-[#0D0D0D] bg-white p-6 shadow-[8px_8px_0_0_#0D0D0D] dark:border-zinc-100 dark:bg-zinc-950 dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)]",
  operationalTitleClass: "font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#0D0D0D] dark:text-zinc-100",
  decommissionBoxClass:
    "overflow-hidden rounded-3xl border-2 border-[#0D0D0D] bg-white shadow-[8px_8px_0_0_#0D0D0D] dark:border-zinc-100 dark:bg-zinc-950 dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)]",
  decommissionHeaderClass: "flex items-center gap-4 border-b-2 border-[#0D0D0D]/10 bg-[#0D0D0D] px-5 py-3 dark:bg-zinc-900/40",
  decommissionZoneTitleClass: "font-mono text-[9px] font-black uppercase tracking-[0.3em] text-white",
  decommissionZoneSubtitleClass: "truncate font-serif text-[11px] font-bold italic text-zinc-50/80",
  decommissionWarningClass: "text-[10px] font-bold leading-relaxed text-zinc-900/60 dark:text-zinc-400/60 font-mono",
  decommissionButtonClass:
    "mt-5 w-full rounded-xl border-2 border-[#0D0D0D] bg-white py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 transition-all hover:bg-rose-600 hover:text-white active:scale-95 shadow-[4px_4px_0_0_#FF5E1A] hover:shadow-none active:translate-x-1 active:translate-y-1",
  amenitiesBoxClass:
    "rounded-3xl border-2 border-[#0D0D0D] bg-white transition-all duration-500 dark:border-white/10 dark:bg-zinc-950",
  amenitiesShadowOpenClass: "shadow-[12px_12px_0_0_#FF5E1A]",
  amenitiesShadowClosedClass: "shadow-[8px_8px_0_0_#0D0D0D]",
  amenitiesKickerClass: "font-mono text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-2",
  amenitiesTitleClass: "font-serif text-3xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] dark:text-white",
  amenitiesChevronWrapClass:
    "flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0D0D0D]/10 bg-[#FAFAF5] transition-transform duration-300 dark:bg-zinc-900",
  amenitiesChevronShadowClass: "shadow-[2px_2px_0_0_#0D0D0D]",
  amenitiesChevronIconClass: "text-[#0D0D0D] dark:text-white",
  amenitiesDividerClass: "h-px w-full bg-[#0D0D0D]/10 mb-8 dark:bg-white/10",
  identityIconBgColor: "bg-primary/10 border-primary/20",
  identityIconTextColor: "text-primary",
  mediaIconBgColor: "bg-amber-500/10 border-amber-500/20",
  mediaIconTextColor: "text-amber-600",
  logisticsIconBgColor: "bg-indigo-500/10 border-indigo-500/20",
  logisticsIconTextColor: "text-indigo-500",
} as const

export const propertyRulesUi = {
  tooltipBoxClass:
    "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-foreground text-background dark:bg-white dark:text-black font-mono text-[9px] uppercase tracking-wider leading-relaxed rounded-lg z-50 text-center shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none border border-white/10 backdrop-blur-md",
  tooltipArrowClass: "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground dark:border-t-white",
  headerWrapClass: "relative overflow-hidden p-8 rounded-[2rem] border-[3px] transition-all duration-500 mb-12",
  headerBorderClass: "border-[#0D0D0D] dark:border-[#FAFAF5]/40",
  headerBgClass: "bg-[#FAFAF5]/95 dark:bg-[#FAFAF5]/10 backdrop-blur-xl",
  headerShadowClass: "shadow-[12px_12px_0_0_#0D0D0D] dark:shadow-[12px_12px_0_0_rgba(250,250,245,0.1)]",
  headerIconWrapClass:
    "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#0D0D0D] dark:border-[#FAFAF5] bg-primary text-white shadow-[4px_4px_0_0_#0D0D0D] dark:shadow-[4px_4px_0_0_rgba(250,250,245,0.2)]",
  headerTitleClass: "font-serif text-3xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] dark:text-[#FAFAF5]",
  headerSubtitleClass: "mt-3 max-w-3xl text-[13px] font-medium leading-relaxed text-[#8C7B6B] dark:text-[#FAFAF5]/60",
  headerIndexClass:
    "absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 font-serif text-[120px] leading-none pointer-events-none select-none font-bold italic -translate-y-8 translate-x-8 text-[#0D0D0D] dark:text-[#FAFAF5]",
  timezoneLabelClass: "font-mono text-[9px] font-black uppercase tracking-widest text-[#8C7B6B] block mb-3",
  timezoneWrapClass: "flex items-center gap-2 rounded-lg border-2 border-foreground bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950 shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-none",
  yieldEmptyIconClass: "mx-auto mb-3 h-10 w-10 text-[#8C7B6B]",
  yieldEmptySubtitleClass: "mt-2 text-sm text-[#8C7B6B] italic font-serif opacity-60",
} as const

export const propertyCardsUi = {
  mediaThumbBaseClass: "relative shrink-0 overflow-hidden group/img transition-transform duration-500",
  mediaThumbBgClass: "bg-[#E8E4D4] dark:bg-zinc-900",
  mediaThumbBorderColorClass: "border-[#0D0D0D] dark:border-zinc-600",
  mediaThumbPlaceholderBgClass: "flex h-full w-full items-center justify-center bg-[#F0ECD9]/50 dark:bg-zinc-800/50",
  mediaThumbIconColorClass: "text-[#8C7B6B]/50 dark:text-zinc-500",
  mediaThumbFeaturedBadgeClass:
    "flex items-center gap-1.5 rounded-lg border-2 border-[#0D0D0D] bg-primary px-2 py-0.5 font-black uppercase tracking-widest text-white",
  gridRefClass: "font-mono text-[7px] font-black uppercase tracking-[0.2em] text-[#0D0D0D]/20 dark:text-white/20",
  gridTitleClass:
    "font-black uppercase leading-[0.9] tracking-[-0.03em] text-[#0D0D0D] dark:text-white transition-colors duration-300 group-hover:text-primary text-center",
  gridDividerClass: "mt-4 flex items-center border-t-2 border-[#0D0D0D] dark:border-white/10 pt-3 gap-2",
  gridYieldDividerClass: "flex flex-col items-center flex-1 border-r border-[#0D0D0D]/10 dark:border-white/10",
  gridValueClass: "text-lg font-black tabular-nums tracking-tighter text-[#0D0D0D] dark:text-white",
  gridPaxClass: "flex items-center gap-1 font-mono text-base font-black text-[#0D0D0D] dark:text-white",
  gridEditButtonClass:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#0D0D0D] bg-primary text-white shadow-[3px_3px_0_0_#0D0D0D] transition-all hover:bg-[#FF5E1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
  portfolioTextureBgImage: "radial-gradient(circle, #0D0D0D 1px, transparent 1px)",
  portfolioTitleClass: "font-black uppercase leading-[0.85] tracking-tighter text-[#0D0D0D] dark:text-white",
  portfolioVersionTagClass:
    "rounded-full bg-[#0D0D0D]/5 px-4 py-2 font-mono text-[9px] font-black uppercase tracking-widest text-[#0D0D0D]/40 dark:bg-white/5 dark:text-white/20",
  portfolioDescriptionClass:
    "max-w-xl border-l-4 border-primary pl-6 font-mono text-sm font-bold leading-relaxed text-[#0D0D0D]/60 dark:text-zinc-400 italic line-clamp-3",
  portfolioDividerClass: "flex flex-wrap items-end justify-between gap-6 overflow-hidden border-t-4 border-[#0D0D0D] pt-8 dark:border-white/10",
  portfolioYieldValueClass:
    "text-5xl font-black tabular-nums tracking-tighter text-[#0D0D0D] md:text-6xl dark:text-white",
  portfolioAudienceWrapClass: "hidden border-l-2 border-[#0D0D0D]/10 pl-10 dark:border-white/10 sm:block",
  portfolioPaxClass: "flex items-center gap-3 font-mono text-2xl font-black text-[#0D0D0D] dark:text-white",
  portfolioEditButtonClass:
    "group relative flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[#0D0D0D] bg-primary text-white shadow-[5px_5px_0_0_#0D0D0D] transition-all hover:bg-[#FF5E1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
  cardShellBgClass: "group cursor-pointer overflow-hidden bg-[#FAFAF5] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-[#0a0a0a]",
  cardShellHoverRailClass:
    "hover:shadow-[5px_5px_0_0_#0D0D0D] dark:hover:shadow-[5px_5px_0_0_rgba(255,255,255,0.75)]",
  cardShellHoverGridClass: "hover:shadow-[7px_7px_0_0_#0D0D0D] dark:hover:shadow-[7px_7px_0_0_rgba(24,24,27,1)]",
  cardShellHoverPortfolioClass:
    "hover:shadow-[10px_10px_0_0_#0D0D0D] dark:hover:shadow-[10px_10px_0_0_rgba(24,24,27,1)]",
  railTitleClass: "truncate text-sm font-black uppercase leading-tight tracking-tight text-[#0D0D0D] dark:text-white",
} as const

export const propertyListUi = {
  headerWrapClass: "relative flex flex-col items-start justify-between gap-8 overflow-hidden border-b-2 border-[#0D0D0D] pb-10 pr-2 dark:border-zinc-700 md:flex-row md:items-end",
  headerTitleClass: "max-w-3xl font-serif text-5xl font-bold italic uppercase leading-[0.85] tracking-tighter text-[#0D0D0D] md:text-7xl dark:text-white",
  emptyWrapClass:
    "flex flex-col items-center rounded-[2.5rem] border-2 border-dashed border-[#0D0D0D]/10 bg-[#F0ECD9]/10 py-24 text-center dark:border-zinc-800 dark:bg-zinc-900/20",
  emptyIconClass: "h-14 w-14 text-[#8C7B6B]/40 dark:text-zinc-600",
  emptyTitleClass: "mb-2 text-2xl font-black uppercase tracking-tighter text-[#0D0D0D] dark:text-white",
  skeletonBgClass: "h-48 animate-pulse rounded-[1.25rem] bg-[#E8E4D4]/60 dark:bg-zinc-800/50",
} as const

export const propertyStatsUi = {
  cardWrapClass:
    "relative group p-6 border-[3px] border-foreground dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-[8px_8px_0_0_#0D0D0D] dark:shadow-[8px_8px_0_0_rgba(24,24,27,1)] bg-[#FAFAF5] dark:bg-zinc-950 transition-all duration-300",
  iconWrapClass:
    "p-3 rounded-2xl border-[3px] border-foreground dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[4px_4px_0_0_#0D0D0D] transition-transform group-hover:-rotate-3",
  dotWrapClass: "flex items-center gap-2 px-3 py-1.5 bg-foreground/5 dark:bg-white/5 rounded-xl border-2 border-foreground/10 dark:border-white/10",
  valueDividerClass: "flex items-end justify-between border-b-[3px] border-foreground/5 dark:border-white/5 pb-6",
  valueStroke: "1px rgba(0,0,0,0.05)",
} as const

export const propertyGalleryUi = {
  placeholderImages: [
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
  ],
  viewerWrapClass:
    "relative overflow-hidden rounded-[2.5rem] border-[3px] border-foreground dark:border-zinc-800 aspect-[16/9] md:aspect-[21/9] bg-muted/10 group shadow-[12px_12px_0_0_#0D0D0D] dark:shadow-none",
  featuredBadgeClass:
    "flex items-center gap-3 rounded-2xl bg-primary px-4 py-2 text-white font-mono font-black border-[3px] border-foreground shadow-[4px_4px_0_0_#000] text-[11px] uppercase tracking-widest -rotate-2",
  navButtonClass:
    "pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-foreground bg-white shadow-[4px_4px_0_0_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all opacity-0 group-hover:opacity-100 dark:bg-zinc-900",
  fullscreenButtonClass:
    "absolute bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-foreground bg-white shadow-[4px_4px_0_0_#0D0D0D] hover:shadow-none transition-all opacity-0 group-hover:opacity-100 dark:bg-zinc-900 text-primary",
  paginationClass:
    "flex items-center gap-2 rounded-xl border-[3px] border-foreground bg-foreground px-4 py-2 text-white font-mono font-black text-[11px] tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]",
  thumbsSelectedClass: "border-primary shadow-[4px_4px_0_0_#0D0D0D] -translate-y-1.5",
  uploadWrapClass:
    "relative group rounded-[2.5rem] border-[3px] border-dashed border-foreground/30 dark:border-white/10 bg-[#FAFAF5]/50 dark:bg-zinc-900/40 p-12 transition-all hover:border-primary/50 hover:bg-white dark:hover:bg-zinc-900",
  uploadIconWrapClass:
    "relative h-20 w-20 flex items-center justify-center rounded-3xl border-[3px] border-foreground bg-white shadow-[6px_6px_0_0_#0D0D0D] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all dark:bg-zinc-800",
} as const

export const propertyWizardUi = {
  progressWrapClass: "mb-10 flex flex-col gap-6 border-b border-[#0D0D0D]/15 pb-8 dark:border-zinc-800 md:flex-row md:items-start md:justify-between",
  progressIconWrapClass: "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#0D0D0D]/25 bg-primary text-white dark:border-zinc-600",
  progressProtocolClass: "mb-2 font-mono text-[9px] font-black uppercase tracking-[0.4em] text-[#8C7B6B]",
  progressTitleClass: "font-serif text-3xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] md:text-5xl dark:text-white",
  progressPendingStepClass: "border-[#0D0D0D]/15 text-[#8C7B6B] dark:border-zinc-700",
  progressConnectorClass: "hidden h-px w-4 bg-[#0D0D0D]/15 sm:block dark:bg-zinc-700",
  permissionsHintClass: "text-sm font-serif italic text-[#8C7B6B] dark:text-zinc-500",
  previewTitleClass: "font-serif text-xl font-bold italic uppercase tracking-tight text-[#0D0D0D] dark:text-white",
  previewSubtitleClass: "mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#8C7B6B] dark:text-zinc-500",
  previewListClass: "space-y-4 border-t border-[#0D0D0D]/10 pt-4 dark:border-zinc-800",
  previewLabelClass: "text-[10px] font-medium uppercase tracking-wider text-[#8C7B6B]",
  previewValueClass: "text-sm font-medium text-[#0D0D0D] dark:text-zinc-100",
  footerWrapClass: "mt-12 flex flex-col gap-4 border-t border-[#0D0D0D]/15 pt-8 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between",
} as const

export const propertyAmenitiesUi = {
  headerWrapClass: "mb-10 flex items-center justify-between border-b-2 border-[#0D0D0D]/10 pb-6 dark:border-white/10",
  headerTitleClass: "font-serif text-3xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] dark:text-white",
  revertButtonClass:
    "flex items-center gap-2 rounded-xl bg-[#0D0D0D] px-4 py-2 font-mono text-[10px] font-black uppercase text-white transition-all hover:bg-primary dark:bg-white dark:text-[#0D0D0D] dark:hover:bg-primary",
  itemSelectedClass:
    "border-[#0D0D0D] bg-primary text-white shadow-[3px_3px_0_0_#0D0D0D] dark:border-white dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.7)]",
  itemUnselectedClass:
    "border-[#0D0D0D]/10 bg-white/50 hover:border-primary/50 hover:bg-white dark:border-white/10 dark:bg-zinc-900/50",
  itemTextUnselectedClass: "text-[#0D0D0D] dark:text-zinc-300",
  itemCheckUnselectedClass: "border-[#0D0D0D]/20 dark:border-white/20",
  categoryIconWrapClass:
    "flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0D0D0D] bg-white text-lg shadow-[3px_3px_0_0_#0D0D0D] dark:border-white dark:bg-zinc-800 dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.1)]",
  categoryTitleClass: "font-serif text-xl font-bold italic uppercase tracking-tight text-[#0D0D0D] dark:text-zinc-100",
  categoryDividerClass: "h-px flex-1 bg-[#0D0D0D]/10 dark:bg-white/10",
  loadingWrapClass:
    "flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#0D0D0D]/10 bg-[#FAFAF5] p-20 dark:border-white/10 dark:bg-zinc-900/40",
  loadingTextClass: "animate-pulse font-mono text-[10px] font-black uppercase tracking-widest text-[#8C7B6B]",
  syncFooterClass:
    "flex items-center justify-center gap-4 rounded-xl border-2 border-dashed border-primary px-6 py-4 dark:bg-primary/5 bg-primary/5",
} as const

export const propertyViewUi = {
  pageBgClass: "relative min-h-screen overflow-hidden bg-[#F0ECD9]/35 dark:bg-zinc-950",
} as const

export const propertyTokens = {
  ui: {
    nexusEyebrowClass,
    nexusEyebrowAccentClass,
    nexusMutedBodyClass,
    nexusHardBorder,
    nexusHardBorderHeavy,
    nexusShadowSm,
    nexusShadowMd,
    nexusShadowLg,
    nexusGlowPrimary,
    nexusGlowEmerald,
    nexusGlass,
    nexusCardPressHover,
    nexusKineticLight,
    nexusKineticHeavy,
    proPanel,
    proSectionTitle,
    proMeta,
    preview: propertyPreviewUi,
    managementRoot: propertyManagementRootUi,
    filterBar: propertyFilterBarUi,
    collaborator: propertyCollaboratorUi,
    details: propertyDetailsUi,
    rules: propertyRulesUi,
    cards: propertyCardsUi,
    list: propertyListUi,
    stats: propertyStatsUi,
    gallery: propertyGalleryUi,
    wizard: propertyWizardUi,
    amenitiesField: propertyAmenitiesUi,
    view: propertyViewUi,
  },
  copy: propertyCopy,
} as const
