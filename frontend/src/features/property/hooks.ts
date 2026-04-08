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

/**
 * resolveTranslation
 * 
 * Normaliza valores de tradução provenientes da API que podem ser strings puras 
 * ou objetos com chaves 'pt'/'en'.
 * 
 * @param value - Valor a ser traduzido (string ou object)
 * @returns String traduzida (prioridade PT)
 */
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

/**
 * mapListItem
 * 
 * Converte o payload bruto do Backend (DTO) para o modelo de domínio do Frontend (OwnProperty).
 * Gere discrepâncias de nomes de campos (ex: image_url vs imageUrl) e normaliza tipos.
 * 
 * @param p - Objeto bruto da API
 * @returns Objeto OwnProperty tipado e sanitizado
 */
function mapListItem(p: Record<string, unknown>): OwnProperty {
    const city = String(p.city ?? "")
    return {
        id: String(p.id ?? ""),
        title: String(p.name ?? ""),
        description: resolveTranslation(p.description),
        location: String(p.location ?? city),
        city,
        address: String(p.address ?? ""),
        maxGuests: Number(p.maxGuests ?? 1),
        price: Number(p.basePrice ?? 0),
        imageUrl: String(p.imageUrl ?? p.image_url ?? ""),
        status: p.isActive === true || p.isActive === "true" ? "AVAILABLE" : "MAINTENANCE",
        rating: 0,
        tags: Array.isArray(p.amenities) ? p.amenities.map(a => typeof a === 'object' && a !== null ? resolveTranslation(a.name) : String(a)) : [],
        amenityIds: Array.isArray(p.amenityIds) ? p.amenityIds : (Array.isArray(p.amenities) ? p.amenities.map(a => typeof a === 'object' && a !== null ? a.id : a) : []),
    }
}

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
        const userId = localStorage.getItem("userId")
        if (!userId) { setProperties([]); return }
        setIsLoading(true)
        try {
            const page = await PropertyService.listByUser({ userId: Number(userId), page: 0, size: 200, sort: "name,asc" })
            setProperties(page.content.map(mapListItem))
        } catch (err) { console.error(err) } finally { setIsLoading(false) }
    }, [])

    const loadDetail = useCallback((id: string) => {
        PropertyService.getPropertyById(id).then(p => setSelectedProperty(mapListItem(p))).catch(console.error)
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
            try { await PropertyService.deleteProperty(Number(id)); await refresh() } catch (err) { toast.error("Erro ao eliminar") }
        }
    }
}

// ─── Hook: usePropertyFilters ────────────────────────────────────────────────

/**
 * usePropertyFilters
 * 
 * Implementa lógica de filtragem síncrona (client-side) para uma lista de ativos.
 * 
 * @param propertys - Array de propriedades a filtrar
 * @returns {
 *   filters: Filters, // Estado atual dos filtros
 *   updateFilter: (key: string, value: any) => void, // Atualiza um critério de filtragem
 *   filteredProperties: OwnProperty[] // Lista resultante após filtros e ordenação
 * }
 */
export function usePropertyFilters(propertys: OwnProperty[]) {
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
    
    const filteredProperties = useMemo(() => {
        const hasStatusFilter = filters.available || filters.booked || filters.maintenance
        return propertys.filter((p) => {
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
    }, [propertys, filters])

    return { 
        filters, 
        updateFilter: (k: string, v: any) => setFilters(prev => ({ ...prev, [k]: v })), 
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
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    setIsLoading(true)
    AmenityService.listAll().then(setAmenities).catch(() => toast.error("Erro ao carregar catálogo")).finally(() => setIsLoading(false))
  }, [])
  return { amenities, isLoading }
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
        updateField: (f: keyof OwnProperty, v: any) => setProperty(prev => ({ ...prev, [f]: v })),
        nextStep: () => { const idx = STEPS.indexOf(step); if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]) },
        prevStep: () => { const idx = STEPS.indexOf(step); if (idx > 0) setStep(STEPS[idx - 1]) },
        handleFinalSave: async () => {
            setIsSaving(true)
            try {
                const userId = localStorage.getItem("userId")
                const payload: any = { ...property, ownerId: userId ? Number(userId) : undefined, isActive: property.status === "AVAILABLE" }
                if (initialData) await PropertyService.updateProperty(Number(property.id), payload)
                else await PropertyService.createProperty(payload)
                toast.success("Operação concluída com sucesso")
                await onSaved()
            } catch (err) { toast.error("Falha na sincronização") } finally { setIsSaving(false) }
        }
    }
}
