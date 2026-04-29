"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { resolveTranslation } from "../model/hooks"
import { microPop, nexusEntrance } from "../lib/animations"
import {
  nexusCardPressHover,
  nexusHardBorder,
  nexusShadowLg,
  nexusShadowMd,
  nexusShadowSm,
  nexusKineticLight,
  propertyCopy,
  propertyTokens,
} from "../lib/property-tokens"
import { STATUS_CONFIG } from "../model/property-constants"
import { resolvePropertyCardVariant, resolvedSerialId } from "../lib/property-utils"
import { CardMediaThumb, ContentRail, ContentGrid, ContentPortfolio } from "./card"

// Re-exporta tipos públicos para não quebrar imports externos
export type { PropertyCardDisplayVariant, PropertyCardVariant } from "../model/property-constants"
export { resolvePropertyCardVariant } from "../lib/property-utils"

// ─── Tipos Públicos ────────────────────────────────────────────────────────

/** Propriedades do Cartão de Ativo */
export interface PropertyCardItemProps {
  /** Dados brutos do ativo */
  prop: OwnProperty
  /** Chamado ao selecionar o cartão */
  onSelect: (id: string) => void
  /** Opcional: Chamado ao premir o comando de edição */
  onEdit?: (prop: OwnProperty) => void
  /** Chamado ao solicitar remoção */
  onDelete?: (id: string) => void | Promise<void>
  /** Variante do layout */
  variant?: import("../model/property-constants").PropertyCardVariant
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * PropertyCardItem — Orchestrador de Layout de Ativos.
 *
 * Responsabilidade única: Compor os sub-componentes atómicos (CardMediaThumb,
 * ContentRail, ContentGrid, ContentPortfolio) com base na variante de display,
 * e aplicar o shell visual (bordas, sombras, animações) correto.
 *
 * A lógica visual de cada variante está nos respetivos sub-componentes em `./card/`.
 */
export function PropertyCardItem({
  prop,
  onSelect,
  onEdit,
  variant = "portfolio",
}: PropertyCardItemProps) {
  const mode = resolvePropertyCardVariant(variant)
  const statusConfig =
    STATUS_CONFIG[prop.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.AVAILABLE
  const serial = resolvedSerialId(prop.id)
  const title = resolveTranslation(prop.title) || propertyCopy.cards.fallbackTitle

  const shell = cn(
    nexusHardBorder,
    propertyTokens.ui.cards.cardShellBgClass,
    nexusCardPressHover,
    mode === "inventoryRail" &&
      cn(
        "mx-auto w-[85%] rounded-md",
        nexusShadowSm,
        propertyTokens.ui.cards.cardShellHoverRailClass,
        nexusKineticLight
      ),
    mode === "grid" &&
      cn(
        "rounded-[1.35rem] md:rounded-[1.75rem] h-full mx-auto w-full max-w-[300px]",
        nexusShadowMd,
        propertyTokens.ui.cards.cardShellHoverGridClass,
        nexusKineticLight
      ),
    mode === "portfolio" &&
      cn(
        "rounded-[1.75rem] md:rounded-[2.25rem]",
        nexusShadowLg,
        propertyTokens.ui.cards.cardShellHoverPortfolioClass,
        nexusKineticLight,
        "hover:bg-white dark:hover:bg-zinc-900/50"
      )
  )

  const layout = cn(
    "flex w-auto",
    mode === "inventoryRail" && "flex-row items-center gap-3 p-3",
    mode === "grid" && "h-auto flex-col items-center gap-0 py-2",
    mode === "portfolio" &&
      "min-h-[260px] flex-col md:min-h-[300px] md:flex-row md:items-stretch"
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
        <CardMediaThumb prop={prop} mode={mode} serialId={serial} />

        {mode === "inventoryRail" && (
          <ContentRail
            title={title}
            price={prop.price}
            location={prop.location}
            statusDot={statusConfig.dot}
          />
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
