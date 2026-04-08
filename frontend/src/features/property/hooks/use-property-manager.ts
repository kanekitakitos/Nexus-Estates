import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { OwnProperty } from "@/types"
import { PropertyService } from "@/services/property.service"

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
        tags:        Array.isArray(p.amenities) 
            ? p.amenities.map(a => typeof a === 'object' && a !== null ? (resolveTranslation(a.name) || String(a.id)) : String(a)) 
            : (Array.isArray(p.tags) ? p.tags : []),
        amenityIds:  Array.isArray(p.amenityIds) ? p.amenityIds : (Array.isArray(p.amenities) ? p.amenities.map(a => typeof a === 'object' && a !== null ? a.id : a) : []),
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
        tags: Array.isArray(p.amenities) 
            ? p.amenities.map(a => typeof a === 'object' && a !== null ? (resolveTranslation(a.name) || String(a.id)) : String(a)) 
            : (Array.isArray(p.tags) ? p.tags : []),
        amenityIds:  Array.isArray(p.amenityIds) ? p.amenityIds : (Array.isArray(p.amenities) ? p.amenities.map(a => typeof a === 'object' && a !== null ? a.id : a) : []),
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePropertyManager(selectedPropertyId: string | null) {
    const [properties, setProperties] = useState<OwnProperty[]>([])
    const [selectedProperty, setSelectedProperty] = useState<OwnProperty | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const refresh = useCallback(async () => {
        const userId = localStorage.getItem("userId")
        if (!userId) { setProperties([]); return }

        setIsLoading(true)
        try {
            const page = await PropertyService.listByUser({ userId: Number(userId), page: 0, size: 200, sort: "name,asc" })
            setProperties(page.content.map(mapListItem))
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const loadDetail = useCallback((id: string) => {
        PropertyService.getPropertyById(id)
            .then((p) => setSelectedProperty(mapDetail(p)))
            .catch(console.error)
    }, [])

    const deleteProperty = useCallback(async (id: string) => {
        const userId = localStorage.getItem("userId")
        try {
            await PropertyService.deleteProperty(Number(id), userId ? Number(userId) : undefined)
            await refresh()
        } catch (err) {
            toast.error("Erro ao eliminar")
        }
    }, [refresh])

    useEffect(() => { refresh() }, [refresh])

    useEffect(() => {
        if (selectedPropertyId) loadDetail(selectedPropertyId)
        else setSelectedProperty(null)
    }, [selectedPropertyId, loadDetail])

    return {
        properties,
        selectedProperty,
        isLoading,
        refresh,
        deleteProperty
    }
}
