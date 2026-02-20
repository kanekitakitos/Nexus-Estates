import { Card } from "@/components/ui/data-display/card"
import { Badge } from "@/components/ui/badge"
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
        <div className="group relative [perspective:1200px]">
            <Card className="relative overflow-hidden rounded-xl border-4 border-foreground/90 bg-secondary shadow-[10px_10px_0_0_rgb(0,0,0)] transition-transform duration-300 [transform-style:preserve-3d] group-hover:-translate-y-1 group-hover:-translate-x-1">
            <div className="relative aspect-[16/9] w-full overflow-hidden border-b-4 border-foreground">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_1.5px)] [background-size:8px_8px]" />
                <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="h-full w-full object-cover"
                />
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                    {property.featured && (
                        <Badge variant="secondary" className="rotate-[-2deg] border-2 border-foreground bg-primary text-primary-foreground shadow-[4px_4px_0_0_rgb(0,0,0)]">
                            Featured
                        </Badge>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 z-20 w-full p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="border-2 border-foreground bg-secondary text-foreground shadow-[3px_3px_0_0_rgb(0,0,0)]">
                            <MapPin className="mr-1 size-3" />
                            {property.location}
                        </Badge>
                        {property.rating && (
                            <div className="flex items-center rounded-none border-2 border-foreground bg-secondary px-2 py-0.5 text-xs font-bold text-amber-600 shadow-[3px_3px_0_0_rgb(0,0,0)]">
                                <Star className="mr-1 size-3 fill-current" />
                                {property.rating}
                            </div>
                        )}
                    </div>
                    <h3 className="text-xl font-semibold leading-tight tracking-tight text-foreground/90">
                        {property.title}
                    </h3>
                </div>
            </div>
            <div className="flex flex-col gap-3 px-5 pb-5 pt-3 [transform:translateZ(20px)]">
                {property.tags && property.tags.length > 0 && (
                    <div className="relative mt-1 overflow-hidden">
                        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-secondary to-transparent" />
                        <div className="tags-marquee">
                            <div className="tags-marquee-track flex gap-2 pr-6">
                                {[...property.tags, ...property.tags].map((tag, index) => (
                                    <Badge
                                        key={`${tag}-${index}`}
                                        variant="secondary"
                                        className="whitespace-nowrap rounded-full border-2 border-foreground bg-background/90 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-foreground shadow-[2px_2px_0_0_rgb(0,0,0)]"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div className="mt-2 flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                            Starting from
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-primary">
                                ${property.price}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                                /night
                            </span>
                        </div>
                        {property.rating && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-none border-2 border-foreground bg-secondary px-2 py-0.5 text-[11px] font-bold text-amber-600 shadow-[3px_3px_0_0_rgb(0,0,0)]">
                                <Star className="size-3 fill-current" />
                                <span>{property.rating}</span>
                            </div>
                        )}
                    </div>
                    <Button 
                        onClick={() => onBook?.(property.id)} 
                        size="lg"
                        className="h-12 px-6 rounded-none border-4 border-foreground bg-primary text-primary-foreground shadow-[6px_6px_0_0_rgb(0,0,0)] transition-transform hover:-translate-y-0.5 hover:translate-x-0.5"
                    >
                        <ArrowRight className="size-5" />
                    </Button>
                </div>
            </div>
        </Card>
        </div>
    )
}
