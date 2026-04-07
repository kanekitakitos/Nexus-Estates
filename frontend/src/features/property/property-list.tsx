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
            "space-y-6 p-4 md:p-6",
            animate && (isExiting ? "animate-fly-out-right" : "animate-fly-in"),
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

            <ColumnHeaders />

            {addNewProperty && (
                <AddPropertyButton onClick={handleOpenCreate} />
            )}

            {isLoading && <LoadingIndicator />}

            {propertys.map((prop) => (
                <PropertyCardItem
                    key={prop.id}
                    prop={prop}
                    onSelect={onSelect}
                    onEdit={handleEdit}
                    onDelete={onDelete}
                />
            ))}
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
        <BrutalCard className="gap-2">
            <BrutalButton onClick={onClick} className="w-full">
                + ADD NEW PROPERTY
            </BrutalButton>
        </BrutalCard>
    )
}

function ColumnHeaders() {
    return (
        <BrutalShard className="flex gap-0 group items-stretch p-1">
            <p className="w-2/5 uppercase font-bold">TITLE</p>
            <p className="w-2/5 uppercase font-bold">LOCATION</p>
            <p className="w-1/5 uppercase font-bold" />
        </BrutalShard>
    )
}

function LoadingIndicator() {
    return (
        <BrutalCard className="p-4">
            <p className={STYLES.loadingText}>A carregar propriedades...</p>
        </BrutalCard>
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