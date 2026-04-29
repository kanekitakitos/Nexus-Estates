export const STATUS_CONFIG = {
  AVAILABLE: {
    bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/5",
    label: "PROPIEDADE DISPONÍVEL",
    dot: "bg-emerald-500",
    shadow: "shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  },
  BOOKED: {
    bg: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 dark:bg-rose-500/5",
    label: "RESERVA CONFIRMADA",
    dot: "bg-rose-500",
    shadow: "shadow-[0_0_8px_rgba(244,63,94,0.5)]",
  },
  MAINTENANCE: {
    bg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 dark:bg-amber-500/5",
    label: "PROPIEDADE EM MANUTENÇÃO",
    dot: "bg-amber-500",
    shadow: "shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  },
} as const

export type PropertyStatus = keyof typeof STATUS_CONFIG

export type PropertyCardDisplayVariant = "portfolio" | "grid" | "inventoryRail"

export type PropertyCardVariant =
  | PropertyCardDisplayVariant
  | "default"
  | "compact"
  | "mini"

export const LEGACY_VARIANT_MAP: Record<string, PropertyCardDisplayVariant> = {
  default: "portfolio",
  compact: "grid",
  mini: "inventoryRail",
}

export type AmenityCategory = "General" | "Kitchen" | "Bathroom" | "Entertainment" | "Outdoor" | "Safety"

export const CATEGORY_CONFIG: Record<AmenityCategory, { color: string; icon: string; bg: string }> = {
  General:       { color: "text-primary",      bg: "bg-primary/5",      icon: "🏠" },
  Kitchen:       { color: "text-emerald-500",  bg: "bg-emerald-500/5",  icon: "🍳" },
  Bathroom:      { color: "text-blue-500",     bg: "bg-blue-500/5",     icon: "🚿" },
  Entertainment: { color: "text-indigo-500",   bg: "bg-indigo-500/5",   icon: "🎮" },
  Outdoor:       { color: "text-orange-500",   bg: "bg-orange-500/5",   icon: "🌳" },
  Safety:        { color: "text-rose-500",     bg: "bg-rose-500/5",     icon: "🔒" },
}
