"use client"

import { Home, MapPin, Users2, Pencil, Star } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { resolveTranslation } from "../hooks"
import { microPop, nexusEntrance } from "../animations"
import { BoingText } from "@/components/BoingText"
import {
  nexusCardPressHover,
  nexusEyebrowAccentClass,
  nexusEyebrowClass,
  nexusHardBorder,
  nexusShadowLg,
  nexusShadowMd,
  nexusShadowSm,
  nexusKineticLight,
} from "../property-tokens"

// ─── Tipos e Definições ───────────────────────────────────────────────────

/** Variantes visuais suportadas pelo cartão */
export type PropertyCardDisplayVariant = "portfolio" | "grid" | "inventoryRail"

/** Aliases para compatibilidade e vistas simplificadas */
export type PropertyCardVariant = PropertyCardDisplayVariant | "default" | "compact" | "mini"

/** Mapeamento de variantes de estado (AVAILABLE, BOOKED, MAINTENANCE) */
const STATUS_CONFIG = {
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

// ─── Utilitários de Lógica ────────────────────────────────────────────────

/**
 * resolvePropertyCardVariant - Tradutor de variantes legadas para o novo sistema.
 */
export function resolvePropertyCardVariant(variant: PropertyCardVariant): PropertyCardDisplayVariant {
  const legacy: Record<string, PropertyCardDisplayVariant> = {
    default: "portfolio",
    compact: "grid",
    mini: "inventoryRail",
  }
  return legacy[variant] ?? (variant as PropertyCardDisplayVariant)
}

/**
 * resolvedSerialId - Gera um ID visual amigável (ex: #01) baseado no UUID.
 */
function resolvedSerialId(id: string) {
  if (!id || typeof id !== "string") return "00"
  const lastPart = id.slice(-2)
  const parsed = parseInt(lastPart, 16)
  return (Number.isNaN(parsed) ? 0 : (parsed % 99) + 1).toString().padStart(2, "0")
}

// ─── Sub-Componentes Atómicos ───────────────────────────────────────────────

/**
 * StatusBadge - Crachat de estado operacional.
 */
function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.AVAILABLE
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-widest transition-all",
        config.bg,
        config.shadow
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse shrink-0", config.dot)} style={{ boxShadow: '0 0 6px currentColor' }} />
      {config.label}
    </div>
  )
}

/**
 * CardMediaThumb - Container de imagem inteligente com estados de variant.
 * 
 * @description Gere as dimensões, crachats de 'HOT' e thumbnails por variante.
 */
function CardMediaThumb({
  prop,
  mode,
  serialId,
}: {
  prop: OwnProperty
  mode: PropertyCardDisplayVariant
  serialId: string
}) {
  const title = resolveTranslation(prop.title) || "Asset"
  const rail = mode === "inventoryRail"
  const grid = mode === "grid"
  const portfolio = mode === "portfolio"

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-[#E8E4D4] dark:bg-zinc-900 border-[#0D0D0D] dark:border-zinc-600 group/img transition-transform duration-500",
        rail && "m-1 h-12 w-12 rounded-xl border-2",
        grid && "h-20 w-32 rounded-xl border-2",
        portfolio &&
        "m-2 w-full rounded-[1.35rem] border-[3px] md:m-3 md:w-[min(100%,280px)] lg:w-[min(100%,320px)] aspect-[4/3] md:aspect-auto md:min-h-[220px] lg:min-h-[260px] group-hover:scale-[1.01]"
      )}
    >
      {prop.imageUrl ? (
        <motion.img
          src={prop.imageUrl}
          alt={title}
          className="h-full w-full object-cover grayscale-[0.15] transition-all duration-700 group-hover/img:grayscale-0 group-hover/img:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#F0ECD9]/50 dark:bg-zinc-800/50">
          <Home
            className={cn("text-[#8C7B6B]/50 dark:text-zinc-500", rail ? "h-6 w-6" : grid ? "h-8 w-8" : "h-14 w-14")}
            strokeWidth={1.2}
          />
        </div>
      )}

      {!rail && prop.featured && (
        <div className="absolute left-2 top-2 z-10 md:left-3 md:top-3">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg border-2 border-[#0D0D0D] bg-primary px-2 py-0.5 font-black uppercase tracking-widest text-white",
              nexusShadowSm,
              grid ? "text-[8px]" : "text-[9px]"
            )}
          >
            <Star className="h-2.5 w-2.5 fill-current" />
            <span>HOT</span>
          </div>
        </div>
      )}

      {portfolio && (
        <div className="pointer-events-none absolute bottom-3 left-4 z-10 rounded-md border border-white/25 bg-black/55 px-2 py-1 backdrop-blur-[2px]">
          <span className="font-mono text-[10px] font-black tracking-widest text-white">#{serialId}</span>
        </div>
      )}
    </div>
  )
}

