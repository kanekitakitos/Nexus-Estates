/**
 * Property Utils
 *
 * Funções utilitárias puras para a feature de Propriedades.
 * Seguindo o SRP, este ficheiro contém APENAS transformações de dados —
 * sem estado, sem efeitos, sem UI.
 */

import {
  PropertyCardDisplayVariant,
  PropertyCardVariant,
  LEGACY_VARIANT_MAP,
} from "./property-constants"

// ─── Resolução de Variantes ──────────────────────────────────────────────────

/**
 * resolvePropertyCardVariant
 *
 * Converte variantes legadas ou aliases para o identificador canónico do sistema.
 *
 * @param variant - Qualquer variante aceite pelo setter externo
 * @returns Variante de display normalizada
 *
 * @example
 * resolvePropertyCardVariant("compact") // → "grid"
 * resolvePropertyCardVariant("portfolio") // → "portfolio"
 */
export function resolvePropertyCardVariant(
  variant: PropertyCardVariant
): PropertyCardDisplayVariant {
  return LEGACY_VARIANT_MAP[variant] ?? (variant as PropertyCardDisplayVariant)
}

// ─── Formatadores de Dados ───────────────────────────────────────────────────

/**
 * resolvedSerialId
 *
 * Gera um identificador visual amigável (ex: "07", "42") derivado do UUID
 * do ativo, para exibição na miniatura do cartão.
 *
 * @param id - UUID completo do ativo
 * @returns String de 2 dígitos (01–99)
 */
export function resolvedSerialId(id: string): string {
  if (!id || typeof id !== "string") return "00"
  const lastPart = id.slice(-2)
  const parsed = parseInt(lastPart, 16)
  return (Number.isNaN(parsed) ? 0 : (parsed % 99) + 1)
    .toString()
    .padStart(2, "0")
}

/**
 * resolvePropertyDescription
 *
 * Extrai a descrição textual de um campo que pode ser string ou objeto i18n.
 *
 * @param raw - Valor bruto da propriedade description
 * @param fallback - Texto a retornar caso o campo esteja vazio
 * @returns String de descrição resolvida
 */
export function resolvePropertyDescription(
  raw: unknown,
  fallback = "Protótipo habitacional Nexus — eficiência operacional e compliance integrado."
): string {
  if (typeof raw === "string") return raw || fallback
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>
    return (typeof obj["pt"] === "string" ? obj["pt"] : "") ||
      (typeof obj["en"] === "string" ? obj["en"] : "") ||
      fallback
  }
  return fallback
}
