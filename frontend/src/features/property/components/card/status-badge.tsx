"use client"

import { cn } from "@/lib/utils"
import { STATUS_CONFIG } from "../../model/property-constants"

interface StatusBadgeProps {
  /** Estado operacional do ativo (AVAILABLE | BOOKED | MAINTENANCE) */
  status: string
}

/**
 * StatusBadge
 *
 * Crachá de estado operacional com indicador pulsante e glow colorido.
 * Responsabilidade única: Representar visualmente o estado de um ativo.
 *
 * @example <StatusBadge status="AVAILABLE" />
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.AVAILABLE

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-widest transition-all",
        config.bg,
        config.shadow
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full animate-pulse shrink-0",
          config.dot
        )}
        style={{ boxShadow: "0 0 6px currentColor" }}
      />
      {config.label}
    </div>
  )
}
