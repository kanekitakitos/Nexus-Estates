"use client"

import { useCallback, useState } from "react"
import { ArrowLeft, MapPin, Star, Users, Home, Maximize, Check, Pencil } from "lucide-react"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
import { BrutalShard } from "@/components/ui/data-display/card"
import { cn } from "@/lib/utils"
import { DateRangeCalendar } from "@/features/bookings/components/date-range-calendar"
import { PropertyEditForm } from "./property-form"
import { OwnProperty } from "./property-view"
import { PropertyGallery } from "./components/property-gallery"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingDetailsProps {
    property: OwnProperty
    onBack: () => void
    isExiting?: boolean
    checkInDate?: Date | null
    checkOutDate?: Date | null
    onSaved?: () => void | Promise<void>
}

export type EditableFieldsI = Pick<
    OwnProperty,
    "title" | "description" | "location" | "city" | "address" | "price" | "maxGuests" | "imageUrl" | "tags" | "amenityIds"
>

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLES = {
    pageContainer: "flex flex-col space-y-6 p-4 md:p-6 lg:px-[150px] min-h-screen overflow-x-hidden",
    priceText: "font-mono font-bold text-primary text-lg md:text-xl",
    summaryCard: "flex items-center gap-2 md:gap-3 border-[2px] border-foreground p-2 md:p-3 bg-secondary/30",
} as const

// ─── Root Component ───────────────────────────────────────────────────────────

