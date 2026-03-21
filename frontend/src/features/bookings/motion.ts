"use client"

// ─────────────────────────────────────────────
// Motion Presets — Bookings
// ─────────────────────────────────────────────
//
// Objetivo:
// - Centralizar easing/springs/variants para consistência visual (Neo-Brutal/Comic)
// - Evitar animações inline repetidas nos componentes (DRY)
// - Facilitar reutilização noutros módulos sem re-inventar transições
//
// Nota:
// - Estes presets são intencionalmente “opinionated”. Se precisares de um caso
//   especial, cria um helper novo aqui em vez de espalhar números mágicos.
//
// ─────────────────────────────────────────────
// Curvas de easing
// ─────────────────────────────────────────────

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,       // Desaceleração rápida — entradas, reveals
  in: [0.4, 0, 1, 1] as const,            // Aceleração limpa — saídas
  inOut: [0.4, 0, 0.2, 1] as const,       // Simétrica — tooltips, overlays
} as const

// ─────────────────────────────────────────────
// Presets de spring
// ─────────────────────────────────────────────

/** Rápido e preciso — buttons, micro-interactions */
export const springSnap = {
  type: "spring" as const,
  stiffness: 520,
  damping: 28,
  mass: 0.7,
}

/** Suave e físico — cards, panels, elementos maiores */
export const springBounce = {
  type: "spring" as const,
  stiffness: 420,
  damping: 18,
  mass: 0.9,
}

/** Assentamento “gentle” — overlays, popovers */
export const springSettle = {
  type: "spring" as const,
  stiffness: 320,
  damping: 26,
  mass: 0.8,
}

// Aliases legacy (compatibilidade)
export const comicSpring = springSnap
export const gummySpring = springBounce

// ─────────────────────────────────────────────
// Presets de duração
// ─────────────────────────────────────────────

export const duration = {
  fast: 0.18,
  base: 0.28,
  slow: 0.4,
} as const

// ─────────────────────────────────────────────
// Transições de página (nível alto)
// ─────────────────────────────────────────────

/** Entrada/saída de página completa — usado ao nível de route/screen */
export const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: { duration: duration.fast, ease: ease.in },
  },
}

/** Troca de painel — step content, tabs, drawers */
export const panelVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.base, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: { duration: duration.fast, ease: ease.in },
  },
}

// ─────────────────────────────────────────────
// Reveals (stagger containers)
// ─────────────────────────────────────────────

/** Container pai — stagger dos filhos no mount */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
  exit: {
    transition: { staggerChildren: 0.025, staggerDirection: -1 as const },
  },
}

/** Item individual dentro de stagger — sobe e assenta */
export const staggerItem = {
  initial: { opacity: 0, y: 14, rotate: -0.4 },
  animate: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -10,
    rotate: 0.6,
    transition: { duration: duration.fast, ease: ease.in },
  },
}

/** Reveal de secção — fade + subida subtil, sem rotação */
export const sectionReveal = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.out },
  },
}

/** Reveal rápido e leve — elementos secundários, badges, labels */
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: duration.fast, ease: ease.in },
  },
}

// ─────────────────────────────────────────────
// Overlays / popovers
// ─────────────────────────────────────────────

/** Popover / dropdown — escala a partir da origem */
export const popoverVariants = {
  initial: { opacity: 0, scale: 0.96, y: -4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springSettle,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -2,
    transition: { duration: duration.fast, ease: ease.in },
  },
}

/** “Comic pop” — cards, highlights, featured items */
export const comicPopVariants = {
  initial: { opacity: 0, scale: 0.95, rotate: -0.4 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: springBounce,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    rotate: 0.35,
    transition: { duration: duration.fast, ease: ease.in },
  },
}

/** Backdrop — escurecimento de ecrã inteiro */
export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.base, ease: ease.inOut } },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: ease.in } },
}

// ─────────────────────────────────────────────
// Imagens / media
// ─────────────────────────────────────────────

/** Crossfade para galerias de imagens */
export const imageFade = {
  initial: { opacity: 0, scale: 1.015 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: ease.out },
  },
  exit: {
    opacity: 0,
    scale: 0.985,
    transition: { duration: 0.22, ease: ease.in },
  },
}

// ─────────────────────────────────────────────
// Interacções hover / tap
// ─────────────────────────────────────────────

/** Hover “goma” — lift + inclinação subtil */
export const gummyHover = {
  y: -5,
  x: 1.5,
  rotate: -0.3,
  scale: 1.008,
  transition: springSnap,
}

