"use client"

export const viewTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
}

export const comicSpring = {
  type: "spring" as const,
  stiffness: 520,
  damping: 28,
  mass: 0.7,
}

export const gummySpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 18,
  mass: 0.9,
}

export const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: viewTransition },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const } },
}

export const panelVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: viewTransition },
  exit: { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } },
}

export const comicPopVariants = {
  initial: { opacity: 0, scale: 0.98, rotate: -0.2 },
  animate: { opacity: 1, scale: 1, rotate: 0, transition: gummySpring },
  exit: { opacity: 0, scale: 0.98, rotate: 0.35, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const } },
}

export const gummyHover = {
  y: -6,
  x: 2,
  rotate: -0.35,
  scale: 1.01,
  transition: comicSpring,
}

export const gummyTap = {
  scaleX: 0.985,
  scaleY: 0.97,
  rotate: 0.15,
  transition: { type: "spring" as const, stiffness: 700, damping: 26, mass: 0.55 },
}

export const listContainerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.035, delayChildren: 0.03 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
}

export const listItemVariants = {
  initial: { opacity: 0, y: 10, rotate: -0.6 },
  animate: { opacity: 1, y: 0, rotate: 0, transition: viewTransition },
  exit: { opacity: 0, y: -10, rotate: 0.8, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } },
}

