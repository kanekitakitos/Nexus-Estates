"use client"

import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { nexusEyebrowClass, nexusShadowMd, nexusHardBorder, propertyCopy, propertyTokens } from "../lib/property-tokens"

// ─── EmptyState ─────────────────────────────────────────────────────────────

/**
 * EmptyState
 *
 * Feedback visual para listas sem resultados (Nexus_Null).
 * Responsabilidade única: Comunicar ao utilizador que a pesquisa
 * não retornou ativos com os critérios atuais.
 */
export function EmptyState() {
  return (
    <div
      className={cn(
        propertyTokens.ui.list.emptyWrapClass,
        nexusShadowMd
      )}
    >
      <div className="relative mb-6">
        <AlertCircle
          className={propertyTokens.ui.list.emptyIconClass}
          strokeWidth={1.5}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
        />
      </div>
      <h3 className={propertyTokens.ui.list.emptyTitleClass}>
        {propertyCopy.list.emptyTitle}
      </h3>
      <p className={cn(nexusEyebrowClass, "max-w-xs opacity-60")}>
        {propertyCopy.list.emptyBody}
      </p>
    </div>
  )
}

// ─── SkeletonLoader ──────────────────────────────────────────────────────────

/**
 * SkeletonLoader
 *
 * Placeholder animado para o estado de carregamento de ativos.
 * Responsabilidade única: Indicar visualmente que o conteúdo está a ser carregado.
 */
export function SkeletonLoader() {
  return (
    <div
      className={cn(
        propertyTokens.ui.list.skeletonBgClass,
        nexusHardBorder
      )}
    />
  )
}
