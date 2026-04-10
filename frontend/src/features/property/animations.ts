import { Variants } from "framer-motion"

/**
 * Nexus_Springs — Configurações de física snappier para Neo-Brutalismo.
 */
export const SNAP_SPRING = { type: "spring", stiffness: 400, damping: 25 } as const
export const HEAVY_SPRING = { type: "spring", stiffness: 260, damping: 20 } as const
export const FLUID_EASE = [0.23, 1, 0.32, 1] as const // Cubic-bezier editorial

/**
 * Page and Section Transitions
 * Transições suaves com desfoque (blur) e deslocamento vertical para as vistas principais.
 */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)", scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.45, ease: FLUID_EASE },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(2px)",
    scale: 0.98,
    transition: { duration: 0.25, ease: "circIn" as const },
  },
}

/**
 * Nexus_Entrance — Variante de entrada para containers e cartões.
 */
export const nexusEntrance: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.4, ease: FLUID_EASE }
  }
}

/**
 * List Animations
 * Efeito de cascata (stagger) para a entrada sequencial de itens em listas.
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    },
  },
}

/** Animação de entrada vinda de baixo */
export const itemFadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { ...HEAVY_SPRING }
  },
}

/** Animação de entrada vinda da esquerda */
export const itemFadeRight: Variants = {
  initial: { opacity: 0, x: -15, filter: "blur(2px)" },
  animate: { 
    opacity: 1, 
    x: 0,
    filter: "blur(0px)",
    transition: { ...SNAP_SPRING }
  },
}

/**
 * Interaction Variants
 * Efeitos Neo-Brutalistas para hover e tap, com sombras deslocadas.
 */
export const brutalCardHover = (isCompact = false) => ({
  x: isCompact ? 2 : 5,
  y: isCompact ? -2 : -5,
  transition: SNAP_SPRING,
})

/** Pequeno feedback tátil ao clicar */
export const microPop = {
  scale: 0.97,
  transition: { duration: 0.1, ease: "easeOut" }
}

/** Pulsação constante para elementos de destaque */
export const pulseScale = {
  scale: [1, 1.03, 1],
  transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
}

/** Glitch-like flash para feedback de estado */
export const statusFlash = {
  opacity: [1, 0.4, 1],
  transition: { duration: 0.4, times: [0, 0.5, 1] }
}

/**
 * Modal and Overlay Variants
 * Controlos de visibilidade para fundos e conteúdos modais.
 */
export const modalOverlay: Variants = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: { opacity: 1, backdropFilter: "blur(8px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" }
}

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { ...HEAVY_SPRING } },
  exit: { opacity: 0, scale: 0.92, y: 30, transition: { duration: 0.2 } }
}

/**
 * Estatísticas e Dashboards (Nexus_Protocol)
 */

/** Animação rítmica segmentada para barras de progresso/saúde */
export const healthBarPulse: Variants = {
  initial: { scaleY: 0.5, opacity: 0.2 },
  animate: (custom: number) => ({
    scaleY: [0.5, 1, 0.5],
    opacity: [0.2, 1, 0.2],
    transition: {
      repeat: Infinity,
      duration: 3,
      delay: custom * 0.2,
      ease: "easeInOut"
    }
  })
}

/** Variante para os cards das estatísticas */
export const statCardVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.1, ...HEAVY_SPRING }
  }),
  hover: {
    y: -8,
    x: -4,
    transition: SNAP_SPRING
  }
}
