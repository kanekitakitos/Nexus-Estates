/**
 * Property Constants
 *
 * Constantes de domínio imutáveis para a feature de Propriedades.
 * Seguindo o SRP, este ficheiro contém APENAS dados de configuração estáticos,
 * sem qualquer lógica de estado ou UI.
 */

// ─── Status Operacional ──────────────────────────────────────────────────────

/**
 * STATUS_CONFIG
 *
 * Mapeamento canónico de estados operacionais de uma propriedade para
 * os seus respetivos tokens visuais (cores, etiquetas, efeitos).
 */
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

/** Tipo derivado das chaves de status possíveis */
export type PropertyStatus = keyof typeof STATUS_CONFIG

// ─── Variantes de Cartão ────────────────────────────────────────────────────

/** Variantes visuais suportadas pelo cartão no novo sistema */
export type PropertyCardDisplayVariant = "portfolio" | "grid" | "inventoryRail"

/** Aliases para compatibilidade com vistas simplificadas e código legado */
export type PropertyCardVariant =
  | PropertyCardDisplayVariant
  | "default"
  | "compact"
  | "mini"

/** Mapeamento de variantes legadas para o sistema de display canónico */
export const LEGACY_VARIANT_MAP: Record<string, PropertyCardDisplayVariant> = {
  default: "portfolio",
  compact: "grid",
  mini: "inventoryRail",
}
