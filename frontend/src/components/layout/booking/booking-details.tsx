import { useEffect, useCallback, useState } from "react"
import { ArrowLeft, MapPin, Star, Users, Home, Maximize, Check } from "lucide-react"
import { Button } from "@/components/ui/forms/button"
import { DateRangeCalendar } from "@/components/ui/forms/date-range-calendar"
import { BookingProperty } from "./booking-card"
import { cn } from "@/lib/utils"

const PAGE_CONTAINER_STYLES = "flex flex-col space-y-6 p-6 px-[150px] min-h-screen"
const BACK_BUTTON_STYLES = "group inline-flex items-center gap-2 border-[2px] border-foreground bg-background px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.9)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
const SHARD_BASE_STYLES = "border-[2px] border-foreground bg-card shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)] p-6 md:p-8"
const SHARD_PRIMARY_STYLES = "transform rotate-1"
const SHARD_SECONDARY_STYLES = "transform -rotate-1"
const MAIN_IMAGE_WRAPPER_STYLES = "relative aspect-[16/5] w-full overflow-hidden rounded-3xl"
const FEATURED_BADGE_STYLES = "absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 font-mono font-bold border-[2px] border-foreground shadow-[3px_3px_0_0_rgb(0,0,0)]"
const THUMBNAIL_STYLES = "relative aspect-[4/3] overflow-hidden rounded-xl border-[2px] border-foreground/70 bg-muted/50 hover:bg-primary/10 transition-colors cursor-pointer group"
const THUMBNAIL_LABEL_STYLES = "absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground"
const RATING_BADGE_STYLES = "flex items-center gap-1 bg-foreground text-background px-3 py-1 font-mono font-bold"
const PRICE_TEXT_STYLES = "font-mono font-bold text-primary text-xl"
const SUMMARY_CARD_STYLES = "flex items-center gap-3 border-[2px] border-foreground p-3 bg-secondary/30"
const AMENITY_TAG_STYLES = "flex items-center gap-2 border-[2px] border-foreground px-3 py-1.5 font-mono text-sm font-bold uppercase hover:bg-foreground hover:text-background transition-colors cursor-default shadow-[2px_2px_0_0_rgb(0,0,0)]"
const BOOK_BUTTON_STYLES = "w-full h-16 text-xl font-black uppercase tracking-wider border-[3px] border-foreground bg-primary text-primary-foreground shadow-[6px_6px_0_0_rgb(0,0,0)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.9)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"

interface BookingDetailsProps {
    property: BookingProperty
    onBack: () => void
    isExiting?: boolean
    checkInDate?: Date | null
    checkOutDate?: Date | null
}

