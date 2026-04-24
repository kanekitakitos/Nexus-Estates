"use client"

import { motion } from "framer-motion"
import { Sparkles, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { BrutalButton } from "@/components/ui/forms/button"
import { BoingText } from "@/components/effects/BoingText"
import { nexusEyebrowAccentClass, nexusEyebrowClass, propertyCopy, propertyTokens } from "../lib/property-tokens"

interface ListHeaderProps {
  onAdd?: () => void
  showAdd: boolean
}

/**
 * ListHeader
 *
 * Cabeçalho editorial da secção de listagem de ativos.
 * Responsabilidade única: Renderizar o título "Inventário de Ativos",
 * o subtítulo de contexto e o botão de ação rápida para criação.
 */
export function ListHeader({ onAdd, showAdd }: ListHeaderProps) {
  return (
    <div className={propertyTokens.ui.list.headerWrapClass}>
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-foreground/25 dark:bg-white/20" aria-hidden />
          <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={3} aria-hidden />
          <span className={nexusEyebrowAccentClass}>{propertyCopy.list.headerKicker}</span>
        </div>
        <h1 className={propertyTokens.ui.list.headerTitleClass}>
          <BoingText text={propertyCopy.list.headerTitlePrefix} color="currentColor" activeColor={propertyTokens.ui.preview.boingActiveColor} />{" "}
          <span className="text-primary underline decoration-[4px] underline-offset-[8px]">
            {propertyCopy.list.headerTitleAccent}
          </span>
        </h1>
        <p className={cn(nexusEyebrowClass, "mt-4 max-w-xl normal-case")}>
          {propertyCopy.list.headerSubtitle}
        </p>
      </motion.div>

      {showAdd && (
        <BrutalButton type="button" variant="brutal-property-cta" onClick={onAdd}>
          <Plus className="h-4 w-4" strokeWidth={3} /> {propertyCopy.list.addCta}
        </BrutalButton>
      )}
    </div>
  )
}
