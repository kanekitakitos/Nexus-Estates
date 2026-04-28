"use client"

import { MapPin, Users2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { nexusEyebrowClass, propertyCopy, propertyTokens } from "../../lib/property-tokens"
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
          <div className={propertyTokens.ui.cards.gridRefClass}>
            {propertyCopy.cards.refPrefix}
            {prop.id.slice(-4).toUpperCase()}
          </div>
        </div>

        <h3
          className={propertyTokens.ui.cards.gridTitleClass}
          style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
        >
          {title}
        </h3>

        <p className={cn(nexusEyebrowClass, "flex items-center justify-center gap-1 opacity-60 text-[8px]")}>
          <MapPin className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
          <span className="truncate max-w-[180px] tracking-widest">
            {prop.location} · {prop.city}
          </span>
        </p>
      </div>

      <div className={propertyTokens.ui.cards.gridDividerClass}>
        <div className="flex flex-1 items-center">
          <div className={propertyTokens.ui.cards.gridYieldDividerClass}>
            <span className="font-mono text-[7px] font-black uppercase tracking-widest text-primary/60 mb-0.5">
              {propertyCopy.cards.yieldLabel}
            </span>
            <span className={propertyTokens.ui.cards.gridValueClass}>
              {prop.price}€
            </span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="font-mono text-[7px] font-black uppercase tracking-widest text-primary/60 mb-0.5">
              {propertyCopy.cards.capacityLabel}
            </span>
            <div className={propertyTokens.ui.cards.gridPaxClass}>
              <Users2 className="h-3 w-3 text-primary" strokeWidth={3} />
              {prop.maxGuests}
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(prop) }}
            className={propertyTokens.ui.cards.gridEditButtonClass}
          >
            <Pencil size={14} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  )
}
