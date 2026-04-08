"use client"

import { useState, useMemo, Dispatch, SetStateAction } from "react"
import { MapPin } from "lucide-react"
import { BrutalButton } from "@/components/ui/forms/button"
import { BrutalCard, BrutalShard } from "@/components/ui/data-display/card"
import { cn } from "@/lib/utils"
import { PropertyCreateForm, PropertyEditForm } from "./property-form"
import { OwnProperty } from "./property-view"
import { PropertyCardItem } from "./components/property-card-item"
import { PropertyFilterBar } from "./components/property-filter-bar"
import { motion, AnimatePresence } from "framer-motion"
import { staggerContainer, staggerItem, shimmerX, fadeUpEnter } from "@/features/bookings/motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/forms/button"

// ─── Types ────────────────────────────────────────────────────────────────────

type PropertyListVariant = "CARDS" | "BARS"

type PropertyStatus = OwnProperty["status"]

type Filters = {
    queryNome: string
    queryLocal: string
    available: boolean
    booked: boolean
    maintenance: boolean
    minPrice: number | ""
    maxPrice: number | ""
    sortPrice: "sem filtro" | "crescente" | "decrescente"
}

type PropertyListProps = {
    variant?: PropertyListVariant
    filter?: boolean
    addNewProperty?: boolean
    propertys: OwnProperty[]
    onSelect?: (id: string) => void
    onDelete?: (id: string) => void | Promise<void>
    onSaved?: () => void | Promise<void>
    isLoading?: boolean
    isExiting?: boolean
    animate?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLES = {
    pageContainer: "flex flex-col min-h-screen",
    loadingText: "font-mono text-xs uppercase opacity-70",
} as const

const STATUS_COLORS: Record<PropertyStatus, { bg: string; text: string }> = {
    AVAILABLE:   { bg: "bg-red-300",    text: "text-red-900" },
    BOOKED:      { bg: "bg-green-300",  text: "text-green-900" },
    MAINTENANCE: { bg: "bg-yellow-300", text: "text-yellow-900" },
}

const DEFAULT_FILTERS: Filters = {
    queryNome: "",
    queryLocal: "",
    available: false,
    booked: false,
    maintenance: false,
    minPrice: "",
    maxPrice: "",
    sortPrice: "sem filtro",
}

// ─── Public Components ────────────────────────────────────────────────────────

export function PropertyList({ variant = "CARDS", ...props }: PropertyListProps) {
    switch (variant) {
        case "BARS":  return <PropertyListBars {...props} />
        case "CARDS": return <PropertyListCards {...props} />
    }
}

export function PropertyListCards({
                                      propertys,
                                      onSelect = () => {},
                                      onDelete,
                                      onSaved,
                                      isLoading = false,
                                      isExiting = true,
                                      animate = false,
                                      addNewProperty = false,
                                  }: PropertyListProps) {
    const [createFormOpen, setCreateFormOpen] = useState(false)
    const [editFormOpen, setEditFormOpen]     = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<OwnProperty>()

    const handleEdit = (property: OwnProperty) => {
        setSelectedProperty(property)
        setEditFormOpen(true)
        setCreateFormOpen(false)
    }

    const handleOpenCreate = () => {
        setCreateFormOpen(true)
        setEditFormOpen(false)
    }

    return (
        <div className={cn(
            STYLES.pageContainer,
            "space-y-6 pt-6 md:pt-10",
            animate && (isExiting ? "animate-fly-out-right flex-1" : "animate-fly-in flex-1"),
        )}>
            {selectedProperty ? (
                <PropertyEditForm
                    open={editFormOpen}
                    onClose={() => setEditFormOpen(false)}
                    propertyState={[selectedProperty, setSelectedProperty as Dispatch<SetStateAction<OwnProperty>>]}
                    onSaved={onSaved}
                />
            ) : (
                <AddNewPropertyForm open={createFormOpen} onClose={() => setCreateFormOpen(false)} onSaved={onSaved} />
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                        Minhas
                        <span className="block italic text-primary">Propriedades</span>
                    </h1>
                </div>
                {addNewProperty && (
                    <AddPropertyButton onClick={handleOpenCreate} />
                )}
            </div>

            <ColumnHeaders />

            <div className="relative border-t-2 border-foreground/10 pt-6 flex-1">
                {isLoading ? (
                    <LoadingIndicator />
                ) : (
                    <motion.div 
                        variants={staggerContainer} 
                        initial="initial" 
                        animate="animate" 
                        exit="exit"
                        className="flex flex-col gap-6"
                    >
                        {propertys.map((prop) => (
                            <motion.div key={prop.id} variants={staggerItem}>
                                <PropertyCardItem
                                    prop={prop}
                                    onSelect={onSelect}
                                    onEdit={handleEdit}
                                    onDelete={onDelete}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export function PropertyListBars({
                                     propertys,
                                     onSelect = () => {},
                                     onDelete,
                                     onSaved,
                                     isLoading = false,
                                     isExiting = true,
                                     animate = false,
                                     addNewProperty = false,
                                 }: PropertyListProps) {
    const [createFormOpen, setCreateFormOpen] = useState(false)
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

    const updateFilter = (key: string, value: unknown) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const filteredProperties = useFilteredProperties(propertys, filters)

    return (
        <div className={cn("flex flex-col", animate && (isExiting ? "animate-fly-out-right" : "animate-fly-in"))}>
            <PropertyFilterBar filters={filters} setFilter={updateFilter} />

            {addNewProperty && (
                <>
                    <AddNewPropertyForm open={createFormOpen} onClose={() => setCreateFormOpen(false)} onSaved={onSaved} />
                    <AddPropertyButton onClick={() => setCreateFormOpen(true)} />
                </>
            )}

            {isLoading && <LoadingIndicator />}

            {filteredProperties.map((prop) => (
                <PropertyBarItem key={prop.id} prop={prop} onSelect={onSelect} onDelete={onDelete} />
            ))}
        </div>
    )
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useFilteredProperties(propertys: OwnProperty[], filters: Filters): OwnProperty[] {
    return useMemo(() => {
        const hasStatusFilter = filters.available || filters.booked || filters.maintenance

        return propertys
            .filter((p) => {
                if (hasStatusFilter) {
                    const matchesStatus =
                        (filters.available && p.status === "AVAILABLE") ||
                        (filters.booked && p.status === "BOOKED") ||
                        (filters.maintenance && p.status === "MAINTENANCE")
                    if (!matchesStatus) return false
                }

                const lowerTitle    = p.title.toLocaleLowerCase()
                const lowerLocation = p.location.toLocaleLowerCase()

                if (filters.queryNome  && !lowerTitle.includes(filters.queryNome.toLocaleLowerCase()))    return false
                if (filters.queryLocal && !lowerLocation.includes(filters.queryLocal.toLocaleLowerCase())) return false
                if (filters.minPrice !== "" && p.price < filters.minPrice) return false
                if (filters.maxPrice !== "" && p.price > filters.maxPrice) return false

                return true
            })
            .sort((a, b) => {
                if (filters.sortPrice === "crescente")  return a.price - b.price
                if (filters.sortPrice === "decrescente") return b.price - a.price
                return 0
            })
    }, [propertys, filters])
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AddNewPropertyForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void | Promise<void> }) {
    return <PropertyCreateForm onClose={onClose} open={open} onSaved={onSaved} />
}

function AddPropertyButton({ onClick }: { onClick: () => void }) {
    return (
        <Button 
            variant="brutal" 
            onClick={onClick} 
            className="group w-full md:w-auto h-12 md:h-14 font-mono font-black uppercase text-xs md:text-sm tracking-widest gap-2 bg-orange-400 text-black border-2 border-foreground shadow-[4px_4px_0_0_rgb(0,0,0)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgb(0,0,0)] px-6"
        >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" strokeWidth={3} />
            Nova Propriedade
        </Button>
    )
}

function ColumnHeaders() {
    return (
        <div className="hidden md:flex gap-0 items-center px-4 py-2 opacity-60">
            <p className="font-mono text-[10px] uppercase font-black tracking-widest w-[20%] xl:w-[240px]">Preview</p>
            <p className="font-mono text-[10px] uppercase font-black tracking-widest flex-1">Detalhes & Info</p>
            <p className="font-mono text-[10px] uppercase font-black tracking-widest w-48 text-right pr-4">Gestão</p>
        </div>
    )
}

function LoadingIndicator() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-6"
        >
            {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                    key={i}
                    variants={staggerItem}
                    className="h-48 rounded-2xl border-4 border-foreground/20 bg-muted/30 overflow-hidden shadow-[3px_3px_0_0_rgb(0,0,0,0.06)] flex"
                >
                    <div className="w-48 bg-muted/50 relative overflow-hidden shrink-0 border-r-4 border-foreground/20">
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent" {...shimmerX(i * 0.08)} />
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                        <div className="h-4 rounded-full bg-muted/70 w-3/4 overflow-hidden relative">
                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent" {...shimmerX(i * 0.08 + 0.1)} />
                        </div>
                        <div className="h-3 rounded-full bg-muted/50 w-1/2 overflow-hidden relative">
                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent" {...shimmerX(i * 0.08 + 0.18)} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    )
}

function PropertyBarItem({
                             prop,
                             onSelect,
                             onDelete,
                         }: {
    prop: OwnProperty
    onSelect: (id: string) => void
    onDelete?: (id: string) => void | Promise<void>
}) {
    const { bg, text } = STATUS_COLORS[prop.status]

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect(prop.id)
        }
    }

    return (
        <div
            role="button"
            tabIndex={0}
            className="flex flex-col w-full gap-2 px-3 py-3 text-left border-b hover:bg-sidebar-accent transition-colors cursor-pointer"
            onClick={() => onSelect(prop.id)}
            onKeyDown={handleKeyDown}
        >
            <div className="flex w-full items-start justify-between">
                <span className="font-medium">{prop.title}</span>
                <div className={cn("px-2", bg)}>
                    <span className={cn("font-medium", text)}>{prop.status}</span>
                </div>
            </div>

            <div>
                <div className="flex items-center">
                    <MapPin size={14} className="shrink-0" />
                    <span className="font-light">{prop.location}</span>
                </div>
                <div>
                    <span className="font-medium text-sm">{prop.price}€</span>
                    <span className="text-xs font-light"> /dia</span>
                </div>
            </div>

            {onDelete && (
                <div className="flex justify-end">
                    <BrutalButton
                        className="bg-destructive text-xs"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); void onDelete(prop.id) }}
                    >
                        Delete
                    </BrutalButton>
                </div>
            )}
        </div>
    )
}