/**
 * Tokens visuais e conteúdo estático da landing.
 *
 * - B: paleta base (neo-brutal).
 * - SECTIONS: define ordem/cores/títulos para o scroller horizontal.
 * - TICKER_ITEMS / MORPHING: textos para componentes animadas.
 * - PLANS / BENTO_FEATURES / STEPS: conteúdo das secções.
 */
export const B = {
  cream: "#F0ECD9",
  black: "#0D0D0D",
  graphite: "#1a1a1a",
  orange: "#e2621cff",
  muted: "#8C7B6B",
  border: "rgba(13,13,13,0.12)",
}

export const SECTIONS = [
  { id: "hero",     label: "00", title: ["Gestão de","Alojamento","Local"],        italic:[false,true,false],  desc: "", bg: B.cream,  fg: B.black },
  { id: "about",    label: "01", title: ["Quem","Somos"],                           italic:[false,true],        desc: "", bg: B.black,  fg: B.cream },
  { id: "features", label: "02", title: ["O Que","Oferecemos"],                    italic:[false,true],        desc: "O essencial para gerir, sincronizar e automatizar o teu Alojamento Local num só lugar.", bg: B.cream,  fg: B.black },
  { id: "workflow", label: "03", title: ["Como","Funciona"],                       italic:[false,true],        desc: "", bg: B.black,  fg: B.cream },
  { id: "plans",    label: "04", title: ["Escolhe","o Teu Plano"],                 italic:[false,true],        desc: "", bg: B.cream,  fg: B.black },
  { id: "cta",      label: "05", title: ["Pronto","Para","Começar"],               italic:[false,false,true],  desc: "", bg: B.orange, fg: B.cream },
] as const

export const TICKER_ITEMS = [
  "Inventário Inteligente","Canal Sync","Burocracia Zero",
  "Motor de Reservas","Preços Dinâmicos","SEF Ready",
  "Airbnb & Booking","Faturas Instantâneas",
]

export const MORPHING = ["Automatize.","Sincronize.","Liberte-se.","Simplifique.","Centralize.","Lucre mais."] as const

export const PLANS = [
  { name:"Starter", price:"€29", period:"/mês", desc:"Perfeito para começar",
    features:["1 propriedade","Motor de reservas","Sync básico","Suporte por email"], featured:false },
  { name:"Pro", price:"€79", period:"/mês", desc:"O mais popular",
    features:["Até 10 propriedades","Tudo do Starter","Preços dinâmicos","SEF automático","Suporte prioritário"], featured:true },
  { name:"Enterprise", price:"Custom", period:"", desc:"Para grandes portfólios",
    features:["Propriedades ilimitadas","Tudo do Pro","API dedicada","Onboarding custom","Account manager"], featured:false },
] as const

export const BENTO_FEATURES = [
  {
    n:"01", title:"Inventário & Preços", desc:"Regras, épocas, restrições e preços dinâmicos — sempre sincronizados.",
    span:"md:col-span-1",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  },
  {
    n:"02", title:"Motor de Reservas", desc:"Zero double bookings. Calendário em tempo real com confirmação automática.",
    span:"md:col-span-2",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  },
  {
    n:"03", title:"Sincronização OTA", desc:"Airbnb, Booking e todas as OTAs num só painel centralizado.",
    span:"md:col-span-2",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  },
  {
    n:"04", title:"Burocracia SEF", desc:"Registos SEF e faturação automática. Conformidade sem esforço.",
    span:"md:col-span-1",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  },
] as const

export const STEPS = [
  { n:"01", title:"Login & Setup",    desc:"Cria conta, adiciona propriedades e conecta as tuas OTAs em minutos." },
  { n:"02", title:"Sincroniza Tudo",  desc:"Calendários, preços e disponibilidade propagam para todos os canais automaticamente." },
  { n:"03", title:"Recebe Reservas",  desc:"O motor confirma, bloqueia e notifica. Zero intervenção manual necessária." },
  { n:"04", title:"Faturação Auto",   desc:"Faturas e registos SEF gerados e enviados assim que a reserva é confirmada." },
] as const

