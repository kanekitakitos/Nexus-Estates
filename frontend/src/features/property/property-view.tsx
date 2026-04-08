"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { PropertyEdit } from "./property-edit"
import { PropertyList } from "./property-list"
import { useView } from "@/features/view-context"
import { PropertyService } from "@/services/property.service"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OwnProperty {
    id: string
    title: string
    description: string
    location: string
    city: string
    address: string
    maxGuests: number
    price: number
    imageUrl: string
    status: "AVAILABLE" | "BOOKED" | "MAINTENANCE"
    rating?: number
    featured?: boolean
    tags?: string[]
    amenityIds?: number[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ANIMATION_DURATION_MS = 800
const VIEW_CONTAINER_CLASS = "relative"

// ─── Mappers ──────────────────────────────────────────────────────────────────

function resolveTranslation(value: unknown): string {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "object") {
        const v = value as Record<string, unknown>
        return (typeof v["pt"] === "string" ? v["pt"] : "") ||
            (typeof v["en"] === "string" ? v["en"] : "") || ""
    }
    return ""
}

function resolveBoolean(value: unknown): boolean {
    return value === true || value === "true"
}

function mapListItemToProperty(p: Record<string, unknown>): OwnProperty {
    const city     = String(p.city ?? "")
    const location = String(p.location ?? city)

    return {
        id:          String(p.id ?? ""),
        title:       String(p.name ?? ""),
        description: resolveTranslation(p.description),
        location,
        city,
        address:     String(p.address ?? ""),
        maxGuests:   Number(p.maxGuests ?? 1),
        price:       Number(p.basePrice ?? 0),
        imageUrl:    String(p.imageUrl ?? p.image_url ?? ""),
        status:      resolveBoolean(p.isActive) ? "AVAILABLE" : "MAINTENANCE",
        rating:      0,
        featured:    false,
        tags:        [],
        amenityIds:  [],
    }
}

function mapDetailToProperty(p: Record<string, unknown>): OwnProperty {
    return {
        id:          String(p.id),
        title:       resolveTranslation(p.name) || String(p.title ?? ""),
        description: resolveTranslation(p.description),
        location:    String(p.location ?? ""),
        city:        String(p.city ?? ""),
        address:     String(p.address ?? ""),
        maxGuests:   Number(p.maxGuests ?? 1),
        price:       Number(p.basePrice ?? p.base_price ?? p.pricePerNight ?? p.price_per_night ?? 0),
        imageUrl:    String(p.imageUrl ?? p.image_url ?? ""),
        status:      p.isActive ? "AVAILABLE" : "MAINTENANCE",
        rating:      Number(p.rating ?? 0),
        featured:    Boolean(p.featured ?? false),
        tags:        Array.isArray(p.amenities) ? p.amenities : (Array.isArray(p.tags) ? p.tags : []),
        amenityIds:  Array.isArray(p.amenityIds) ? p.amenityIds : [],
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredUserId(): number | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("userId")
    return raw ? Number(raw) : null
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PropertyView() {
    const { selectedPropertyId, selectPropertyId } = useView()

    const [properties, setProperties]           = useState<OwnProperty[]>([])
    const [selectedProperty, setSelectedProperty] = useState<OwnProperty | null>(null)
    const [isLoading, setIsLoading]             = useState(false)
    const [isLeaving, setIsLeaving]             = useState(false)
    const [isReturning, setIsReturning]         = useState(false)

    // ── Data fetching ──

    const refreshProperties = useCallback(async () => {
        const userId = getStoredUserId()
        if (!userId) { setProperties([]); return }

        try {
            setIsLoading(true)
            const page = await PropertyService.listByUser({ userId, page: 0, size: 200, sort: "name,asc" })
            setProperties(page.content.map(mapListItemToProperty))
        } catch (err) {
            toast.warning("Erro ao carregar propriedades. Vê a consola.")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { refreshProperties() }, [refreshProperties])

    // ── Navigation ──

    const handleSelectProperty = useCallback((id: string) => {
        setIsLeaving(true)

        PropertyService.getPropertyById(id)
            .then(async (p) => {
                await delay(ANIMATION_DURATION_MS)
                setSelectedProperty(mapDetailToProperty(p))
                setIsLeaving(false)
                setIsReturning(false)
                window.scrollTo(0, 0)
            })
            .catch((err) => {
                setIsLeaving(false)
                toast.warning("Erro ao obter detalhes da propriedade. Vê a consola.")
                console.error(err)
            })
    }, [])

    const handleBack = useCallback(async () => {
        setIsReturning(true)
        await delay(ANIMATION_DURATION_MS)
        setSelectedProperty(null)
        await delay(1000)
        setIsReturning(false)
    }, [])

    const handleDelete = useCallback(async (id: string) => {
        const userId = getStoredUserId()

        try {
            await PropertyService.deleteProperty(Number(id), userId ?? undefined)
            if (selectedProperty?.id === id) {
                selectPropertyId(null)
                setSelectedProperty(null)
            }
            await refreshProperties()
        } catch (err) {
            toast.warning("Erro ao eliminar propriedade. Vê a consola.")
            console.error(err)
        }
    }, [refreshProperties, selectPropertyId, selectedProperty?.id])

    // ── Sync selectedPropertyId with local state ──

    useEffect(() => {
        if (selectedPropertyId == null) {
            handleBack()
        } else if (selectedPropertyId !== selectedProperty?.id) {
            handleSelectProperty(selectedPropertyId)
        }
    }, [selectedPropertyId, selectedProperty?.id, handleBack, handleSelectProperty])

    // ── Render ──

    if (selectedProperty) {
        return (
            <PropertyDetailView
                property={selectedProperty}
                isReturning={isReturning}
                onBack={() => selectPropertyId(null)}
                onSaved={async () => {
                    await refreshProperties()
                    handleSelectProperty(selectedProperty.id)
                }}
            />
        )
    }

    return (
        <PropertyListView
            properties={properties}
            isLoading={isLoading}
            isLeaving={isLeaving}
            onSelect={(id) => selectPropertyId(id)}
            onDelete={handleDelete}
            onSaved={refreshProperties}
        />
    )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PropertyDetailView({
                                property,
                                isReturning,
                                onBack,
                                onSaved,
                            }: {
    property: OwnProperty
    isReturning: boolean
    onBack: () => void
    onSaved: () => Promise<void>
}) {
    return (
        <div className={VIEW_CONTAINER_CLASS}>
            <PropertyEdit
                property={property}
                onBack={onBack}
                isExiting={isReturning}
                onSaved={onSaved}
            />
        </div>
    )
}

function PropertyListView({
                              properties,
                              isLoading,
                              isLeaving,
                              onSelect,
                              onDelete,
                              onSaved,
                          }: {
    properties: OwnProperty[]
    isLoading: boolean
    isLeaving: boolean
    onSelect: (id: string) => void
    onDelete: (id: string) => Promise<void>
    onSaved: () => Promise<void>
}) {
    return (
        <div className={VIEW_CONTAINER_CLASS}>
            <PropertyList
                variant="CARDS"
                propertys={properties}
                onSelect={onSelect}
                isExiting={isLeaving}
                animate={true}
                addNewProperty={true}
                isLoading={isLoading}
                onDelete={onDelete}
                onSaved={onSaved}
            />
        </div>
    )
}