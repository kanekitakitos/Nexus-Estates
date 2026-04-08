import { Variants } from "framer-motion"

/**
 * Page and Section Transitions
 * Transições suaves com desfoque (blur) e deslocamento vertical para as vistas principais.
 */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16, filter: "blur(2px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(1px)",
    transition: { duration: 0.2, ease: "circIn" as const },
  },
}

/**
 * List Animations
 * Efeito de cascata (stagger) para a entrada sequencial de itens em listas.
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

/** Animação de entrada vinda de baixo */
export const itemFadeUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
}

/** Animação de entrada vinda da esquerda */
export const itemFadeRight: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  },
}

/**
 * Interaction Variants
 * Efeitos Neo-Brutalistas para hover e tap, com sombras deslocadas.
 */
export const brutalCardHover = (isCompact = false) => ({
  x: isCompact ? 2 : 4,
  y: isCompact ? -2 : -4,
  transition: { type: "spring" as const, stiffness: 400, damping: 12 },
})

/** Pequeno feedback tátil ao clicar */
export const microPop = {
  scale: 0.98,
  transition: { duration: 0.1 }
}

/** Pulsação constante para elementos de destaque */
export const pulseScale = {
  scale: [1, 1.02, 1],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
}

/**
 * Modal and Overlay Variants
 * Controlos de visibilidade para fundos e conteúdos modais.
 */
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 }
}

/**
 * Looping / Background Animations
 * Animações infinitas para elementos decorativos do ambiente Nexus.
 */

/** Flutuação orbital */
export const floating: Variants = {
  animate: {
    y: [0, -40, 0],
    rotate: [0, 45, 0],
    scale: [1, 1.2, 1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

/** Rotação suave pendular */
export const gentleRotate: Variants = {
  animate: {
    rotate: [0, -5, 5, -5, 0],
    y: [0, -10, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

/** Ressalto suave vertical */
export const gentleBounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}
