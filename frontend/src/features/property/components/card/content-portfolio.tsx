"use client"

import { MapPin, Users2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { BoingText } from "@/components/effects/BoingText"
import { nexusEyebrowClass, nexusEyebrowAccentClass } from "../../lib/property-tokens"
import { resolvePropertyDescription } from "../../lib/property-utils"
import { StatusBadge } from "./status-badge"

interface ContentPortfolioProps {
  title: string
  prop: OwnProperty
  onEdit?: (p: OwnProperty) => void
}

/**
 * ContentPortfolio
 *
 * Layout "Hero" editorial para a variante `portfolio`.
 * Responsabilidade única: Renderizar a visão de detalhe de alta-fidelidade
 * de um ativo — com tipografia editorial, descrição, métricas e CTA de edição.
 */
export function ContentPortfolio({ title, prop, onEdit }: ContentPortfolioProps) {
  const description = resolvePropertyDescription(prop.description)

  return (
    <div className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
      {/* Textura de fundo sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08] dark:invert"
        style={{
          backgroundImage: "radial-gradient(circle, #0D0D0D 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 space-y-6 p-8 lg:p-12">
        {/* Localização + Versão */}
        <div className="flex items-center justify-between">
          <p className={cn(nexusEyebrowClass, "flex items-center gap-2 opacity-70")}>
            <MapPin className="h-4 w-4 text-primary" strokeWidth={3} />
            <span className="truncate tracking-[0.25em]">
              {prop.location}{" // "}{prop.city}
            </span>
          </p>
          <div className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">
            Nexus_System_Active
          </div>
        </div>

        {/* Título Editorial */}
        <h1
          className="font-black uppercase leading-[0.85] tracking-tighter text-[#0D0D0D] dark:text-white"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          <BoingText text={title} color="currentColor" activeColor="#F97316" />
        </h1>

        {/* Status + Versão */}
        <div className="flex items-center gap-4">
          <StatusBadge status={prop.status} />
          <div className="rounded-full bg-[#0D0D0D]/5 px-4 py-2 font-mono text-[9px] font-black uppercase tracking-widest text-[#0D0D0D]/40 dark:bg-white/5 dark:text-white/20">
            Ver: 1.0.4
          </div>
        </div>

        {/* Descrição */}
        <p className="max-w-xl border-l-4 border-primary pl-6 font-mono text-sm font-bold leading-relaxed text-[#0D0D0D]/60 dark:text-zinc-400 italic line-clamp-3">
          {description}
        </p>

        {/* Métricas + CTA */}
        <div className="flex flex-wrap items-end justify-between gap-6 overflow-hidden border-t-4 border-[#0D0D0D] pt-8 dark:border-white/10">
          <div className="flex gap-12">
            {/* Rendimento */}
            <div>
              <span className={cn(nexusEyebrowAccentClass, "mb-2 block uppercase")}>
                Rendimento_Estimado //
              </span>
              <span className="text-5xl font-black tabular-nums tracking-tighter text-[#0D0D0D] md:text-6xl dark:text-white">
                {prop.price}€
              </span>
            </div>

            {/* Capacidade */}
            <div className="hidden border-l-2 border-[#0D0D0D]/10 pl-10 dark:border-white/10 sm:block">
              <span className={cn(nexusEyebrowAccentClass, "mb-2 block uppercase")}>
                Audiência_Alvo //
              </span>
              <div className="flex items-center gap-3 font-mono text-2xl font-black text-[#0D0D0D] dark:text-white">
                <Users2 className="h-6 w-6 text-primary" strokeWidth={3} />
                {prop.maxGuests} PAX
              </div>
            </div>
          </div>

          {/* Botão de Edição */}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(prop) }}
              className="group relative flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[#0D0D0D] bg-primary text-white shadow-[5px_5px_0_0_#0D0D0D] transition-all hover:bg-[#FF5E1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Pencil size={24} strokeWidth={3} />
              <div className="absolute -bottom-8 font-mono text-[8px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Editar_Ativo
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