export function PropertyEdit({
                                  property: initialProperty,
                                  onBack,
                                  isExiting,
                                  checkInDate = null,
                                  checkOutDate = null,
                                  onSaved,
                              }: BookingDetailsProps) {
    const [property, setProperty] = useState<OwnProperty>(initialProperty)
    const [editFormOpen, setEditFormOpen] = useState(false)

    const handleBack = useCallback(() => onBack(), [onBack])

    const defaultDateRange =
        checkInDate && checkOutDate ? { from: checkInDate, to: checkOutDate } : undefined

    return (
        <div
            className={cn(
                STYLES.pageContainer,
                isExiting
                    ? "animate-fly-out-right fill-mode-forwards"
                    : "animate-fly-in fill-mode-forwards"
            )}
        >
            <PropertyEditForm
                propertyState={[property, setProperty]}
                onClose={() => setEditFormOpen(false)}
                open={editFormOpen}
                onSaved={onSaved}
            />

            <NavigationBar onBack={handleBack} onEdit={() => setEditFormOpen(true)} />

            <div className="space-y-6">
                <PropertyGallery
                    property={property}
                    onUpdateImage={(url) => setProperty(prev => ({ ...prev, imageUrl: url }))}
                />

                <div className="space-y-6">
                    <PropertyHeaderCard property={property} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PropertyDescriptionCard property={property} />
                        <PropertyAmenitiesCard property={property} />
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <DateRangeCalendar
                    pricePerNight={property.price}
                    defaultValue={defaultDateRange}
                    onConfirmBooking={({ totalPrice, nights }) =>
                        alert(`Booking Confirmed! Total: €${totalPrice} for ${nights} nights`)
                    }
                    onContactOwner={() => alert("Contact owner feature coming soon")}
                />
            </div>
        </div>
    )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavigationBarProps {
    onBack: () => void
    onEdit: () => void
}

function NavigationBar({ onBack, onEdit }: NavigationBarProps) {
    return (
        <div className="mb-8 flex justify-between items-center gap-4">
            <Button onClick={onBack} variant="outline" className="group gap-2 border-2 text-xs font-black uppercase tracking-widest px-4 font-mono shadow-[2px_2px_0_0_rgb(0,0,0)] hover:shadow-[4px_4px_0_0_rgb(0,0,0)] hover:-translate-x-0.5 hover:-translate-y-0.5">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={3} />
                Voltar à Lista
            </Button>
            <Button onClick={onEdit} variant="brutal" className="group gap-2 bg-primary text-primary-foreground border-2 border-foreground text-xs font-black uppercase tracking-widest px-6 shadow-[3px_3px_0_0_rgb(0,0,0)] hover:shadow-[5px_5px_0_0_rgb(0,0,0)] hover:-translate-x-0.5 hover:-translate-y-0.5">
                <Pencil className="h-4 w-4" strokeWidth={3} />
                Editar Perfil
            </Button>
        </div>
    )
}

function PropertyHeaderCard({ property }: { property: OwnProperty }) {
    return (
        <BrutalShard rotate="primary">
            <div className="flex flex-col space-y-4">
                <span className="font-mono text-[10px] font-black text-primary uppercase tracking-widest">01 // Perfil Principal</span>
                <LocationLabel location={property.location} />
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-4 text-foreground drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                    {property.title}
                </h1>
                <RatingPriceRow rating={property.rating ?? 0} price={property.price} />
            </div>
        </BrutalShard>
    )
}

function LocationLabel({ location }: { location: string }) {
    return (
        <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" strokeWidth={3} />
            <span className="font-mono text-xs md:text-sm font-black text-muted-foreground uppercase tracking-widest">
                {location}
            </span>
        </div>
    )
}

function RatingPriceRow({ rating, price }: { rating: number; price: number }) {
    return (
        <div className="flex items-center gap-4 mt-2">
            <Badge variant="rating" className="border-2 shadow-[2px_2px_0_0_rgb(0,0,0)] px-3">
                <Star className="h-4 w-4 fill-current mr-1 text-yellow-400" />
                <span className="font-mono font-bold">{rating.toFixed(1)}</span>
            </Badge>
            <div className="h-px w-8 md:w-12 bg-foreground/30" />
            <span className={STYLES.priceText}>
                <span className="text-2xl md:text-3xl font-black">{price}€</span>
                <span className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">/ Noite</span>
            </span>
        </div>
    )
}

function PropertyDescriptionCard({ property }: { property: OwnProperty }) {
    const specs = [
        { icon: Users, label: `${property.maxGuests || 0} Hóspedes` },
        { icon: Home,  label: "Alojamento" }, 
        { icon: Maximize, label: "Premium" },
    ]

    return (
        <BrutalShard rotate="secondary" className="h-full">
            <div className="flex flex-col space-y-6 justify-between h-full py-2">
                <div>
                    <span className="font-mono text-[10px] font-black text-primary uppercase tracking-widest block mb-4">02 // Descrição</span>
                    <div className="border-l-4 border-primary pl-4 py-1">
                        <p className="font-mono text-sm md:text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            {property.description}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-6">
                    {specs.map(({ icon: Icon, label }) => (
                        <div key={label} className={cn(STYLES.summaryCard, "hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_rgb(0,0,0)] transition-all")}>
                            <Icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" strokeWidth={2.5} />
                            <span className="font-mono font-black uppercase tracking-tighter text-[10px] md:text-[11px]">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </BrutalShard>
    )
}

function PropertyAmenitiesCard({ property }: { property: OwnProperty }) {
    return (
        <BrutalShard rotate="primary" className="h-full">
            <div className="flex flex-col space-y-6 h-full justify-between py-2">
                <div>
                    <span className="font-mono text-[10px] font-black text-primary uppercase tracking-widest block mb-4">03 // Comodidades</span>
                    
                    <div className="flex flex-wrap gap-2 md:gap-2.5">
                        {property.tags?.map((tag, index) => (
                            <Badge key={`${tag}-${index}`} variant="outline" className="border-2 border-foreground bg-background hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_rgb(0,0,0)] transition-all flex items-center gap-1.5 py-1.5 px-3">
                                <Check className="h-3.5 w-3.5 text-primary" strokeWidth={4} />
                                <span className="font-mono font-bold uppercase text-[10px] md:text-xs tracking-widest">{tag}</span>
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="mt-8">
                    <Button
                        variant="brutal"
                        className="w-full h-14 md:h-16 text-lg md:text-xl font-black uppercase tracking-wider shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)] opacity-60 pointer-events-none"
                    >
                        Preview Dashboard
                    </Button>
                </div>
            </div>
        </BrutalShard>
    )
}