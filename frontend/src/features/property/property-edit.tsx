"use client"

import { useCallback, useState } from "react"
import { ArrowLeft, MapPin, Star, Users, Home, Maximize, Check } from "lucide-react"
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
    "title" | "description" | "location" | "city" | "address" | "price" | "maxGuests" | "imageUrl" | "tags"
>

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLES = {
    pageContainer: "flex flex-col space-y-6 p-4 md:p-6 lg:px-[150px] min-h-screen overflow-x-hidden",
    priceText: "font-mono font-bold text-primary text-lg md:text-xl",
    summaryCard: "flex items-center gap-2 md:gap-3 border-[2px] border-foreground p-2 md:p-3 bg-secondary/30",
} as const

const PROPERTY_SPECS = [
    { icon: Users, label: "2 Guests" },
    { icon: Home,  label: "1 Bedroom" },
    { icon: Maximize, label: "85 m²" },
] as const

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
                <PropertyGallery property={property} />

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
        <div className="mb-4 flex justify-between gap-10 max-[330]:flex-col">
            <NavButton onClick={onBack} label="Back to listings" />
            <NavButton onClick={onEdit} label="Edit property" />
        </div>
    )
}

function NavButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <Button onClick={onClick} variant="brutal-outline" className="group">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="flex items-center gap-1">
                <span className="opacity-70">&lt;</span>
                <span>{label}</span>
            </span>
        </Button>
    )
}

function PropertyHeaderCard({ property }: { property: OwnProperty }) {
    return (
        <BrutalShard rotate="primary">
            <div className="flex flex-col space-y-6">
                <LocationLabel location={property.location} />
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-4 text-foreground drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                    {property.title}
                </h1>
                <RatingPriceRow rating={property.rating} price={property.price} />
            </div>
        </BrutalShard>
    )
}

function LocationLabel({ location }: { location: string }) {
    return (
        <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm md:text-lg font-bold text-muted-foreground uppercase">
                {location}
            </span>
        </div>
    )
}

function RatingPriceRow({ rating, price }: { rating: number; price: number }) {
    return (
        <div className="flex items-center gap-4">
            <Badge variant="rating">
                <Star className="h-4 w-4 fill-current" />
                <span>{rating}</span>
            </Badge>
            <div className="h-px w-12 bg-foreground/30" />
            <span className={STYLES.priceText}>
                ${price}
                <span className="text-sm text-muted-foreground">/night</span>
            </span>
        </div>
    )
}

function PropertyDescriptionCard({ property }: { property: OwnProperty }) {
    return (
        <BrutalShard rotate="secondary">
            <div className="border-t-[3px] border-b-[3px] border-foreground py-6 space-y-4">
                <p className="font-mono text-base md:text-lg leading-relaxed text-muted-foreground">
                    {property.description}
                </p>
                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                    {PROPERTY_SPECS.map(({ icon: Icon, label }) => (
                        <div key={label} className={STYLES.summaryCard}>
                            <Icon className="h-4 w-4 md:h-5 md:w-5" />
                            <span className="font-mono font-bold uppercase text-xs md:text-sm">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </BrutalShard>
    )
}

function PropertyAmenitiesCard({ property }: { property: OwnProperty }) {
    return (
        <BrutalShard rotate="primary">
            <div className="space-y-4">
                <h3 className="font-mono text-xl font-black uppercase border-l-4 border-primary pl-3">
                    Amenities
                </h3>
                <div className="flex flex-wrap gap-3">
                    {property.tags?.map((tag, index) => (
                        <Badge key={`${tag}-${index}`} variant="amenity">
                            <Check className="h-3 w-3" />
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="mt-8">
                <Button
                    variant="brutal"
                    className="w-full h-14 md:h-16 text-lg md:text-xl font-black uppercase tracking-wider shadow-[6px_6px_0_0_rgb(0,0,0)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.9)]"
                >
                    Book Now
                </Button>
            </div>
        </BrutalShard>
    )
}