export const LANDING_COPY = {
  padChar: "0",
  plans: {
    popularBadge: "Mais Popular",
    sectionSuffix: "Planos",
    sectionJoiner: " — ",
    choosePrefix: "Escolher ",
    chooseSuffix: " →",
  },
  about: {
    sectionSuffix: "Sobre",
    cardTitleSuffix: " →",
  },
  features: {
    sectionSuffix: "Produto",
    labelTitle: "Features",
    hoverHint: "Hover para expandir",
  },
  workflow: {
    sectionSuffix: "Fluxo",
  },
  cta: {
    sectionSuffix: "Start",
    primaryAriaLabel: "Criar conta grátis",
    primaryText: "Criar Conta Grátis →",
    disclaimer: "Sem cartão de crédito · Cancela quando quiseres · Suporte em PT",
    disclaimerJoiner: " · ",
  },
  landingView: {
    keyboardHint: "usa as teclas ← →",
  },
  nav: {
    brand: "Nexus Estates",
    dashboard: "Dashboard",
    login: "Login",
    start: "Começar",
  },
  cassette: {
    screwSymbol: "+",
    num: "90",
    time: "2×30MIN",
  },
} as const

export const CASSETTE = {
  colors: {
    wrapperDropShadow: "drop-shadow(6px 10px 15px rgba(0, 0, 0, 0.4))",
    bottomDropShadow: "drop-shadow(0px -2px 4px rgba(0, 0, 0, 0.3))",
    cardBg: "#252525",
    screwFg: "#111",
    screwBorder: "#111",
    screwBg: "lightgrey",
    stickerBg: "#FFFDD0",
    lineBg: "#111",
    yellowBandBg: "rgb(242, 188, 0)",
    rollBg: "#171717",
    tapeBg: "#252525",
    wheelBorder: "#fff",
    wheelShadow: "#fff",
    numFg: "#111",
    orangeBandBg: "rgb(241, 90, 37)",
    timeFg: "#F0ECD9",
    bottomShapeBg: "#252525",
    chipBg: "rgb(190, 190, 190)",
  },
} as const

export const LANDING_UI = {
  effects: {
    transparentBoxShadow: "0px 0px 0 0 rgba(0,0,0,0)",
    dotGridSmall: "radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)",
    dotGridLarge: "radial-gradient(circle, rgba(0,0,0,0.35) 1px, transparent 1px)",
    iconDropShadow: "drop-shadow(0 0 4px rgba(255,255,255,0.02))",
  },
  colors: {
    brutalGridLight: "rgba(240,236,217,0.16)",
    brutalGridDark: "rgba(13,13,13,0.12)",
  },
  workflow: {
    stepCardInactiveBorder: "2px solid rgba(240,236,217,0.35)",
    stepCardActiveShadow: "6px 6px 0 0 rgba(232,86,10,0.25)",
    stepCardInactiveShadow: "4px 4px 0 0 rgba(240,236,217,0.16)",
    stepCardActiveBg: "rgba(13,13,13,0.95)",
    stepCardInactiveBg: "rgba(13,13,13,0.6)",
  },
  about: {
    infoCardBorder: "2px solid rgba(240,236,217,0.55)",
    infoCardShadow: "6px 6px 0 0 rgba(240,236,217,0.18)",
    infoCardBg: "rgba(240,236,217,0.03)",
  },
  features: {
    glassShadowClass: "shadow-[0_25px_25px_rgba(0,0,0,0.25)]",
    glassBackTextColor: "rgba(240,236,217,0.86)",
  },
} as const

export const ABOUT_INFO_CARDS = [
  {
    n: "01",
    title: "Missão",
    body: "Reduzir a fricção operacional no AL. Centralizamos tudo para o anfitrião focar no que importa.",
  },
  {
    n: "02",
    title: "Tecnologia",
    body: "Stack moderna, sync em tempo real, API robusta. Construído para anfitriões exigentes.",
  },
  {
    n: "03",
    title: "Suporte",
    body: "Equipa dedicada que entende o mercado português. Sempre ao teu lado.",
  },
] as const

export const landingTokens = {
  ui: {
    palette: B,
    cassette: CASSETTE,
    landing: LANDING_UI,
  },
  copy: {
    tickerItems: TICKER_ITEMS,
    morphing: MORPHING,
    landing: LANDING_COPY,
  },
  data: {
    sections: SECTIONS,
    plans: PLANS,
    bentoFeatures: BENTO_FEATURES,
    steps: STEPS,
  },
} as const
