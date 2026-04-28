"use client"

import { motion } from "framer-motion"
import { OwnProperty, PropertyListVariant } from "@/types"
import { staggerContainer, itemFadeUp } from "../lib/animations"
import { usePropertyFilters } from "../model/hooks"

import { PropertyCardItem } from "../components/property-card-item"
import { PropertyFilterBar } from "../components/property-filter-bar"
import { PropertyStats } from "../components/property-stats"
import { ListHeader } from "../components/list-header"
import { EmptyState, SkeletonLoader } from "../components/list-feedback"

export interface PropertyListProps {
  variant?: PropertyListVariant
  addNewProperty?: boolean
  properties?: OwnProperty[]
  onSelect?: (id: string) => void
  onAdd?: () => void
  onEdit?: (prop: OwnProperty) => void
  onDelete?: (id: string) => void | Promise<void>
  isLoading?: boolean
}

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

export function PropertyList({ variant = "CARDS", properties = [], ...props }: PropertyListProps) {
  const items = properties
  const { filters, updateFilter, filteredProperties } = usePropertyFilters(items)
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
      <PropertyStats properties={items} />
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

export function PropertyListBars(props: PropertyListProps) {
  return <PropertyList {...props} variant="BARS" />
}
