"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { OwnProperty, PropertyListVariant } from "@/types"
import { staggerContainer, itemFadeUp } from "./animations"
import { usePropertyFilters } from "./hooks"

import { PropertyCardItem } from "./components/property-card-item"
import { PropertyFilterBar } from "./components/property-filter-bar"
import { PropertyStats } from "./components/property-stats"
import { ListHeader } from "./components/list-header"
import { EmptyState, SkeletonLoader } from "./components/list-feedback"

// ─── Tipos e Interfaces ───────────────────────────────────────────────────

/** Propriedades do componente de listagem principal */
export interface PropertyListProps {
  /** Variante visual: Grelha (CARDS) ou Barra Lateral (BARS) */
  variant?: PropertyListVariant
  /** Se verdadeiro, exibe botão de criação de novas propriedades */
  addNewProperty?: boolean
  /** Lista de ativos brutos vindos da API ou Mock */
  propertys: OwnProperty[]
  /** Callback para seleção de um ativo */
  onSelect?: (id: string) => void
  /** Callback para iniciar criação de novo ativo */
  onAdd?: () => void
  /** Callback para editar um ativo específico */
  onEdit?: (prop: OwnProperty) => void
  /** Callback para apagar um ativo (decommission) */
  onDelete?: (id: string) => void | Promise<void>
  /** Estado de carregamento da listagem */
  isLoading?: boolean
}

// ─── Sub-Layouts Internos ─────────────────────────────────────────────────

/**
 * AssetGrid
 *
 * Grelha de ativos com animação de cascata (stagger).
 * Responsabilidade única: Dispor os PropertyCardItem em formato de grelha
 * e delegar para EmptyState quando não há resultados.
 */
function AssetGrid({
  items,
  onSelect,
  onEdit,
  onDelete,
}: {
  items: OwnProperty[]
  onSelect?: (id: string) => void
  onEdit?: (p: OwnProperty) => void
  onDelete?: (id: string) => void | Promise<void>
}) {
  if (items.length === 0) return <EmptyState />

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      {items.map((prop) => (
        <motion.div key={prop.id} variants={itemFadeUp} className="min-w-0 h-full">
          <PropertyCardItem
            prop={prop}
            onSelect={onSelect ?? (() => {})}
            onEdit={onEdit}
            onDelete={onDelete}
            variant="grid"
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * InventoryRailView
 *
 * Sub-layout para a variante lateral 'BARS'.
 * Responsabilidade única: Compor a vista compacta de barra lateral com
 * o botão de adição e a lista de PropertyCardItem em modo rail.
 */
function InventoryRailView({
  items,
  onAdd,
  onSelect,
  onEdit,
  onDelete,
  showAdd,
}: {
  items: OwnProperty[]
  onAdd?: () => void
  onSelect?: (id: string) => void
  onEdit?: (p: OwnProperty) => void
  onDelete?: (id: string) => void | Promise<void>
  showAdd?: boolean
}) {
  return (
    <div className="h-full flex flex-col pt-4 overflow-hidden">
      {showAdd && (
        <button
          onClick={onAdd}
          className="w-full h-10 border-2 border-dashed border-foreground/30 dark:border-zinc-800 rounded-lg font-mono text-[10px] uppercase font-black mb-6 text-foreground/60 dark:text-zinc-400 hover:border-primary transition-colors"
        >
          [ + ] NOVO_ATIVO
        </button>
      )}
      <div className="flex-1 pt-1 space-y-3 overflow-y-auto pr-1">
        {items.map((prop) => (
          <PropertyCardItem
            key={prop.id}
            prop={prop}
            onSelect={onSelect ?? (() => {})}
            onEdit={onEdit}
            onDelete={onDelete}
            variant="inventoryRail"
          />
        ))}
      </div>
    </div>
  )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * PropertyList — Orchestrador de Inventário de Ativos.
 *
 * Responsabilidade única: Gerir a troca de variante de vista (CARDS vs BARS),
 * coordenar os filtros e compor os sub-layouts com os dados corretos.
 *
 * @hook usePropertyFilters - Lógica de filtragem client-side isolada no hook.
 */
export function PropertyList({ variant = "CARDS", propertys, ...props }: PropertyListProps) {
  const { filters, updateFilter, filteredProperties } = usePropertyFilters(propertys)
  // Cast necessário: PropertyFilterBar espera (key: string, value: ...) mas o hook usa genéricos
  const setFilter = updateFilter as (key: string, value: string | boolean | number) => void

  if (variant === "BARS") {
    return (
      <div className="h-full flex flex-col gap-6">
        <PropertyFilterBar filters={filters} setFilter={setFilter} variant="compact" />
        <InventoryRailView
          items={filteredProperties}
          onAdd={props.onAdd}
          onSelect={props.onSelect}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
          showAdd={props.addNewProperty}
        />
      </div>
    )
  }

  return (
    <div className="space-y-10 py-6 md:py-15">
      <ListHeader onAdd={props.onAdd} showAdd={!!props.addNewProperty} />
      <PropertyStats propertys={propertys} />
      <PropertyFilterBar filters={filters} setFilter={setFilter} variant="default" />

      <div className="space-y-6">
        {props.isLoading ? (
          <SkeletonLoader />
        ) : (
          <AssetGrid
            items={filteredProperties}
            onSelect={props.onSelect}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
          />
        )}
      </div>
    </div>
  )
}

/**
 * PropertyListBars — Atalho de conveniência para a variante lateral (BARS).
 */
export function PropertyListBars(props: PropertyListProps) {
  return <PropertyList {...props} variant="BARS" />
}