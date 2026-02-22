import { Card } from "@/components/ui/data-display/card"
import { Button } from "@/components/ui/forms/button"
import { MapPin, ArrowRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BookingProperty {
    id: string
    title: string
    description: string
    location: string
    price: number
    imageUrl: string
    status: "AVAILABLE" | "BOOKED" | "MAINTENANCE"
    rating?: number
    featured?: boolean
    tags?: string[]
}

interface BookingCardProps {
    property: BookingProperty
    onBook?: (id: string) => void
}

export function BookingCard({ property, onBook }: BookingCardProps) {
    const BRUTAL_SHADOW = "shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)]"
    // Explicitly define hover states without string manipulation to ensure Tailwind handles them correctly
    const BRUTAL_SHADOW_HOVER = "group-hover:shadow-[8px_8px_0_0_rgb(0,0,0)] dark:group-hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.9)]"
    
    const BRUTAL_SHADOW_XSMALL = "shadow-[1.5px_1.5px_0_0_rgb(0,0,0)] dark:shadow-[1.5px_1.5px_0_0_rgba(255,255,255,0.9)]"
    const BRUTAL_SHADOW_BUTTON = "shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.9)]"
    
    // Spacing configuration for tighter/squared layout
    const CARD_PADDING_X = "px-3"
    const CARD_GAP_Y = "py-0" // Reduced from py-0.2/py-0.5 to py-0 (effectively 0 padding)

    const BADGE_STYLES = cn(
        "absolute top-3 z-10 flex items-center gap-1 rounded-full border-[2px] border-foreground bg-background px-2 py-1 text-[10px] font-bold uppercase",
        BRUTAL_SHADOW_XSMALL
    )

    return (
        <div className="group relative aspect-[4/5] w-full">
            <Card 
                onClick={() => onBook?.(property.id)}
                className={cn(
                "flex h-full flex-col overflow-hidden rounded-lg border-[3px] border-foreground bg-secondary transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:-translate-y-1.5 group-hover:translate-x-1.5 cursor-pointer",
                BRUTAL_SHADOW,
                BRUTAL_SHADOW_HOVER
            )}>
                <div className={cn("relative flex-1 flex flex-col min-h-0 pt-3", CARD_PADDING_X)}>
                    <div className={cn(BADGE_STYLES, "left-3")}>
                        <MapPin className="h-3 w-3" />
                        <span>{property.location}</span>
                    </div>
                    {property.rating && (
                        <div className={cn(BADGE_STYLES, "right-3")}>
                            <Star className="h-3 w-3 fill-current" />
                            <span>{property.rating}</span>
                        </div>
                    )}
                    <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="h-full w-full rounded-[2px] border-[2px] border-foreground object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                        referrerPolicy="no-referrer"
                    />
                </div>

                <div className={cn("flex flex-col shrink-0", CARD_PADDING_X, CARD_GAP_Y)}>
                    <h3 className="text-base font-black uppercase leading-tight tracking-tight line-clamp-1 truncate">
                        {property.title}
                    </h3>
                </div>

                {/* Separator Line with Padding */}
                <div className={cn("w-full my-0", CARD_PADDING_X)}>
                    <div className="h-[3px] w-full bg-foreground" />
                </div>

                <div className={cn("flex items-center justify-between bg-secondary pt-0 shrink-0", CARD_PADDING_X)}>
                    <div className="flex flex-col justify-center">
                        <span className="text-[9px] font-bold uppercase text-muted-foreground leading-none mb-0.5">
                            Starting from
                        </span>
                        <span className="font-mono text-sm font-bold text-primary leading-none">
                            ${property.price}/night
                        </span>
                    </div>
                    <Button
                        onClick={() => onBook?.(property.id)}
                        className={cn(
                            "flex h-10 w-16 items-center justify-center rounded-none border-[2px] border-foreground bg-primary text-primary-foreground transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
                            BRUTAL_SHADOW_BUTTON
                        )}
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </Card>
        </div>
    )
}
