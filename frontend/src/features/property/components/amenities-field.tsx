"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAmenityCatalog, resolveTranslation } from "../model/hooks"
import { nexusEyebrowClass, nexusShadowSm, nexusKineticLight, propertyCopy, propertyTokens } from "../lib/property-tokens"
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
    <div className={propertyTokens.ui.amenitiesField.headerWrapClass}>
      <div>
        <span className={nexusEyebrowClass}>{propertyCopy.amenitiesField.protocolEyebrow}</span>
        <h4 className={propertyTokens.ui.amenitiesField.headerTitleClass}>
          <BoingText text={propertyCopy.amenitiesField.title} color="currentColor" activeColor={propertyTokens.ui.preview.boingActiveColor} />
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
              propertyTokens.ui.amenitiesField.revertButtonClass,
              nexusShadowSm
            )}
          >
            <RotateCcw className="h-3 w-3" strokeWidth={3} />
            {propertyCopy.amenitiesField.revert}
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
          ? propertyTokens.ui.amenitiesField.itemSelectedClass
          : propertyTokens.ui.amenitiesField.itemUnselectedClass,
        nexusKineticLight
      )}
    >
      <span
        className={cn(
          "font-mono text-[10px] font-black uppercase tracking-tight",
          isSelected ? "text-white" : propertyTokens.ui.amenitiesField.itemTextUnselectedClass
        )}
      >
        {resolvedName}
      </span>

      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
          isSelected ? "border-white bg-white/20" : propertyTokens.ui.amenitiesField.itemCheckUnselectedClass
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
              propertyTokens.ui.amenitiesField.categoryIconWrapClass,
              config.color
            )}
          >
            {config.icon}
          </div>
          <div>
            <span className="block font-mono text-[8px] font-black uppercase tracking-widest text-primary">
              {items.length.toString().padStart(2, propertyCopy.amenitiesField.padChar)}
              {propertyCopy.amenitiesField.categoryIndexSuffix}
            </span>
            <h5 className={propertyTokens.ui.amenitiesField.categoryTitleClass}>
              <BoingText text={category} color="currentColor" activeColor={propertyTokens.ui.preview.boingActiveColor} duration={0.3} stagger={0.02} />
            </h5>
          </div>
        </div>
        <div className={propertyTokens.ui.amenitiesField.categoryDividerClass} />
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
    const cat = amenity.category || propertyCopy.amenitiesField.defaultCategory
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(amenity)
    return acc
  }, {} as Record<string, typeof amenities>)

  // Loading State (Shimmer/Loader modular)
  if (isLoading)
    return (
      <div className={propertyTokens.ui.amenitiesField.loadingWrapClass}>
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" strokeWidth={3} />
        <span className={propertyTokens.ui.amenitiesField.loadingTextClass}>
          {propertyCopy.amenitiesField.loading}
          {propertyCopy.amenitiesField.loadingDivider}
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
            className={propertyTokens.ui.amenitiesField.syncFooterClass}
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary text-center">
              {propertyCopy.amenitiesField.syncPending}
              {propertyCopy.amenitiesField.syncPendingDivider}{" "}
              {propertyCopy.amenitiesField.syncPendingNote}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