// ─── Variantes de Conteúdo (Sub-Layouts) ────────────────────────────────────

/** 
 * ContentRail - Variante de item de lista compacta (Inventory Rail).
 */
function ContentRail({
  title, price, location, statusDot
}: {
  title: string; price: number; location: string; statusDot: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <h3 className="truncate text-sm font-black uppercase leading-tight tracking-tight text-[#0D0D0D] dark:text-white">
        {title}
      </h3>
      <div className="mt-1 flex items-center gap-2">
        <span className={cn("h-2 w-2 shrink-0 animate-pulse rounded-full", statusDot)} />
        <span className="truncate font-mono text-[11px] font-black tracking-tight text-primary">
          {price}€{" - "}{location}
        </span>
      </div>
    </div>
  )
}

/** 
 * ContentGrid - Variante de cartão de grelha otimizado para densidade.
 */
function ContentGrid({
  title, prop, onEdit
}: {
  title: string; prop: OwnProperty; onEdit?: (p: OwnProperty) => void
}) {
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
            <span className="font-mono text-[7px] font-black uppercase tracking-widest text-primary/60 mb-0.5">RENDIMENTO</span>
            <span className="text-lg font-black tabular-nums tracking-tighter text-[#0D0D0D] dark:text-white">
              {prop.price}€
            </span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="font-mono text-[7px] font-black uppercase tracking-widest text-primary/60 mb-0.5">CAPACIDADE</span>
            <div className="flex items-center gap-1 font-mono text-base font-black text-[#0D0D0D] dark:text-white">
              <Users2 className="h-3 w-3 text-primary" strokeWidth={3} />
              {prop.maxGuests}
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(prop); }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#0D0D0D] bg-primary text-white shadow-[3px_3px_0_0_#0D0D0D] transition-all hover:bg-[#FF5E1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            <Pencil size={14} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  )
}

/** 
 * ContentPortfolio - Variante "Hero" detalhada com estética editorial completa.
 */