/** Tap “squish” — feedback físico em buttons/cards */
export const gummyTap = {
  scaleX: 0.984,
  scaleY: 0.968,
  rotate: 0.12,
  transition: {
    type: "spring" as const,
    stiffness: 700,
    damping: 26,
    mass: 0.55,
  },
}

/** Hover subtil — elementos pequenos (badges/tags/pills) */
export const pillHover = {
  y: -2,
  scale: 1.03,
  transition: springSnap,
}

/** Tap subtil — elementos pequenos */
export const pillTap = {
  scale: 0.95,
  transition: { type: "spring" as const, stiffness: 600, damping: 22, mass: 0.5 },
}

/**
 * Helper para entradas comuns: fade + subida.
 * Útil quando queres evitar repetir `initial/animate/transition` em múltiplos componentes.
 */
export function fadeUpEnter(delay: number = 0, y: number = 12, d: number = duration.base) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: d, ease: ease.out },
  }
}

/**
 * Helper para entradas comuns: slide-in da esquerda.
 * Usa-se em botões de back, headers e elementos de navegação.
 */
export function slideInLeftEnter(delay: number = 0, x: number = -14, d: number = duration.base) {
  return {
    initial: { opacity: 0, x },
    animate: { opacity: 1, x: 0 },
    transition: { delay, duration: d, ease: ease.out },
  }
}

/**
 * Helper para entradas comuns: slide-in da direita.
 * Útil para badges/assistive UI que aparece ao lado do conteúdo.
 */
export function slideInRightEnter(delay: number = 0, x: number = 14, d: number = duration.base) {
  return {
    initial: { opacity: 0, x },
    animate: { opacity: 1, x: 0 },
    transition: { delay, duration: d, ease: ease.out },
  }
}

/**
 * Shimmer horizontal infinito — usado em skeleton loaders.
 * Aplicar num `motion.div` com gradiente.
 */
export function shimmerX(delay: number = 0, d: number = 1.4) {
  return {
    animate: { x: ["-100%", "100%"] },
    transition: { duration: d, repeat: Infinity, ease: "easeInOut" as const, delay },
  }
}

/** Glow pulsante para destaque “Featured”. */
export const featuredGlow = {
  animate: {
    boxShadow: [
      "0 0 0px 0px hsl(var(--primary) / 0)",
      "0 0 8px 3px hsl(var(--primary) / 0.55)",
      "0 0 4px 1px hsl(var(--primary) / 0.25)",
      "0 0 8px 3px hsl(var(--primary) / 0.55)",
      "0 0 0px 0px hsl(var(--primary) / 0)",
    ],
  },
  transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const },
}

/** Hover padrão de card (lift + rotação) — usado em grids/listings. */
export const cardHover = { y: -5, rotate: -0.25, transition: springSnap }

/** Tap padrão de card (squish) — feedback físico. */
export const cardTap = {
  scaleX: 0.984,
  scaleY: 0.972,
  rotate: 0.1,
  transition: { type: "spring" as const, stiffness: 700, damping: 26, mass: 0.55 },
}

/** Hover padrão para botões ícone (CTA compacto). */
export const iconButtonHover = { scale: 1.06, rotate: -0.5, transition: springBounce }
/** Tap padrão para botões ícone (CTA compacto). */
export const iconButtonTap = { scale: 0.92, rotate: 0.5, transition: springBounce }

/** Sombra brutalista base (evitar strings repetidas). */
export const brutalShadow = "4px 4px 0px 0px rgb(0,0,0)"
/** Sombra brutalista em hover. */
export const brutalShadowHover = "7px 7px 0px 0px rgb(0,0,0)"

/** Dot indicador “filled” — aparece com um pop rápido. */
export const indicatorDot = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: springSnap },
}

/** Linha “scanner” — varre de cima para baixo em loop (efeito comic-tech). */
export const scannerLine = {
  initial: { top: "0%" },
  animate: { top: ["0%", "100%", "0%"] },
  transition: { duration: 5, repeat: Infinity, ease: "linear" as const, times: [0, 0.5, 1] as number[] },
}

// ─────────────────────────────────────────────
// Aliases legacy (compatibilidade)
// ─────────────────────────────────────────────

export const listContainerVariants = staggerContainer
export const listItemVariants = staggerItem

// ─────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────

/** Constrói um transition stagger com delay custom por índice. */
export function staggerDelay(index: number, base = 0.04, step = 0.055) {
  return { transition: { delay: base + index * step, duration: duration.base, ease: ease.out } }
}
