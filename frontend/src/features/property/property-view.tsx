"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"

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

// ─── Animation Variants ───────────────────────────────────────────────────────

const pageVariants = {
    initial: { opacity: 0, y: 16, filter: "blur(2px)" },
    animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
    exit: {
        opacity: 0,
        y: -10,
        filter: "blur(1px)",
        transition: { duration: 0.2, ease: "easeIn" },
    },
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function resolveTranslation(value: unknown): string {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "object") {
        const v = value as Record<string, unknown>
        return (typeof v["pt"] === "string" ? v["pt"] : "")
            || (typeof v["en"] === "string" ? v["en"] : "")
            || ""
    }
    return ""
}

function mapListItem(p: Record<string, unknown>): OwnProperty {
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
        status:      p.isActive === true || p.isActive === "true" ? "AVAILABLE" : "MAINTENANCE",
        rating:      0,
        featured:    false,
        tags:        [],
        amenityIds:  [],
    }
}

function mapDetail(p: Record<string, unknown>): OwnProperty {
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

// ─── Hook: Property Data ──────────────────────────────────────────────────────

function usePropertyData() {
    const [properties, setProperties] = useState<OwnProperty[]>([])
    const [isLoading, setIsLoading]   = useState(false)

    const refresh = useCallback(async () => {
        const userId = getStoredUserId()
        if (!userId) { setProperties([]); return }

        setIsLoading(true)
        try {
            const page = await PropertyService.listByUser({ userId, page: 0, size: 200, sort: "name,asc" })
            setProperties(page.content.map(mapListItem))
        } catch (err) {
            toast.warning("Erro ao carregar propriedades. Vê a consola.")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { refresh() }, [refresh])

    return { properties, isLoading, refresh }
}

// ─── Hook: Property Selection ─────────────────────────────────────────────────

function usePropertySelection(selectedPropertyId: string | null) {
    const [selectedProperty, setSelectedProperty] = useState<OwnProperty | null>(null)

    const select = useCallback((id: string) => {
        PropertyService.getPropertyById(id)
            .then((p) => {
                setSelectedProperty(mapDetail(p))
                window.scrollTo(0, 0)
            })
            .catch((err) => {
                toast.warning("Erro ao obter detalhes da propriedade. Vê a consola.")
                console.error(err)
            })
    }, [])

    const clear = useCallback(() => setSelectedProperty(null), [])

    // Sync with external selectedPropertyId
    useEffect(() => {
        if (selectedPropertyId == null) {
            clear()
        } else if (selectedPropertyId !== selectedProperty?.id) {
            select(selectedPropertyId)
        }
    }, [selectedPropertyId, selectedProperty?.id, select, clear])

    return { selectedProperty, select, clear, setSelectedProperty }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PropertyView() {
    const { selectedPropertyId, selectPropertyId } = useView()

    const { properties, isLoading, refresh }                   = usePropertyData()
    const { selectedProperty, clear: clearSelection }          = usePropertySelection(selectedPropertyId)

    const handleDelete = useCallback(async (id: string) => {
        const userId = getStoredUserId()
        try {
            await PropertyService.deleteProperty(Number(id), userId ?? undefined)
            if (selectedProperty?.id === id) selectPropertyId(null)
            await refresh()
        } catch (err) {
            toast.warning("Erro ao eliminar propriedade. Vê a consola.")
            console.error(err)
        }
    }, [refresh, selectPropertyId, selectedProperty?.id])

    const handleDetailSaved = useCallback(async () => {
        await refresh()
        if (selectedProperty) {
            PropertyService.getPropertyById(selectedProperty.id).catch(() => null)
        }
    }, [refresh, selectedProperty])

    return (
        <AnimatePresence mode="wait">
            {selectedProperty ? (
                <motion.div
                    key="detail"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full"
                >
                    <PropertyEdit
                        property={selectedProperty}
                        onBack={() => selectPropertyId(null)}
                        onSaved={handleDetailSaved}
                    />
                </motion.div>
            ) : (
                <motion.div
                    key="list"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full"
                >
                    <PropertyList
                        variant="CARDS"
                        propertys={properties}
                        onSelect={(id) => selectPropertyId(id)}
                        animate={false}
                        addNewProperty
                        isLoading={isLoading}
                        onDelete={handleDelete}
                        onSaved={refresh}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}