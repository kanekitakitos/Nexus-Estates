"use client"

import { motion } from "framer-motion"
import { Sparkles, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { BrutalButton } from "@/components/ui/forms/button"
import { BoingText } from "@/components/BoingText"
import { nexusEyebrowAccentClass, nexusEyebrowClass } from "../property-tokens"

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
    <div className="relative flex flex-col items-start justify-between gap-8 overflow-hidden border-b-2 border-[#0D0D0D] pb-10 pr-2 dark:border-zinc-700 md:flex-row md:items-end">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-foreground/25 dark:bg-white/20" aria-hidden />
          <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={3} aria-hidden />
          <span className={nexusEyebrowAccentClass}>Nexus_Inventory // Protocol</span>
        </div>
        <h1 className="max-w-3xl font-serif text-5xl font-bold italic uppercase leading-[0.85] tracking-tighter text-[#0D0D0D] md:text-7xl dark:text-white">
          <BoingText text="Inventário de" color="currentColor" activeColor="#F97316" />{" "}
          <span className="text-primary underline decoration-[4px] underline-offset-[8px]">
            Ativos
          </span>
        </h1>
        <p className={cn(nexusEyebrowClass, "mt-4 max-w-xl normal-case")}>
          Gestão editorial do teu alojamento local — mesmo ADN visual da landing Nexus Estates.
        </p>
      </motion.div>

      {showAdd && (
        <BrutalButton type="button" variant="brutal-property-cta" onClick={onAdd}>
          <Plus className="h-4 w-4" strokeWidth={3} /> Novo ativo
        </BrutalButton>
      )}
    </div>
  )
}
