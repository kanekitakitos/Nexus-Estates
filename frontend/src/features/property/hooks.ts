/**
 * Property Feature Hooks
 * 
 * Este ficheiro centraliza toda a lógica de estado e efeitos para a funcionalidade de propriedades.
 * Inclui gestão de coleção, filtragem client-side, catálogo de comodidades e orquestração do wizard.
 */

import { useState, useMemo, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { OwnProperty, Filters, WizardStep } from "@/types"
import { PropertyService } from "@/services/property.service"
import { AmenityService, Amenity } from "@/services/amenity.service"
import type { CreatePropertyRequest } from "@/types/property"
import { mapPropertyRecordToOwnProperty, resolveTranslation } from "./property-utils"

// ─── Constantes & Utilitários de Normalização ───────────────────────────────

/**
 * DEFAULT_FILTERS
 * Estado inicial para o sistema de filtragem de inventário.
 */
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

// ─── Hook: usePropertyManager ────────────────────────────────────────────────

/**
 * usePropertyManager
 * 
 * Gere a coleção completa de propriedades do utilizador authenticado.
 * 
 * @param selectedPropertyId - ID da propriedade selecionada (vindo do contexto de vista)
 * @returns {
 *   properties: OwnProperty[], // Lista de todos os ativos do utilizador
 *   selectedProperty: OwnProperty | null, // Detalhe do ativo focado
 *   isLoading: boolean, // Estado de carregamento da API
 *   refresh: () => Promise<void>, // Sincroniza a lista com o servidor
 *   deleteProperty: (id: string) => Promise<void> // Remove um ativo permanentemente
 * }
 */
export function usePropertyManager(selectedPropertyId: string | null) {
    const [properties, setProperties] = useState<OwnProperty[]>([])
    const [selectedProperty, setSelectedProperty] = useState<OwnProperty | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const refresh = useCallback(async () => {
        setIsLoading(true)
        try {
            const page = await PropertyService.listMine({ page: 0, size: 200, sort: "name,asc" })
            setProperties(page.content.map((p) => mapPropertyRecordToOwnProperty(p as unknown as Record<string, unknown>)))
        } catch (err) { console.error(err) } finally { setIsLoading(false) }
    }, [])

    const loadDetail = useCallback((id: string) => {
        PropertyService.getPropertyById(id)
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
            try { await PropertyService.deleteProperty(Number(id)); await refresh() } catch { toast.error("Erro ao eliminar") }
        }
    }
}

// ─── Hook: usePropertyFilters ────────────────────────────────────────────────

/**
 * usePropertyFilters
 * 
 * Implementa lógica de filtragem síncrona (client-side) para uma lista de ativos.
 * 
 * @param properties - Array de propriedades a filtrar
 * @returns {
 *   filters: Filters, // Estado atual dos filtros
 *   updateFilter: (key: string, value: any) => void, // Atualiza um critério de filtragem
 *   filteredProperties: OwnProperty[] // Lista resultante após filtros e ordenação
 * }
 */
export function usePropertyFilters(properties: OwnProperty[]) {
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
    
    const filteredProperties = useMemo(() => {
        const hasStatusFilter = filters.available || filters.booked || filters.maintenance
        return properties.filter((p) => {
            if (hasStatusFilter) {
                const matchesStatus = (filters.available && p.status === "AVAILABLE") || (filters.booked && p.status === "BOOKED") || (filters.maintenance && p.status === "MAINTENANCE")
                if (!matchesStatus) return false
            }
            const lowerTitle = (typeof p.title === 'string' ? p.title : p.title?.pt || "").toLowerCase()
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

// ─── Hook: useAmenityCatalog ──────────────────────────────────────────────────

/**
 * useAmenityCatalog
 * 
 * Disponibiliza o catálogo global de comodidades registadas no sistema Nexus.
 * 
 * @returns {
 *   amenities: Amenity[], // Lista de comodidades disponíveis
 *   isLoading: boolean // Estado de carregamento
 * }
 */
export function useAmenityCatalog() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    AmenityService.listAll().then(setAmenities).catch(() => toast.error("Erro ao carregar catálogo")).finally(() => setIsLoading(false))
  }, [])

  const getAmenityLabel = useCallback(
    (id: number) => resolveTranslation(amenities.find((a) => a.id === id)?.name) || `SVC_${id}`,
    [amenities]
  )

  return { amenities, isLoading, getAmenityLabel }
}

// ─── Hook: usePropertyForm ───────────────────────────────────────────────────

/**
 * usePropertyForm
 * 
 * Orquestra o estado do formulário wizard para criação ou edição de ativos.
 * Gere o estado 'draft' em memória e sincroniza com o backend no passo final.
 * 
 * @param initialData - Dados iniciais do ativo (null para novos ativos)
 * @param onSaved - Callback executado após persistência bem sucedida
 */
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
        nextStep: () => { const idx = STEPS.indexOf(step); if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]) },
        prevStep: () => { const idx = STEPS.indexOf(step); if (idx > 0) setStep(STEPS[idx - 1]) },
        handleFinalSave: async () => {
            setIsSaving(true)
            try {
                // Normalizar campos polimórficos para string simples (requisito da API)
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
                toast.success("Operação concluída com sucesso")
                await onSaved()
            } catch (err) { 
                console.error("Save error:", err)
                toast.error("Falha na sincronização") 
            } finally { setIsSaving(false) }
        }
    }
}
