"use client"

import { useEffect, useCallback, useState } from "react"
import { ArrowLeft, MapPin, Star, Users, Home, Maximize, Check } from "lucide-react"
import { BrutalButton, Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
import { BrutalCard, BrutalShard } from "@/components/ui/data-display/card"
import { BookingProperty } from "../booking/booking-card"
import { cn } from "@/lib/utils"
import { DateRangeCalendar } from "../booking/date-range-calendar"
import { PropertyNamePriceEdit } from "../v1/property-name-price-edit"
import { PropertyDescription } from "../v1/property-description"
import { PropertyEditForm } from "./property-form"
import { Separator } from "@/components/ui/layout/separator"
import { BookingDetailsProps } from "./property-edit2"

const PAGE_CONTAINER_STYLES = "flex flex-col space-y-6 p-4 md:p-6 lg:px-[150px] min-h-screen overflow-x-hidden"


function NewPropertyData(id:string) {
    const genericProperty : BookingProperty = {
            id: id,
            title: "",
            description: "",
            location: "",
            price: 100,
            imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
            status: "MAINTENANCE",
            rating: 0.0,
            tags: []
        }
    return genericProperty
}



export function PropertyList({propertys, onSelect = ()=>{}, isExiting}: {propertys:BookingProperty[], onSelect: (id:string) => void, isExiting : boolean}){
    const [editFormOpen, setEditFormOpen] = useState<boolean>(false)


    function AddNewPropertyForm({id}:{id:string}){
        const [newProperty, setNewProperty] = useState<BookingProperty>(NewPropertyData(id))
        return(
            <>
                <PropertyEditForm propertyState={[newProperty, setNewProperty]} onClose={()=>setEditFormOpen(false)} open={editFormOpen}/>
            </>
        )
    }

    return(
        <div id="abc" className={cn(
            PAGE_CONTAINER_STYLES,
            isExiting ? "animate-fly-out-right" : "animate-fly-in",
        )}>
            
            <AddNewPropertyForm id={`${propertys.length}`}/>
            
            
            <div id="gridf" className="grid grid-flow-row gap-5 p-4">
                
                <BrutalShard 
                    className="flex gap-0 group items-stretch p-1" 
                >
                    <p className="w-2/5 uppercase font-bold">TITLE</p>
                    <Separator orientation="vertical" className="h-20 mx-4 bg-black" />
                    <p className="w-2/5 uppercase font-bold">location</p>

                    <p className="w-1/5 uppercase font-bold"></p> 

                </BrutalShard>

                <BrutalCard className="gap-2">
                    <BrutalButton onClick={()=>setEditFormOpen(true)} className="w-full">
                    + ADD NEW PROPERTY
                    </BrutalButton>
                </BrutalCard>

                {
                propertys.map((prop) => (
                    <BrutalShard 
                        key={prop.id} 
                        className="flex gap-0 group items-stretch p-1"
                        onClick={()=>{onSelect(prop.id)}} 
                    >
                        <p className="w-2/5 uppercase">{prop.title}</p>
                        <Separator orientation="vertical" className="h-20 mx-4 bg-black" />

                        <p className="w-2/5 uppercase">{prop.location}</p>
                    
                        <BrutalButton
                            className="w-1/5 bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e)=>e.stopPropagation()}
                        >
                            X
                        </BrutalButton>
                    </BrutalShard>
                    ))
                }
            </div>
        </div>
    )
}