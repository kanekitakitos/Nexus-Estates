"use client"

import { Home, Star } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { resolveTranslation } from "../../model/hooks"
import { nexusShadowSm, propertyCopy, propertyTokens } from "../../lib/property-tokens"
import { PropertyCardDisplayVariant } from "../../model/property-constants"

interface CardMediaThumbProps {
  /** Dados brutos do ativo para exibir */
  prop: OwnProperty
  /** Variante de layout que determina as dimensões da thumbnail */
  mode: PropertyCardDisplayVariant
  /** ID serial formatado (ex: "07") para overlay na variante portfolio */
  serialId: string
}

/**
 * CardMediaThumb
 *
 * Container de imagem inteligente para cartões de propriedade.
 * Responsabilidade única: Gerir a secção visual/media do cartão,
 * adaptando dimensões e overlays à variante de display.
 */
export function CardMediaThumb({ prop, mode, serialId }: CardMediaThumbProps) {
  const title = resolveTranslation(prop.title) || propertyCopy.cards.fallbackTitle
  const rail = mode === "inventoryRail"
  const grid = mode === "grid"
  const portfolio = mode === "portfolio"

  return (
    <div
      className={cn(
        propertyTokens.ui.cards.mediaThumbBaseClass,
        propertyTokens.ui.cards.mediaThumbBgClass,
        propertyTokens.ui.cards.mediaThumbBorderColorClass,
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
        <div className={propertyTokens.ui.cards.mediaThumbPlaceholderBgClass}>
          <Home
            className={cn(
              propertyTokens.ui.cards.mediaThumbIconColorClass,
              rail ? "h-6 w-6" : grid ? "h-8 w-8" : "h-14 w-14"
            )}
            strokeWidth={1.2}
          />
        </div>
      )}

      {/* Badge "HOT" — apenas em variantes que não são rail */}
      {!rail && prop.featured && (
        <div className="absolute left-2 top-2 z-10 md:left-3 md:top-3">
          <div
            className={cn(
              propertyTokens.ui.cards.mediaThumbFeaturedBadgeClass,
              nexusShadowSm,
              grid ? "text-[8px]" : "text-[9px]"
            )}
          >
            <Star className="h-2.5 w-2.5 fill-current" />
            <span>{propertyCopy.cards.featuredBadge}</span>
          </div>
        </div>
      )}

      {/* Overlay de Serial ID — apenas na variante portfolio */}
      {portfolio && (
        <div className="pointer-events-none absolute bottom-3 left-4 z-10 rounded-md border border-white/25 bg-black/55 px-2 py-1 backdrop-blur-[2px]">
          <span className="font-mono text-[10px] font-black tracking-widest text-white">
            #{serialId}
          </span>
        </div>
      )}
    </div>
  )
}
