"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { LayoutGrid, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { staggerContainer, statCardVariants } from "../lib/animations"
import { AnimatedCounter } from "./animated-counter"
import { propertyCopy, propertyTokens } from "../lib/property-tokens"

// ─── Tipos e Props ─────────────────────────────────────────────────────────

/** Propriedades do dashboard de estatísticas de ativos */
export interface PropertyStatsProps {
  /** Lista de ativos para agregação de dados */
  properties?: OwnProperty[]
  /** Classes CSS adicionais para o contentor grid */
  className?: string
}

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/**
 * StatCard
 *
 * Cartão individual de KPI com design Neo-Brutalist e contador animado.
 * Responsabilidade única: Renderizar uma métrica com label, valor e ícone.
 *
 * Nota: Implementação própria para suportar `AnimatedCounter` no valor,
 * uma vez que `BrutalStatCard` aceita apenas `string | number`.
 */
export function StatCard({
  label,
  value,
  color,
  glowColor,
  icon: Icon,
  suffix,
  index,
}: {
  label: string
  value: number
  color: string
  glowColor: string
  icon: React.ElementType
  suffix: string
  index: number
}) {
  return (
    <motion.div
      variants={statCardVariants}
      custom={index}
      className={cn(
        propertyTokens.ui.stats.cardWrapClass
      )}
    >
      {/* Glow de hover */}
      <div
        className={cn(
          "absolute -right-4 -top-4 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700",
          glowColor
        )}
      />

      <div className="relative z-10 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={propertyTokens.ui.stats.iconWrapClass}>
              <Icon className={cn("w-5 h-5", color)} strokeWidth={3} />
            </div>
            <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground whitespace-nowrap">
              {label}
            </span>
          </div>
          <div className={propertyTokens.ui.stats.dotWrapClass}>
            <div className={cn("w-2 h-2 rounded-full animate-pulse", glowColor)} />
          </div>
        </div>

        {/* Valor principal */}
        <div className={propertyTokens.ui.stats.valueDividerClass}>
          <div className="flex items-baseline gap-2">
            <span
              className={cn("text-6xl font-black tracking-tighter italic", color)}
              style={{ WebkitTextStroke: propertyTokens.ui.stats.valueStroke }}
            >
              <AnimatedCounter value={value} />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase opacity-40">
              {suffix}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * PropertyStats — Painel de Indicadores de Desempenho (KPIs).
 *
 * Responsabilidade única: Agregar métricas da coleção de ativos e
 * delegar a renderização de cada KPI ao componente interno `StatCard`.
 *
 * @hook useMemo — Agrega statsData apenas quando as props de lista mudam.
 */
export function PropertyStats({ properties = [], className }: PropertyStatsProps) {
  const statsData = useMemo(() => {
    const items = properties
    return [
      {
        label: propertyCopy.stats.totalAssetsLabel,
        value: items.length,
        color: "text-primary",
        glowColor: "bg-primary",
        icon: LayoutGrid,
        suffix: propertyCopy.stats.totalAssetsSuffix,
      },
      {
        label: propertyCopy.stats.operationalLabel,
        value: items.filter((p) => p.status === "AVAILABLE").length,
        color: "text-emerald-500",
        glowColor: "bg-emerald-500",
        icon: CheckCircle2,
        suffix: propertyCopy.stats.operationalSuffix,
      },
      {
        label: propertyCopy.stats.unavailableLabel,
        value: items.filter((p) => p.status === "BOOKED" || p.status === "MAINTENANCE")
          .length,
        color: "text-rose-500",
        glowColor: "bg-rose-500",
        icon: Clock,
        suffix: propertyCopy.stats.unavailableSuffix,
      },
    ]
  }, [properties])

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className={cn("grid grid-cols-1 sm:grid-cols-3 gap-8", className)}
    >
      {statsData.map((item, idx) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          color={item.color}
          glowColor={item.glowColor}
          icon={item.icon}
          suffix={item.suffix}
          index={idx}
        />
      ))}
    </motion.div>
  )
}
