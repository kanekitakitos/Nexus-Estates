"use client"

import { MapPin, Users2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { nexusEyebrowClass } from "../../property-tokens"
import { StatusBadge } from "./status-badge"

interface ContentGridProps {
  title: string
  prop: OwnProperty
  onEdit?: (p: OwnProperty) => void
}

/**
 * ContentGrid
 *
 * Layout de conteúdo otimizado para a variante `grid` (grelha de cartões).
 * Responsabilidade única: Renderizar a informação do ativo em modo de
 * densidade média — status, título, localização, rendimento e capacidade.
 */
export function ContentGrid({ title, prop, onEdit }: ContentGridProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col relative px-3 pb-3">
      <div className="space-y-2 pt-3">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={prop.status} />
          <div className="font-mono text-[7px] font-black uppercase tracking-[0.2em] text-[#0D0D0D]/20 dark:text-white/20">
            REF_{prop.id.slice(-4).toUpperCase()}
          </div>
        </div>

        <h3
          className="font-black uppercase leading-[0.9] tracking-[-0.03em] text-[#0D0D0D] dark:text-white transition-colors duration-300 group-hover:text-primary text-center"
          style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
        >
          {title}
        </h3>

        <p className={cn(nexusEyebrowClass, "flex items-center justify-center gap-1 opacity-60 text-[8px]")}>
          <MapPin className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
          <span className="truncate max-w-[180px] tracking-widest">
            {prop.location} // {prop.city}
          </span>
        </p>
      </div>

      <div className="mt-4 flex items-center border-t-2 border-[#0D0D0D] dark:border-white/10 pt-3 gap-2">
        <div className="flex flex-1 items-center">
          <div className="flex flex-col items-center flex-1 border-r border-[#0D0D0D]/10 dark:border-white/10">
            <span className="font-mono text-[7px] font-black uppercase tracking-widest text-primary/60 mb-0.5">
              RENDIMENTO
            </span>
            <span className="text-lg font-black tabular-nums tracking-tighter text-[#0D0D0D] dark:text-white">
              {prop.price}€
            </span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="font-mono text-[7px] font-black uppercase tracking-widest text-primary/60 mb-0.5">
              CAPACIDADE
            </span>
            <div className="flex items-center gap-1 font-mono text-base font-black text-[#0D0D0D] dark:text-white">
              <Users2 className="h-3 w-3 text-primary" strokeWidth={3} />
              {prop.maxGuests}
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(prop) }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#0D0D0D] bg-primary text-white shadow-[3px_3px_0_0_#0D0D0D] transition-all hover:bg-[#FF5E1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            <Pencil size={14} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  )
}
