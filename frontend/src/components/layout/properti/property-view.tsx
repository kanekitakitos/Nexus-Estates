"use client"

import { useMemo, useState } from "react"
import { PropertyEdit2 } from "./property-edit2"
import { PropertyList } from "./property-list"
import { BookingProperty } from "@/features/bookings/components/booking-card"
import {useView} from "@/features/view-context";

export const MOCK_PROPERTIES: BookingProperty[] = [
    {
        id: "1",
        title: "Modern Loft in Downtown",
        description: "Experience city living at its finest in this spacious loft with floor-to-ceiling windows and modern amenities.",
        location: "New York, NY",
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
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        status: "BOOKED", // Should be filtered out
        rating: 4.9,
        featured: true,
        tags: ["Fireplace", "Snow Nearby", "Hot Tub"]
    },
    {
        id: "3",
        title: "Seaside Villa with Pool",
        description: "Relax by the ocean in this stunning villa featuring a private infinity pool and direct beach access.",
        location: "Malibu, CA",
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 5.0,
        tags: ["Oceanfront", "Infinity Pool", "Private Beach", "Luxury"]
    },
    {
        id: "18",
        title: "Lakefront Cottage",
        description: "Peaceful cottage right on the water's edge. Enjoy fishing, kayaking, or just watching the sunset.",
        location: "Lake Tahoe, NV",
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.6,
        tags: ["Lakefront", "Sunset View", "Kayak Included"]
    }
]


export function PropertyView(){

    const { selectedPropertyId, selectPropertyId } = useView()
    const [selectedProperty, setSelectedProperty] = useState<BookingProperty | null>(null)

    const [isLeaving, setIsLeaving] = useState(false)
    const [isReturning, setIsReturning] = useState(false)

    /**
     * Manipula a seleção de uma propriedade e inica a animação de saida
     * @param id ID da propriedade
     */
    const handelSelectedProperty = (id:string)=>{
        const selectProperty = MOCK_PROPERTIES.find((property) => {return property.id === id})

        if (selectProperty) {
                setIsLeaving(true)
                // Aguarda a animação terminar antes de trocar o estado
                setTimeout(() => {
                    setSelectedProperty(selectProperty)
                    setIsLeaving(false)
                    setIsReturning(false)
                    window.scrollTo(0, 0)

                }, 800) // Sincronizado com a duração da animação CSS
            }
    }


    // Manipula o retorno da vista de detalhes para a lista
    const handleBack = () => {
        setIsReturning(true)

        setTimeout(() => {
            setSelectedProperty(null)
            selectPropertyId(null)
            setTimeout(() => {
                setIsReturning(false)
            }, 1000)
        }, 800)
    }


    if (selectedProperty){
        // dar cast de BookingProperty | null para apenas BookingProperty
        const property :BookingProperty = selectedProperty
        return(
            <PropertyEdit2 property={property} onBack={handleBack} isExiting={isReturning}/>
        )
    }
    else{ // nenhuma propreidade selecionada
        return(
            <PropertyList
                variant="CARDS"
                propertys={MOCK_PROPERTIES}
                onSelect={(id)=>{ selectPropertyId(id); handelSelectedProperty(id) }}
                isExiting={isLeaving}
                animate={true}
                addNewProperty={true}
            />)
    }

}
