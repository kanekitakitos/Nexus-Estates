"use client"

import { cn } from "@/lib/utils"

interface ContentRailProps {
  title: string
  price: number
  location: string
  /** Classe de cor Tailwind para o indicador de estado (ex: "bg-emerald-500") */
  statusDot: string
}

/**
 * ContentRail
 *
 * Layout de conteúdo compacto para a variante `inventoryRail`.
 * Responsabilidade única: Renderizar informação de ativo em modo
 * de lista lateral ultra-densa (título + preço + localização).
 */
export function ContentRail({ title, price, location, statusDot }: ContentRailProps) {
  return (
    <div className="min-w-0 flex-1">
      <h3 className="truncate text-sm font-black uppercase leading-tight tracking-tight text-[#0D0D0D] dark:text-white">
        {title}
      </h3>
      <div className="mt-1 flex items-center gap-2">
        <span
          className={cn("h-2 w-2 shrink-0 animate-pulse rounded-full", statusDot)}
        />
        <span className="truncate font-mono text-[11px] font-black tracking-tight text-primary">
          {price}€{" - "}{location}
        </span>
      </div>
    </div>
  )
}
