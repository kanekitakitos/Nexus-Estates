"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { DateRangeCalendar } from "@/features/bookings/components/date-range-calendar"
import { OwnProperty } from "@/types"
import { PropertyGallery } from "./components/property-gallery"

import { DetailNavigation, DetailInfo } from "./sections/detail/DetailSections"

export interface PropertyDetailProps {
    property: OwnProperty
    onBack: () => void
    onEdit: () => void
    isExiting?: boolean
    checkInDate?: Date | null
    checkOutDate?: Date | null
}

const STYLES = {
    pageContainer: "flex flex-col space-y-6 p-4 md:p-6 lg:px-[150px] min-h-screen overflow-x-hidden",
} as const

/**
 * Property Detail View Component
 * Main entry point for viewing a specific asset's details.
 */
export function PropertyEdit({
    property: initialProperty,
    onBack,
    onEdit,
    isExiting,
    checkInDate = null,
    checkOutDate = null,
}: PropertyDetailProps) {
    const [property, setProperty] = useState<OwnProperty>(initialProperty)

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
            {/* 01. Navigation & Actions */}
            <DetailNavigation onBack={onBack} onEdit={onEdit} />

            <div className="space-y-6">
                {/* 02. Visual Catalog (Gallery) */}
                <PropertyGallery
                    property={property}
                    onUpdateImage={(url) => setProperty(prev => ({ ...prev, imageUrl: url }))}
                />

                {/* 03. Informational Dossier */}
                <DetailInfo property={property} />
            </div>

            {/* 04. Tactical Scheduling (Booking) */}
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