import { Variants } from "framer-motion"

/**
 * Page and Section Transitions
 * Smooth blur + slide up effect used for main views.
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
 * Staggering effect for children items.
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const itemFadeUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
}

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
 * Neo-Brutal hover and tap effects.
 */
export const brutalCardHover = (isCompact = false) => ({
  x: isCompact ? 2 : 4,
  y: isCompact ? -2 : -4,
  transition: { type: "spring" as const, stiffness: 400, damping: 12 },
})

export const microPop = {
  scale: 0.98,
  transition: { duration: 0.1 }
}

export const pulseScale = {
  scale: [1, 1.02, 1],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
}

/**
 * Modal and Overlay Variants
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
 */
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
