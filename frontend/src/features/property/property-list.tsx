"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { PropertyCardItem } from "./components/property-card-item"
import { PropertyFilterBar } from "./components/property-filter-bar"
import { usePropertyFilters } from "./hooks/use-property-filters"
import { OwnProperty, PropertyListVariant } from "@/types"
import { staggerContainer, itemFadeUp } from "./animations"

// Consolidated Sections
import { ListHeader, ListStats, EmptyState } from "./sections/list/ListSections"

interface PropertyListProps {
    variant?: PropertyListVariant
    addNewProperty?: boolean
    propertys: OwnProperty[]
    onSelect?: (id: string) => void
    onAdd?: () => void
    onEdit?: (prop: OwnProperty) => void
    onDelete?: (id: string) => void | Promise<void>
    isLoading?: boolean
}

export function PropertyList({ variant = "CARDS", ...props }: PropertyListProps) {
    if (variant === "BARS") return <PropertyListBars {...props} />
    return <PropertyListCards {...props} />
}

export function PropertyListCards({ propertys, onSelect = () => {}, onDelete, onAdd, onEdit, isLoading = false, addNewProperty = false }: PropertyListProps) {
    const { filteredProperties } = usePropertyFilters(propertys)

    return (
        <div className="space-y-10 py-6">
            <ListHeader addNewProperty={addNewProperty} onAdd={onAdd} />
            <ListStats propertys={propertys} />

            <div className="space-y-6">
                {isLoading ? <div className="h-40 border-2 border-foreground animate-pulse rounded-xl bg-muted/10"/> : (
                    <motion.div
                        initial="initial" animate="animate"
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredProperties.map((prop) => (
                            <motion.div
                                key={prop.id}
                                variants={itemFadeUp}
                            >
                                <PropertyCardItem prop={prop} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} variant="compact" />
                            </motion.div>
                        ))}
                        {filteredProperties.length === 0 && <div className="col-span-full"><EmptyState /></div>}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export function PropertyListBars({ propertys, onSelect = () => {}, onDelete, onAdd, onEdit, isLoading = false, addNewProperty = false }: PropertyListProps) {
    const { filters, updateFilter, filteredProperties } = usePropertyFilters(propertys)

    return (
        <div className="h-full flex flex-col pt-4">
            <PropertyFilterBar filters={filters} setFilter={updateFilter} variant="compact" />
            {addNewProperty && (
                <button onClick={onAdd} className="w-full h-10 border-2 border-dashed border-foreground/30 rounded-lg font-mono text-[10px] uppercase font-black mb-4">
                    [ + ] NOVO_ATIVO
                </button>
            )}
            <div className="flex-1 space-y-3">
                {filteredProperties.map((prop) => (
                    <PropertyCardItem key={prop.id} prop={prop} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} variant="mini" />
                ))}
            </div>
        </div>
    )
}