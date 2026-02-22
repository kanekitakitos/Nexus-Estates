import { useEffect, useState } from "react"
import { ArrowLeft, MapPin, Star, Users, Home, Maximize, Check } from "lucide-react"
import { Button } from "@/components/ui/forms/button"
import { BookingProperty } from "./booking-card"
import { cn } from "@/lib/utils"

interface BookingDetailsProps {
    property: BookingProperty
    onBack: () => void
    isExiting?: boolean
}

export function BookingDetails({ property, onBack, isExiting }: BookingDetailsProps) {
    const [isLeaving, setIsLeaving] = useState(false)

    // Trigger internal leave state when parent signals exit
    useEffect(() => {
        if (isExiting) {
            setIsLeaving(true)
        }
    }, [isExiting])

    // Handle back action (either by button or gesture)
    const handleBack = () => {
        // Just notify parent, parent will set isExiting -> which sets isLeaving locally
        onBack()
    }

    // Scroll gesture detection
    useEffect(() => {
        let touchStartX = 0
        let touchStartY = 0

        // Handle Trackpad/Mouse Wheel
        const handleWheel = (e: WheelEvent) => {
            // Check if horizontal scroll is dominant
            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
            
            if (isHorizontal) {
                // Lower threshold for better sensitivity (20 instead of 50)
                // e.deltaX < -20 usually means swiping right (to go back) on trackpads
                if (e.deltaX < -20) {
                    handleBack()
                }
            }
        }

        // Handle Touch Screens (Mobile/Tablet)
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX
            touchStartY = e.touches[0].clientY
        }

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX
            const touchEndY = e.changedTouches[0].clientY
            
            const deltaX = touchEndX - touchStartX
            const deltaY = touchEndY - touchStartY

            // Swipe Right (deltaX > 50) and dominant horizontal movement
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
    }, [])

    return (
        <div className={cn(
            "min-h-screen w-full",
            isLeaving ? "animate-fly-out-right" : "animate-fly-in"
        )}>
            {/* Header / Back Button */}
            <div className="mb-8">
                <Button 
                    onClick={handleBack}
                    variant="outline" 
                    className="group border-[3px] border-foreground bg-background shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-mono uppercase font-bold text-lg px-6 py-6"
                >
                    <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Listings
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Image Gallery (Brutalist style) */}
                <div className="space-y-4">
                    <div className="relative aspect-[4/3] w-full border-[4px] border-foreground bg-secondary shadow-[8px_8px_0_0_rgb(0,0,0)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.9)] overflow-hidden">
                        <img 
                            src={property.imageUrl} 
                            alt={property.title} 
                            className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 font-mono font-bold border-[2px] border-foreground shadow-[3px_3px_0_0_rgb(0,0,0)]">
                            FEATURED
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square border-[3px] border-foreground bg-muted hover:bg-primary/20 transition-colors cursor-pointer relative group">
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 font-mono font-bold text-foreground">
                                    VIEW
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="flex flex-col space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span className="font-mono text-lg font-bold text-muted-foreground uppercase">{property.location}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-4 text-foreground drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                            {property.title}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-foreground text-background px-3 py-1 font-mono font-bold">
                                <Star className="h-4 w-4 fill-current" />
                                <span>{property.rating}</span>
                            </div>
                            <div className="h-px w-12 bg-foreground/30" />
                            <span className="font-mono font-bold text-primary text-xl">
                                ${property.price}<span className="text-sm text-muted-foreground">/night</span>
                            </span>
                        </div>
                    </div>

                    <div className="border-t-[3px] border-b-[3px] border-foreground py-6 space-y-4">
                        <p className="font-mono text-lg leading-relaxed text-muted-foreground">
                            {property.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="flex items-center gap-3 border-[2px] border-foreground p-3 bg-secondary/30">
                                <Users className="h-5 w-5" />
                                <span className="font-mono font-bold uppercase text-sm">2 Guests</span>
                            </div>
                            <div className="flex items-center gap-3 border-[2px] border-foreground p-3 bg-secondary/30">
                                <Home className="h-5 w-5" />
                                <span className="font-mono font-bold uppercase text-sm">1 Bedroom</span>
                            </div>
                            <div className="flex items-center gap-3 border-[2px] border-foreground p-3 bg-secondary/30">
                                <Maximize className="h-5 w-5" />
                                <span className="font-mono font-bold uppercase text-sm">85 m²</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-mono text-xl font-black uppercase border-l-4 border-primary pl-3">Amenities</h3>
                        <div className="flex flex-wrap gap-3">
                            {property.tags?.map((tag) => (
                                <span key={tag} className="flex items-center gap-2 border-[2px] border-foreground px-3 py-1.5 font-mono text-sm font-bold uppercase hover:bg-foreground hover:text-background transition-colors cursor-default shadow-[2px_2px_0_0_rgb(0,0,0)]">
                                    <Check className="h-3 w-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <Button className="w-full h-16 text-xl font-black uppercase tracking-wider border-[3px] border-foreground bg-primary text-primary-foreground shadow-[6px_6px_0_0_rgb(0,0,0)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.9)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                            Book Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
