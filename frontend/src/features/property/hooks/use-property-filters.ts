import { useState, useMemo } from "react"
import { OwnProperty, Filters } from "@/types"

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

export function usePropertyFilters(propertys: OwnProperty[]) {
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

    const updateFilter = (key: string, value: unknown) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const filteredProperties = useMemo(() => {
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

                const title = typeof p.title === 'string' ? p.title : p.title?.pt || ""
                const lowerTitle    = title.toLocaleLowerCase()
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

    return {
        filters,
        setFilters,
        updateFilter,
        filteredProperties
    }
}
