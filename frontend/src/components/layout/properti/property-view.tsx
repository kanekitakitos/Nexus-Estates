"use client"

import { useCallback, useEffect, useState } from "react"
import { PropertyEdit2 } from "./property-edit2"
import { PropertyList } from "./property-list"
import {useView} from "@/features/view-context";
import {PropertyService} from "@/services/property.service";
import {toast} from "sonner";


const VIEW_CONTAINER_STYLES = "relative"


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
}

function resolveTranslation(value: unknown): string {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "object") {
        const v = value as Record<string, unknown>
        const pt = typeof v["pt"] === "string" ? (v["pt"] as string) : ""
        const en = typeof v["en"] === "string" ? (v["en"] as string) : ""
        return pt || en || ""
    }
    return ""
}

function resolveBoolean(value: unknown): boolean {
    return value === true || value === "true"
}

export function PropertyView(){
    const { selectedPropertyId, selectPropertyId } = useView()
    const [selectedProperty, setSelectedProperty] = useState<OwnProperty | null>(null)
    const [properties, setProperties] = useState<OwnProperty[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const [isLeaving, setIsLeaving] = useState(false)
    const [isReturning, setIsReturning] = useState(false)

    const refreshProperties = useCallback(async () => {
        try {
            if (typeof window === "undefined") return
            const userIdRaw = localStorage.getItem("userId")
            if (!userIdRaw) {
                setProperties([])
                return
            }

            setIsLoading(true)
            const page = await PropertyService.listByUser({ userId: Number(userIdRaw), page: 0, size: 200, sort: "name,asc" })
            const mapped: OwnProperty[] = page.content.map((p) => {
                const city = String(p.city ?? "")
                const location = String(p.location ?? city)
                const address = String(p.address ?? "")
                const maxGuests = Number(p.maxGuests ?? 1)
                const description = resolveTranslation(p.description)
                return {
                    id: String(p.id ?? ""),
                    title: String(p.name ?? ""),
                    description,
                    location,
                    city,
                    address,
                    maxGuests,
                    price: Number(p.basePrice ?? 0),
                    imageUrl: "",
                    status: resolveBoolean(p.isActive) ? "AVAILABLE" : "MAINTENANCE",
                    rating: 0,
                    featured: false,
                    tags: [],
                }
            })
            setProperties(mapped)
        } catch (err) {
            toast.warning("Erro ao carregar propriedades. Vê a consola.")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshProperties()
    }, [refreshProperties])

    /**
     * Manipula a seleção de uma propriedade e inica a animação de saida
     * @param id ID da propriedade
     */
    const handelSelectedProperty = (id:string)=>{
        setIsLeaving(true)
        PropertyService.getPropertyById(id)
            .then((p) => {
                const title =
                    typeof p.name === "string"
                        ? p.name
                        : (p.name?.pt || p.name?.en || p.title || "")
                const desc =
                    typeof p.description === "string"
                        ? p.description
                        : (p.description?.pt || p.description?.en || "")
                const mapped: OwnProperty = {
                    id: String(p.id),
                    title,
                    description: desc,
                    location: p.location ?? "",
                    city: p.city ?? "",
                    address: p.address ?? "",
                    maxGuests: p.maxGuests ?? 1,
                    price: (p.basePrice ?? p.base_price ?? p.pricePerNight ?? p.price_per_night ?? 0) as number,
                    imageUrl: p.imageUrl ?? p.image_url ?? "",
                    status: p.isActive ? "AVAILABLE" : "MAINTENANCE",
                    rating: p.rating ?? 0,
                    featured: p.featured ?? false,
                    tags: p.tags ?? [],
                }
                setTimeout(() => {
                    setSelectedProperty(mapped)
                    setIsLeaving(false)
                    setIsReturning(false)
                    window.scrollTo(0, 0)
                }, 800)
            })
            .catch((err) => {
                setIsLeaving(false)
                toast.warning("Erro ao obter detalhes da propriedade. Vê a consola.")
                console.error(err)
            })
    }


    // Manipula o retorno da vista de detalhes para a lista
    const handleBack = () => {
        setIsReturning(true)

        setTimeout(() => {
            setSelectedProperty(null)
            setTimeout(() => {
                setIsReturning(false)
            }, 1000)
        }, 800)
    }

    useEffect(() => {
        if(selectedPropertyId == null){
            handleBack()
        }
        else if(selectedPropertyId != selectedProperty?.id){
            handelSelectedProperty(selectedPropertyId)
        }
    }, [selectedPropertyId, selectedProperty?.id]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            if (typeof window === "undefined") return
            const actorUserIdRaw = localStorage.getItem("userId")
            const actorUserId = actorUserIdRaw ? Number(actorUserIdRaw) : undefined
            await PropertyService.deleteProperty(Number(id), actorUserId)
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


    if (selectedProperty){
        // dar cast de OwnProperty | null para apenas OwnProperty
        const property :OwnProperty = selectedProperty
        return(
            <div className={VIEW_CONTAINER_STYLES}>
                <PropertyEdit2
                    property={property}
                    onBack={()=>selectPropertyId(null)}
                    isExiting={isReturning}
                    onSaved={async () => {
                        await refreshProperties()
                        const id = property.id
                        if (id) handelSelectedProperty(id)
                    }}
                />
            </div>
            )
    }
    else{ // nenhuma propreidade selecionada
        return(
            <div className={VIEW_CONTAINER_STYLES}>
                <PropertyList
                    variant="CARDS"
                    propertys={properties}
                    onSelect={(id)=>selectPropertyId(id)}
                    isExiting={isLeaving}
                    animate={true}
                    addNewProperty={true}
                    isLoading={isLoading}
                    onDelete={handleDelete}
                    onSaved={refreshProperties}
                />
        </div>
        )
    }
}