function ContentPortfolio({
  title, prop, onEdit
}: {
  title: string; prop: OwnProperty; onEdit?: (p: OwnProperty) => void
}) {
  const description = typeof prop.description === "string" ? prop.description : prop.description?.pt || "Protótipo habitacional Nexus — eficiência operacional e compliance integrado."

  return (
    <div className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08] dark:invert"
        style={{ backgroundImage: "radial-gradient(circle, #0D0D0D 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />

      <div className="relative z-10 space-y-6 p-8 lg:p-12">
        <div className="flex items-center justify-between">
          <p className={cn(nexusEyebrowClass, "flex items-center gap-2 opacity-70")}>
            <MapPin className="h-4 w-4 text-primary" strokeWidth={3} />
            <span className="truncate tracking-[0.25em]">{prop.location}{" // "}{prop.city}</span>
          </p>
          <div className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">Nexus_System_Active</div>
        </div>

        <h1 className="font-black uppercase leading-[0.85] tracking-tighter text-[#0D0D0D] dark:text-white" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
          <BoingText text={title} color="currentColor" activeColor="#F97316" />
        </h1>

        <div className="flex items-center gap-4">
          <StatusBadge status={prop.status} />
          <div className="rounded-full bg-[#0D0D0D]/5 px-4 py-2 font-mono text-[9px] font-black uppercase tracking-widest text-[#0D0D0D]/40 dark:bg-white/5 dark:text-white/20">
            Ver: 1.0.4
          </div>
        </div>

        <p className={cn("max-w-xl border-l-4 border-primary pl-6 font-mono text-sm font-bold leading-relaxed text-[#0D0D0D]/60 dark:text-zinc-400 italic line-clamp-3")}>
          {description}
        </p>

        <div className="flex flex-wrap items-end justify-between gap-6 overflow-hidden border-t-4 border-[#0D0D0D] pt-8 dark:border-white/10">
          <div className="flex gap-12">
            <div>
              <span className={cn(nexusEyebrowAccentClass, "mb-2 block uppercase")}>Rendimento_Estimado //</span>
              <span className="text-5xl font-black tabular-nums tracking-tighter text-[#0D0D0D] md:text-6xl dark:text-white">
                {prop.price}€
              </span>
            </div>

            <div className="hidden border-l-2 border-[#0D0D0D]/10 pl-10 dark:border-white/10 sm:block">
              <span className={cn(nexusEyebrowAccentClass, "mb-2 block uppercase")}>Audiência_Alvo //</span>
              <div className="flex items-center gap-3 font-mono text-2xl font-black text-[#0D0D0D] dark:text-white">
                <Users2 className="h-6 w-6 text-primary" strokeWidth={3} />
                {prop.maxGuests} PAX
              </div>
            </div>
          </div>

          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(prop); }}
              className="group relative flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[#0D0D0D] bg-primary text-white shadow-[5px_5px_0_0_#0D0D0D] transition-all hover:bg-[#FF5E1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Pencil size={24} strokeWidth={3} />
              <div className="absolute -bottom-8 font-mono text-[8px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">Editar_Ativo</div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/** Propriedades do Cartão de Ativo */
export interface PropertyCardItemProps {
  /** Dados brutos do ativo */
  prop: OwnProperty
  /** Chamado ao selecionar o cartão */
  onSelect: (id: string) => void
  /** Opcional: Chamado ao premir o comando de edição */
  onEdit?: (prop: OwnProperty) => void
  /** Chamado ao solicitar remoção (não utilizado diretamente nesta UI) */
  onDelete?: (id: string) => void | Promise<void>
  /** Variante do layout */
  variant?: PropertyCardVariant
}

/**
 * PropertyCardItem - Módulo Visual de Representação de Ativos.
 * 
 * @description Orchestrador de layouts de cartão que adapta a densidade de 
 * informação baseada no contexto (Rail lateral vs Grelha vs Portfólio Central).
 */
export function PropertyCardItem({ prop, onSelect, onEdit, variant = "portfolio" }: PropertyCardItemProps) {
  const mode = resolvePropertyCardVariant(variant)
  const statusConfig = STATUS_CONFIG[prop.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.AVAILABLE
  const serial = resolvedSerialId(prop.id)
  const title = resolveTranslation(prop.title) || "Asset"

  const shell = cn(
    nexusHardBorder,
    "group cursor-pointer overflow-hidden bg-[#FAFAF5] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-[#0a0a0a]",
    nexusCardPressHover,
    mode === "inventoryRail" && cn("mx-auto w-[85%] rounded-md", nexusShadowSm, "hover:shadow-[5px_5px_0_0_#0D0D0D] dark:hover:shadow-[5px_5px_0_0_rgba(255,255,255,0.75)]", nexusKineticLight),
    mode === "grid" && cn("rounded-[1.35rem] md:rounded-[1.75rem] h-full mx-auto w-full max-w-[300px]", nexusShadowMd, "hover:shadow-[7px_7px_0_0_#0D0D0D] dark:hover:shadow-[7px_7px_0_0_rgba(24,24,27,1)]", nexusKineticLight),
    mode === "portfolio" && cn("rounded-[1.75rem] md:rounded-[2.25rem]", nexusShadowLg, "hover:shadow-[10px_10px_0_0_#0D0D0D] dark:hover:shadow-[10px_10px_0_0_rgba(24,24,27,1)]", nexusKineticLight, "hover:bg-white dark:hover:bg-zinc-900/50")
  )

  const layout = cn(
    "flex w-auto",
    mode === "inventoryRail" && "flex-row items-center gap-3 p-3",
    mode === "grid" && "h-auto flex-col items-center gap-0 py-2",
    mode === "portfolio" && "min-h-[260px] flex-col md:min-h-[300px] md:flex-row md:items-stretch"
  )

  return (
    <motion.div
      variants={nexusEntrance}
      initial="initial"
      animate="animate"
      whileTap={microPop}
      onClick={() => onSelect(prop.id)}
      className={shell}
    >
      <div className={layout}>
        {/* Media Thumbnail */}
        <CardMediaThumb prop={prop} mode={mode} serialId={serial} />

        {/* Content Variant Dispatcher */}
        {mode === "inventoryRail" && (
          <ContentRail title={title} price={prop.price} location={prop.location} statusDot={statusConfig.dot} />
        )}

        {mode === "grid" && (
          <ContentGrid title={title} prop={prop} onEdit={onEdit} />
        )}

        {mode === "portfolio" && (
          <ContentPortfolio title={title} prop={prop} onEdit={onEdit} />
        )}
      </div>
    </motion.div>
  )
}
