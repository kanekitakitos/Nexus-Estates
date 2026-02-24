import { BrutalInteractiveCard } from "@/components/ui/data-display/card"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
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
    className?: string
}

export function BookingCard({ property, onBook, className }: BookingCardProps) {
    // Spacing configuration for tighter/squared layout
    const CARD_PADDING_X = "px-3 md:px-3"

    return (
        <div className={cn("group relative aspect-[4/5] w-full max-w-[240px] mx-auto md:max-w-none", className)}>
            <BrutalInteractiveCard 
                onClick={() => onBook?.(property.id)}
                className="h-full py-2"
            >
                <div className={cn("relative h-[70%] pb-2 flex flex-col min-h-0 pt-2 md:pt-3", CARD_PADDING_X)}>
                    <Badge variant="brutal" className="absolute top-2 md:top-3 left-2 md:left-3 z-10 gap-1">
                        <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        <span className="truncate max-w-[100px] md:max-w-none">{property.location}</span>
                    </Badge>
                    
                    {property.rating && (
                        <Badge variant="brutal" className="absolute top-2 md:top-3 right-2 md:right-3 z-10 gap-1">
                            <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
                            <span>{property.rating}</span>
                        </Badge>
                    )}
                    
                    <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="h-full w-full rounded-[5px] border-[2px] border-foreground object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                        referrerPolicy="no-referrer"
                    />
                </div>

                <div className={cn("relative flex-1 flex flex-col justify-between pb-2", CARD_PADDING_X)}>
                    <div className="flex flex-col shrink-0">
                        <h3 className="text-sm md:text-base font-black uppercase leading-tight tracking-tight line-clamp-1 truncate mt-1 md:mt-0">
                            {property.title}
                        </h3>
                        <div className="w-full my-1">
                            <div className="h-[2px] md:h-[3px] w-full bg-foreground" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-secondary pt-0 shrink-0">
                        <div className="flex flex-col justify-center">
                            <span className="text-[9px] md:text-[9px] font-bold uppercase text-muted-foreground leading-none mb-0.5">
                                Starting from
                            </span>
                            <span className="font-mono text-xs md:text-sm font-bold text-primary leading-none">
                                ${property.price}/night
                            </span>
                        </div>
                        <Button
                            variant="brutal"
                            onClick={() => onBook?.(property.id)}
                            className="flex h-8 w-10 md:h-10 md:w-16 items-center justify-center p-0"
                        >
                            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                    </div>
                </div>
            </BrutalInteractiveCard>
        </div>
    )
}
