/**
 * @file date.ts
 * @author Nexus Estates team
 * @description Utilitários de datas específicos do Dashboard. Centraliza conversões e comparações de datas
 *              (incluindo parsing seguro de "YYYY-MM-DD") para evitar efeitos colaterais de timezone.
 */

/**
 * Utilitários de datas do Dashboard (timezone local).
 *
 * Nota: o dashboard lida com strings ISO do backend no formato "YYYY-MM-DD" e
 * precisa de converter para Date sem introduzir offset UTC inesperado.
 */

/**
 * Parse seguro de "YYYY-MM-DD" para uma Date em tempo local (00:00).
 */
export function parseISODateLocal(dateStr: string): Date {
  const base = String(dateStr ?? "").trim().split("T")[0]?.split(" ")[0] ?? ""
  const [y, m, d] = base.split("-").map((part) => Number(part))
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/**
 * Verifica se `date` (normalizado para dia) está dentro de [start, end] inclusivo.
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const x = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return x >= a && x <= b
}
