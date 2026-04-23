"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAmenityCatalog, resolveTranslation } from "../model/hooks"
import { nexusEyebrowClass, nexusShadowSm, nexusKineticLight } from "../lib/property-tokens"
import { CATEGORY_CONFIG } from "../model/property-constants"
import { BoingText } from "@/components/effects/BoingText"
import { staggerContainer, itemFadeUp, microPop } from "../lib/animations"

// ─── Tipos e Props ────────────────────────────────────────────────────────

/** Propriedades do seletor de comodidades */
export interface AmenitiesFieldProps {
  /** Lista de IDs atualmente selecionados no estado draft */
  selectedIds: number[]
  /** Lista de IDs originais persistidos no servidor */
  savedIds: number[]
  /** Callback para atualizar o estado de IDs selecionados */
  onUpdateIds: (newIds: number[]) => void
  /** Callback para reverter as alterações para o estado original */
  onRevert: () => void
}

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/**
 * AmenityHeader - Cabeçalho do módulo de comodidades com acção de reversão.
 */
function AmenityHeader({ didChange, onRevert }: { didChange: boolean; onRevert: () => void }) {
  return (
    <div className="mb-10 flex items-center justify-between border-b-2 border-[#0D0D0D]/10 pb-6 dark:border-white/10">
      <div>
        <span className={nexusEyebrowClass}>Nexus_Comfort_Matrix // Protocol</span>
        <h4 className="font-serif text-3xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] dark:text-white">
          <BoingText text="Services & Comfort" color="currentColor" activeColor="#F97316" />
        </h4>
      </div>

      <AnimatePresence>
        {didChange && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onRevert}
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-xl bg-[#0D0D0D] px-4 py-2 font-mono text-[10px] font-black uppercase text-white transition-all hover:bg-primary dark:bg-white dark:text-[#0D0D0D] dark:hover:bg-primary",
              nexusShadowSm
            )}
          >
            <RotateCcw className="h-3 w-3" strokeWidth={3} />
            Revert_State
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * AmenityItem - Botão individual de alternância para uma comodidade.
 */
function AmenityItem({
  name,
  isSelected,
  onClick,
}: {
  name: string | { pt?: string; en?: string }
  isSelected: boolean
  onClick: () => void
}) {
  const resolvedName = resolveTranslation(name)

  return (
    <motion.button
      whileTap={microPop}
      whileHover={{ scale: 1.02, x: 2, y: -2 }}
      onClick={onClick}
      type="button"
      className={cn(
        "group relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border-2 px-4 py-3.5 transition-all duration-300",
        isSelected
          ? "border-[#0D0D0D] bg-primary text-white shadow-[3px_3px_0_0_#0D0D0D] dark:border-white dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.7)]"
          : "border-[#0D0D0D]/10 bg-white/50 hover:border-primary/50 hover:bg-white dark:border-white/10 dark:bg-zinc-900/50",
        nexusKineticLight
      )}
    >
      <span
        className={cn(
          "font-mono text-[10px] font-black uppercase tracking-tight",
          isSelected ? "text-white" : "text-[#0D0D0D] dark:text-zinc-300"
        )}
      >
        {resolvedName}
      </span>

      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
          isSelected ? "border-white bg-white/20" : "border-[#0D0D0D]/20 dark:border-white/20"
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
      </div>
    </motion.button>
  )
}

/**
 * CategorySection - Bloco divisor e grid para uma categoria de comodidades.
 */
function CategorySection({ 
  category, items, selectedIds, onToggle 
}: { 
  category: string; 
  items: Array<{ id: number; name: string | { pt?: string; en?: string } }>; 
  selectedIds: number[]; 
  onToggle: (id: number) => void 
}) {
  const config = CATEGORY_CONFIG[category as import("../model/property-constants").AmenityCategory] ?? CATEGORY_CONFIG.General
  
  return (
    <div className="group/cat relative">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0D0D0D] bg-white text-lg shadow-[3px_3px_0_0_#0D0D0D] dark:border-white dark:bg-zinc-800 dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.1)]",
              config.color
            )}
          >
            {config.icon}
          </div>
          <div>
            <span className="block font-mono text-[8px] font-black uppercase tracking-widest text-primary">
              {items.length.toString().padStart(2, "0")}_INDEX
            </span>
            <h5 className="font-serif text-xl font-bold italic uppercase tracking-tight text-[#0D0D0D] dark:text-zinc-100">
              <BoingText text={category} color="currentColor" activeColor="#F97316" duration={0.3} stagger={0.02} />
            </h5>
          </div>
        </div>
        <div className="h-px flex-1 bg-[#0D0D0D]/10 dark:bg-white/10" />
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {items.map((amenity) => (
          <motion.div key={amenity.id} variants={itemFadeUp}>
            <AmenityItem
              name={amenity.name}
              isSelected={selectedIds.includes(amenity.id)}
              onClick={() => onToggle(amenity.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * AmenitiesField - Gestor Matrix de Serviços e Conforto.
 * 
 * @description Providencia uma interface categorizada para seleção de comodidades
 * do ativo. Utiliza um sistema de verificação de integridade entre o estado
 * persistido e o draft para indicar alterações pendentes.
 */
export function AmenitiesField({ selectedIds, savedIds, onUpdateIds, onRevert }: AmenitiesFieldProps) {
  const { amenities, isLoading } = useAmenityCatalog()

  // Verificação de Alterações
  const currentSorted = [...selectedIds].sort((a, b) => a - b)
  const savedSorted = [...savedIds].sort((a, b) => a - b)
  const didChange = JSON.stringify(currentSorted) !== JSON.stringify(savedSorted)

  // Handlers
  const toggleAmenity = (id: number) => {
    onUpdateIds(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id])
  }

  // Agrupamento Matrix
  const groupedAmenities = amenities.reduce((acc, amenity) => {
    const cat = amenity.category || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(amenity)
    return acc
  }, {} as Record<string, typeof amenities>)

  // Loading State (Shimmer/Loader modular)
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#0D0D0D]/10 bg-[#FAFAF5] p-20 dark:border-white/10 dark:bg-zinc-900/40">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" strokeWidth={3} />
        <span className="animate-pulse font-mono text-[10px] font-black uppercase tracking-widest text-[#8C7B6B]">
          Initializing_Comfort_DB{" //"}
        </span>
      </div>
    )

  return (
    <section className="space-y-10">
      {/* Cabeçalho de Protocolo */}
      <AmenityHeader didChange={didChange} onRevert={onRevert} />

      {/* Lista de Categorias Matrix */}
      <div className="space-y-12">
        {Object.entries(groupedAmenities).map(([category, items]) => (
          <CategorySection
            key={category}
            category={category}
            items={items}
            selectedIds={selectedIds}
            onToggle={toggleAmenity}
          />
        ))}
      </div>

      {/* Footer de Sincronização */}
      <AnimatePresence>
        {didChange && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-center gap-4 rounded-xl border-2 border-dashed border-primary px-6 py-4 dark:bg-primary/5 bg-primary/5"
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary text-center">
              Protocolo_Sincronização_Pendente{" //"} Aguardando confirmação do operador
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
