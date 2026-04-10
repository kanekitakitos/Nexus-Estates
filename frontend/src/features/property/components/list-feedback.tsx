"use client"

import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { nexusEyebrowClass, nexusShadowMd, nexusHardBorder } from "../property-tokens"

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
        "flex flex-col items-center rounded-[2.5rem] border-2 border-dashed border-[#0D0D0D]/10 bg-[#F0ECD9]/10 py-24 text-center dark:border-zinc-800 dark:bg-zinc-900/20",
        nexusShadowMd
      )}
    >
      <div className="relative mb-6">
        <AlertCircle
          className="h-14 w-14 text-[#8C7B6B]/40 dark:text-zinc-600"
          strokeWidth={1.5}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
        />
      </div>
      <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-[#0D0D0D] dark:text-white">
        Nexus_Null // Vazio
      </h3>
      <p className={cn(nexusEyebrowClass, "max-w-xs opacity-60")}>
        O protocolo de busca não retornou ativos para os critérios atuais.
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
        "h-48 animate-pulse rounded-[1.25rem] bg-[#E8E4D4]/60 dark:bg-zinc-800/50",
        nexusHardBorder
      )}
    />
  )
}
