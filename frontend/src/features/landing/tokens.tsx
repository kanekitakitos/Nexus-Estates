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
  orange: "#e2621cff",
  muted: "#8C7B6B",
  border: "rgba(13,13,13,0.12)",
}

export const SECTIONS = [
  { id: "hero",     label: "00", title: ["Gestão de","Alojamento","Local"],        italic:[false,true,false],  bg: B.cream,  fg: B.black },
  { id: "about",    label: "01", title: ["Quem","Somos"],                           italic:[false,true],        bg: B.black,  fg: B.cream },
  { id: "features", label: "02", title: ["O Que","Oferecemos"],                    italic:[false,true],        bg: B.cream,  fg: B.black },
  { id: "workflow", label: "03", title: ["Como","Funciona"],                       italic:[false,true],        bg: B.black,  fg: B.cream },
  { id: "plans",    label: "04", title: ["Escolhe","o Teu Plano"],                 italic:[false,true],        bg: B.cream,  fg: B.black },
  { id: "cta",      label: "05", title: ["Pronto","Para","Começar?"],               italic:[false,false,true],  bg: B.orange, fg: B.cream },
]

export const TICKER_ITEMS = [
  "Inventário Inteligente","Canal Sync","Burocracia Zero",
  "Motor de Reservas","Preços Dinâmicos","SEF Ready",
  "Airbnb & Booking","Faturas Instantâneas",
]

export const MORPHING = ["Automatize.","Sincronize.","Liberte-se.","Simplifique.","Centralize.","Lucre mais."]

export const PLANS = [
  { name:"Starter", price:"€29", period:"/mês", desc:"Perfeito para começar",
    features:["1 propriedade","Motor de reservas","Sync básico","Suporte por email"], featured:false },
  { name:"Pro", price:"€79", period:"/mês", desc:"O mais popular",
    features:["Até 10 propriedades","Tudo do Starter","Preços dinâmicos","SEF automático","Suporte prioritário"], featured:true },
  { name:"Enterprise", price:"Custom", period:"", desc:"Para grandes portfólios",
    features:["Propriedades ilimitadas","Tudo do Pro","API dedicada","Onboarding custom","Account manager"], featured:false },
]

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
]

export const STEPS = [
  { n:"01", title:"Login & Setup",    desc:"Cria conta, adiciona propriedades e conecta as tuas OTAs em minutos." },
  { n:"02", title:"Sincroniza Tudo",  desc:"Calendários, preços e disponibilidade propagam para todos os canais automaticamente." },
  { n:"03", title:"Recebe Reservas",  desc:"O motor confirma, bloqueia e notifica. Zero intervenção manual necessária." },
  { n:"04", title:"Faturação Auto",   desc:"Faturas e registos SEF gerados e enviados assim que a reserva é confirmada." },
]
