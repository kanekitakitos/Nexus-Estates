import { Card } from "@/components/ui/data-display/card"
import { Button } from "@/components/ui/forms/button"
import { MapPin, ArrowRight, Star } from "lucide-react"

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
    return (
        <div className="group relative">
            <Card className="flex h-full flex-col overflow-hidden rounded-xl border-[3px] border-foreground bg-secondary shadow-[8px_8px_0_0_rgb(0,0,0)]">
                <div className="relative p-2 flex-1 flex flex-col">
                    <div className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full border-[2px] border-foreground bg-background px-2 py-0.5 text-[9px] font-bold uppercase shadow-[2px_2px_0_0_rgb(0,0,0)]">
                        <MapPin className="h-3 w-3" />
                        <span>{property.location}</span>
                    </div>
                    {property.rating && (
                        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full border-[2px] border-foreground bg-background px-2 py-0.5 text-[9px] font-bold uppercase shadow-[2px_2px_0_0_rgb(0,0,0)]">
                            <Star className="h-3 w-3 fill-current" />
                            <span>{property.rating}</span>
                        </div>
                    )}
                    <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="h-full min-h-[200px] w-full flex-1 rounded-sm border-[3px] border-foreground object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                        referrerPolicy="no-referrer"
                    />
                </div>

                <div className="flex flex-col px-3 pb-3 pt-1">
                    <h3 className="text-lg font-extrabold uppercase leading-tight tracking-tight line-clamp-2">
                        {property.title}
                    </h3>
                </div>

                <div className="flex h-14 items-center justify-between border-t-[3px] border-foreground bg-secondary px-3">
                    <div className="flex flex-col justify-center">
                        <span className="text-[9px] font-bold uppercase text-muted-foreground">
                            Starting from
                        </span>
                        <span className="font-mono text-lg font-bold text-primary">
                            ${property.price}/night
                        </span>
                    </div>
                    <Button
                        onClick={() => onBook?.(property.id)}
                        className="flex h-10 w-16 items-center justify-center rounded-none border-[3px] border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_rgb(0,0,0)] transition-colors hover:bg-foreground hover:text-background"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </Card>
        </div>
    )
}