export function BookingDetails({ property, onBack, isExiting, checkInDate = null, checkOutDate = null }: BookingDetailsProps) {
    const handleBack = useCallback(() => {
        onBack()
    }, [onBack])

    const galleryImages = [
        property.imageUrl,
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    ]

    const [activeImageIndex, setActiveImageIndex] = useState(0)

    useEffect(() => {
        if (galleryImages.length <= 1) return

        const intervalId = window.setInterval(() => {
            setActiveImageIndex((previous) => (previous + 1) % galleryImages.length)
        }, 6000)

        return () => window.clearInterval(intervalId)
    }, [galleryImages.length])

    useEffect(() => {
        let touchStartX = 0
        let touchStartY = 0

        const handleWheel = (e: WheelEvent) => {
            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
            
            if (isHorizontal) {
                if (e.deltaX < -20) {
                    handleBack()
                }
            }
        }

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX
            touchStartY = e.touches[0].clientY
        }

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX
            const touchEndY = e.changedTouches[0].clientY
            
            const deltaX = touchEndX - touchStartX
            const deltaY = touchEndY - touchStartY

            if (deltaX > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                handleBack()
            }
        }

        window.addEventListener("wheel", handleWheel)
        window.addEventListener("touchstart", handleTouchStart)
        window.addEventListener("touchend", handleTouchEnd)
        
        return () => {
            window.removeEventListener("wheel", handleWheel)
            window.removeEventListener("touchstart", handleTouchStart)
            window.removeEventListener("touchend", handleTouchEnd)
        }
    }, [handleBack])

    return (
        <div className={cn(
            PAGE_CONTAINER_STYLES,
            isExiting ? "animate-fly-out-right" : "animate-fly-in"
        )}>
            <div className="mb-4">
                <Button 
                    onClick={handleBack}
                    variant="outline" 
                    className={BACK_BUTTON_STYLES}
                >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span className="flex items-center gap-1">
                        <span className="opacity-70">&lt;</span>
                        <span>Back to listings</span>
                    </span>
                </Button>
            </div>

            <div className="space-y-6">
                <div>
                    <div className={MAIN_IMAGE_WRAPPER_STYLES}>
                        <img 
                            src={galleryImages[activeImageIndex]} 
                            alt={property.title} 
                            className="h-full w-full object-cover"
                        />
                        <div className={FEATURED_BADGE_STYLES}>
                            FEATURED
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        {galleryImages.map((imageSrc, index) => (
                            <button
                                key={`${imageSrc}-${index}`}
                                type="button"
                                onClick={() => setActiveImageIndex(index)}
                                className={THUMBNAIL_STYLES}
                            >
                                <img
                                    src={imageSrc}
                                    alt={property.title}
                                    className="h-full w-full object-cover"
                                />
                                <div className={THUMBNAIL_LABEL_STYLES}>
                                    VIEW
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className={cn(SHARD_BASE_STYLES, SHARD_PRIMARY_STYLES)}>
                        <div className="flex flex-col space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span className="font-mono text-lg font-bold text-muted-foreground uppercase">{property.location}</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-4 text-foreground drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                                    {property.title}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <div className={RATING_BADGE_STYLES}>
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{property.rating}</span>
                                    </div>
                                    <div className="h-px w-12 bg-foreground/30" />
                                    <span className={PRICE_TEXT_STYLES}>
                                        ${property.price}<span className="text-sm text-muted-foreground">/night</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={cn(SHARD_BASE_STYLES, SHARD_SECONDARY_STYLES)}>
                            <div className="border-t-[3px] border-b-[3px] border-foreground py-6 space-y-4">
                                <p className="font-mono text-lg leading-relaxed text-muted-foreground">
                                    {property.description}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className={SUMMARY_CARD_STYLES}>
                                        <Users className="h-5 w-5" />
                                        <span className="font-mono font-bold uppercase text-sm">2 Guests</span>
                                    </div>
                                    <div className={SUMMARY_CARD_STYLES}>
                                        <Home className="h-5 w-5" />
                                        <span className="font-mono font-bold uppercase text-sm">1 Bedroom</span>
                                    </div>
                                    <div className={SUMMARY_CARD_STYLES}>
                                        <Maximize className="h-5 w-5" />
                                        <span className="font-mono font-bold uppercase text-sm">85 m²</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cn(SHARD_BASE_STYLES, SHARD_PRIMARY_STYLES)}>
                            <div className="space-y-4">
                                <h3 className="font-mono text-xl font-black uppercase border-l-4 border-primary pl-3">Amenities</h3>
                                <div className="flex flex-wrap gap-3">
                                    {property.tags?.map((tag) => (
                                        <span key={tag} className={AMENITY_TAG_STYLES}>
                                            <Check className="h-3 w-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8">
                                <Button className={BOOK_BUTTON_STYLES}>
                                    Book Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <DateRangeCalendar
                    pricePerNight={property.price}
                    defaultValue={{ start: checkInDate, end: checkOutDate }}
                    onConfirmBooking={({ range, totalPrice, nights }) => {
                        const start = range.start
                        const end = range.end
                        if (!start || !end) return

                        const startLabel = `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}/${start.getFullYear()}`
                        const endLabel = `${String(end.getDate()).padStart(2, "0")}/${String(end.getMonth() + 1).padStart(2, "0")}/${end.getFullYear()}`

                        alert(
                            `Booking requested for ${property.title}\n${startLabel} → ${endLabel}\n${nights} night${nights !== 1 ? "s" : ""} · €${totalPrice.toLocaleString()}`
                        )
                    }}
                    onContactOwner={({ range, totalPrice, nights }) => {
                        const start = range.start
                        const end = range.end
                        if (!start || !end) return

                        const startLabel = `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}/${start.getFullYear()}`
                        const endLabel = `${String(end.getDate()).padStart(2, "0")}/${String(end.getMonth() + 1).padStart(2, "0")}/${end.getFullYear()}`

                        alert(
                            `Contacting owner about ${property.title}\n${startLabel} → ${endLabel}\n${nights} night${nights !== 1 ? "s" : ""} · €${totalPrice.toLocaleString()}`
                        )
                    }}
                />
            </div>
        </div>
    )
}
