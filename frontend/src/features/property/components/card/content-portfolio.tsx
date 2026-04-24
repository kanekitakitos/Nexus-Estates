"use client"

import { MapPin, Users2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { BoingText } from "@/components/effects/BoingText"
import { nexusEyebrowClass, nexusEyebrowAccentClass, propertyCopy, propertyTokens } from "../../lib/property-tokens"
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
          backgroundImage: propertyTokens.ui.cards.portfolioTextureBgImage,
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
            {propertyCopy.cards.systemActive}
          </div>
        </div>

        {/* Título Editorial */}
        <h1
          className={propertyTokens.ui.cards.portfolioTitleClass}
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          <BoingText text={title} color="currentColor" activeColor={propertyTokens.ui.preview.boingActiveColor} />
        </h1>

        {/* Status + Versão */}
        <div className="flex items-center gap-4">
          <StatusBadge status={prop.status} />
          <div className={propertyTokens.ui.cards.portfolioVersionTagClass}>
            {propertyCopy.cards.versionTag}
          </div>
        </div>

        {/* Descrição */}
        <p className={propertyTokens.ui.cards.portfolioDescriptionClass}>
          {description}
        </p>

        {/* Métricas + CTA */}
        <div className={propertyTokens.ui.cards.portfolioDividerClass}>
          <div className="flex gap-12">
            {/* Rendimento */}
            <div>
              <span className={cn(nexusEyebrowAccentClass, "mb-2 block uppercase")}>
                {propertyCopy.cards.yieldEstimated}
              </span>
              <span className={propertyTokens.ui.cards.portfolioYieldValueClass}>
                {prop.price}€
              </span>
            </div>

            {/* Capacidade */}
            <div className={propertyTokens.ui.cards.portfolioAudienceWrapClass}>
              <span className={cn(nexusEyebrowAccentClass, "mb-2 block uppercase")}>
                {propertyCopy.cards.audienceTarget}
              </span>
              <div className={propertyTokens.ui.cards.portfolioPaxClass}>
                <Users2 className="h-6 w-6 text-primary" strokeWidth={3} />
                {prop.maxGuests} {propertyCopy.cards.paxSuffix}
              </div>
            </div>
          </div>

          {/* Botão de Edição */}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(prop) }}
              className={propertyTokens.ui.cards.portfolioEditButtonClass}
            >
              <Pencil size={24} strokeWidth={3} />
              <div className="absolute -bottom-8 font-mono text-[8px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {propertyCopy.cards.editAsset}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
