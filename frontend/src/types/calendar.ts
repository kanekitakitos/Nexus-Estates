/**
 * @file calendar.ts
 * @author Nexus Estates team
 * @description Tipos de dados usados nos componentes do calendário e da timeline no dashboard.
 */

import type { PropertyListItem } from "@/types/property"

/**
 * Item de timeline (uma linha do calendário).
 *
 * Nota: este tipo nasceu do calendário do dashboard e mantém nomes
 * compatíveis com o código existente (`properti`).
 */
export interface TimelineItemWithNames {
  properti?: PropertyListItem
  id: number
  label?: string
  periods: Period[]
}

/**
 * Período renderizado dentro do calendário (ex.: reserva).
 *
 * `meta` permite enriquecer o hover sem alterar o layout do calendário.
 */
export interface Period {
  startDay: Date
  endDay: Date
  name?: string
  color: string
  meta?: {
    email?: string
    guestCount?: number
  }
}


