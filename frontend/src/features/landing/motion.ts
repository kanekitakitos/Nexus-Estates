/**
 * Presets de motion partilhados para a landing.
 *
 * Mantém as animações consistentes ao importar deste ficheiro, evitando valores
 * hardcoded espalhados por vários componentes.
 */
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
} as const

export const duration = {
  fast: 0.2,
  base: 0.3,
  slow: 0.55,
} as const

export const springSnap = {
  type: "spring" as const,
  stiffness: 520,
  damping: 28,
  mass: 0.7,
} as const

export const springBounce = {
  type: "spring" as const,
  stiffness: 420,
  damping: 18,
  mass: 0.9,
} as const

export const sectionTransition = { duration: 0.5, ease: ease.out } as const

export const contentFadeTransition = { duration: duration.base } as const

export const ghostActiveTransition = { duration: duration.slow, ease: ease.out } as const

export const ghostIdleTransition = { duration: duration.fast } as const

export const revealTransition = { duration: 0.7, ease: ease.out } as const

export const sideProgressTransition = { duration: 0.4 } as const

export const morphTransition = { duration: 0.45, ease: ease.out } as const

export const navBarTransition = { duration: 0.55, ease: ease.out } as const

/**
 * Transição por linha para títulos (stagger). O index controla o delay.
 */
export function titleLineTransition(index: number) {
  return { delay: 0.25 + index * 0.14, duration: 0.95, ease: ease.out } as const
}

/**
 * Preset utilitário: entrada com fade-in + translate-up.
 */
export function fadeUpEnter(delay: number = 0, y: number = 16) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: duration.base, ease: ease.out },
  }
}

/**
 * Preset utilitário: entrada com fade-in + slide-in da esquerda.
 */
export function slideInLeftEnter(delay: number = 0, x: number = -16) {
  return {
    initial: { opacity: 0, x },
    animate: { opacity: 1, x: 0 },
    transition: { delay, duration: duration.base, ease: ease.out },
  }
}
