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


export const MOCK_PROPERTIES: OwnProperty[] = [
    {
        id: "1",
        title: "Modern Loft in Downtown",
        description: "Experience city living at its finest in this spacious loft with floor-to-ceiling windows and modern amenities.",
        location: "New York, NY",
        city: "New York",
        address: "Rua das Gaivotas, Lote 2",
        maxGuests: 2,
        price: 250,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.8,
        featured: true,
        tags: ["City View", "Loft", "High Floor", "Workspace"]
    },
    {
        id: "2",
        title: "Cozy Mountain Cabin",
        description: "Escape to the mountains in this rustic yet luxurious cabin. Perfect for winter getaways and summer hikes.",
        location: "Aspen, CO",
        city: "Aspen",
        address: "Pine Tree Road, 45",
        maxGuests: 4,
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        status: "BOOKED",
        rating: 4.9,
        featured: true,
        tags: ["Fireplace", "Snow Nearby", "Hot Tub"]
    },
    {
        id: "3",
        title: "Seaside Villa with Pool",
        description: "Relax by the ocean in this stunning villa featuring a private infinity pool and direct beach access.",
        location: "Malibu, CA",
        city: "Malibu",
        address: "Pacific Coast Highway, 1020",
        maxGuests: 8,
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 5.0,
        featured: false,
        tags: ["Oceanfront", "Infinity Pool", "Private Beach", "Luxury"]
    },
    {
        id: "18",
        title: "Lakefront Cottage",
        description: "Peaceful cottage right on the water's edge. Enjoy fishing, kayaking, or just watching the sunset.",
        location: "Lake Tahoe, NV",
        city: "Lake Tahoe",
        address: "Emerald Bay Rd, 5",
        maxGuests: 3,
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.6,
        featured: false,
        tags: ["Lakefront", "Sunset View", "Kayak Included"]
    }
];


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
            const mapped: OwnProperty[] = page.content.map((p: Record<string, unknown>) => {
                const city = String(p["city"] ?? "")
                return {
                    id: String(p["id"] ?? ""),
                    title: String(p["name"] ?? ""),
                    description: "",
                    location: city,
                    city,
                    address: "",
                    maxGuests: 1,
                    price: Number(p["basePrice"] ?? 0),
                    imageUrl: "",
                    status: p["isActive"] ? "AVAILABLE" : "MAINTENANCE",
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
    }, [selectedPropertyId]);

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
