"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { notify } from "@/lib/notify"
import { OwnProperty, Filters, WizardStep } from "@/types"
import { PropertyService } from "@/services/property.service"
import { AmenityService, Amenity } from "@/services/amenity.service"
import type { CreatePropertyRequest } from "@/types/property"
import { propertyCopy } from "../lib/property-tokens"
import { mapPropertyRecordToOwnProperty, resolveTranslation } from "../lib/property-utils"

export const DEFAULT_FILTERS: Filters = {
  queryNome: "",
  queryLocal: "",
  available: false,
  booked: false,
  maintenance: false,
  minPrice: "",
  maxPrice: "",
  sortPrice: "sem filtro",
}

export { resolveTranslation }

export function usePropertyManager(selectedPropertyId: string | null) {
  const [properties, setProperties] = useState<OwnProperty[]>([])
  const [selectedProperty, setSelectedProperty] = useState<OwnProperty | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const page = await PropertyService.listMine({ page: 0, size: 200, sort: "name,asc" })
      setProperties(page.content.map((p) => mapPropertyRecordToOwnProperty(p as unknown as Record<string, unknown>)))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadDetail = useCallback((id: string) => {
    PropertyService.getExpanded(Number(id))
      .then((p) => setSelectedProperty(mapPropertyRecordToOwnProperty(p as unknown as Record<string, unknown>)))
      .catch(console.error)
  }, [])

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
    deleteProperty: async (id: string) => {
      try {
        await PropertyService.deleteProperty(Number(id))
        await refresh()
      } catch {
        notify.error(propertyCopy.manager.deleteError)
      }
    }
  }
}

export function usePropertyFilters(properties: OwnProperty[]) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const filteredProperties = useMemo(() => {
    const hasStatusFilter = filters.available || filters.booked || filters.maintenance
    return properties.filter((p) => {
      if (hasStatusFilter) {
        const matchesStatus = (filters.available && p.status === "AVAILABLE") || (filters.booked && p.status === "BOOKED") || (filters.maintenance && p.status === "MAINTENANCE")
        if (!matchesStatus) return false
      }
      const lowerTitle = (typeof p.title === "string" ? p.title : p.title?.pt || "").toLowerCase()
      if (filters.queryNome && !lowerTitle.includes(filters.queryNome.toLowerCase())) return false
      if (filters.queryLocal && !p.location.toLowerCase().includes(filters.queryLocal.toLowerCase())) return false
      if (filters.minPrice !== "" && p.price < filters.minPrice) return false
      if (filters.maxPrice !== "" && p.price > filters.maxPrice) return false
      return true
    }).sort((a, b) => {
      if (filters.sortPrice === "crescente") return a.price - b.price
      if (filters.sortPrice === "decrescente") return b.price - a.price
      return 0
    })
  }, [properties, filters])

  return {
    filters,
    updateFilter: <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters(prev => ({ ...prev, [k]: v })),
    filteredProperties
  }
}

export function useAmenityCatalog() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    AmenityService.listAll()
      .then(setAmenities)
      .catch(() => notify.error(propertyCopy.amenities.loadCatalogError))
      .finally(() => setIsLoading(false))
  }, [])

  const getAmenityLabel = useCallback(
    (id: number) => resolveTranslation(amenities.find((a) => a.id === id)?.name) || `SVC_${id}`,
    [amenities]
  )

  return { amenities, isLoading, getAmenityLabel }
}

export function usePropertyForm(initialData: OwnProperty | null, onSaved: () => void | Promise<void>) {
  const [property, setProperty] = useState<OwnProperty>(initialData || { id: "", title: "", description: "", location: "", city: "", address: "", maxGuests: 1, price: 0, status: "AVAILABLE", rating: 0, tags: [], amenityIds: [], imageUrl: "" })
  const [step, setStep] = useState<WizardStep>('essence')
  const [isSaving, setIsSaving] = useState(false)

  const STEPS: WizardStep[] = ['essence', 'location', 'amenities', 'permissions', 'preview']

  return {
    property,
    step,
    isSaving,
    isEdit: !!initialData,
    updateField: <K extends keyof OwnProperty>(f: K, v: OwnProperty[K]) => setProperty(prev => ({ ...prev, [f]: v })),
    goToStep: (next: WizardStep) => {
      if (STEPS.includes(next)) setStep(next)
    },
    nextStep: () => { const idx = STEPS.indexOf(step); if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]) },
    prevStep: () => { const idx = STEPS.indexOf(step); if (idx > 0) setStep(STEPS[idx - 1]) },
    handleFinalSave: async () => {
      setIsSaving(true)
      try {
        const titleStr = typeof property.title === "string" ? property.title : (property.title?.pt || property.title?.en || "")
        const descStr = typeof property.description === "string" ? property.description : (property.description?.pt || property.description?.en || "")
        const description: Record<string, string> = typeof property.description === "string"
          ? { pt: descStr }
          : (property.description as unknown as Record<string, string>)

        const payload = {
          title: titleStr,
          description,
          location: property.location,
          city: property.city,
          address: property.address,
          maxGuests: property.maxGuests,
          imageUrl: property.imageUrl || undefined,
          amenityIds: property.amenityIds
        }
        if (initialData) {
          await PropertyService.updateProperty(Number(property.id), {
            title: payload.title,
            description: payload.description,
            location: payload.location,
            city: payload.city,
            address: payload.address,
            basePrice: property.price,
            maxGuests: payload.maxGuests,
            isActive: property.status === "AVAILABLE",
            imageUrl: payload.imageUrl,
            amenityIds: payload.amenityIds,
          })
        } else {
          await PropertyService.createProperty({
            title: payload.title,
            description: payload.description,
            price: property.price,
            location: payload.location,
            city: payload.city,
            address: payload.address,
            maxGuests: payload.maxGuests,
            amenityIds: payload.amenityIds,
            imageUrl: payload.imageUrl,
          } as CreatePropertyRequest)
        }
        notify.success(propertyCopy.form.saveOk)
        await onSaved()
      } catch (err) {
        console.error("Save error:", err)
        notify.error(propertyCopy.form.syncFail)
      } finally {
        setIsSaving(false)
      }
    }
  }
}
