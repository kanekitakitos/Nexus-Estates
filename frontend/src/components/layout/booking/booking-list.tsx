import { BookingCard, BookingProperty } from "./booking-card"
import { BookingHowItWorks } from "./booking-how-it-works"
import { cn } from "@/lib/utils"

interface BookingListProps {
    properties: BookingProperty[]
    onBook?: (id: string) => void
    isLeaving?: boolean
    isReturning?: boolean
}

export function BookingList({ properties, onBook, isLeaving, isReturning }: BookingListProps) {
    if (properties.length === 0) {
        return (
            <div className={cn(
                "flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border-[3px] border-dashed border-foreground/30 p-8 text-center bg-secondary/20",
                !isLeaving && "animate-in fade-in-50",
                isLeaving && "animate-fly-out-chaos-3",
                isReturning && "animate-fly-in-chaos-3"
            )}>
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 font-mono text-xl font-bold uppercase tracking-tight">No properties found</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground font-mono">
                        We could not find any properties matching your criteria. Try adjusting your filters.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-8 transition-[grid-template-columns,gap] duration-200 ease-[cubic-bezier(0.2,0.8,0.4,1)] pb-12">
            {properties.map((property, index) => {
                // Determine chaos animation based on index (modulo 4)
                const chaosOutClass = index % 4 === 0 ? "animate-fly-out-chaos-1" :
                                      index % 4 === 1 ? "animate-fly-out-chaos-2" :
                                      index % 4 === 2 ? "animate-fly-out-chaos-3" :
                                      "animate-fly-out-chaos-4"

                const chaosInClass = index % 4 === 0 ? "animate-fly-in-chaos-1" :
                                     index % 4 === 1 ? "animate-fly-in-chaos-2" :
                                     index % 4 === 2 ? "animate-fly-in-chaos-3" :
                                     "animate-fly-in-chaos-4"

                const animationClass = isLeaving ? chaosOutClass : (isReturning ? chaosInClass : "")
                
                // Add staggered delay
                const delayStyle = { animationDelay: `${(index % 5) * 50}ms` }

                const card = (
                    <div 
                        key={property.id} 
                        className={cn(
                            `${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 hover:z-10 transition-transform duration-300`,
                            animationClass
                        )}
                        style={isLeaving || isReturning ? delayStyle : undefined}
                    >
                        <BookingCard 
                            property={property} 
                            onBook={onBook} 
                        />
                    </div>
                )

                if (index === 4) {
                    return (
                        <div key={`wrapper-${property.id}`} className="contents">
                            <div 
                                key="how-it-works" 
                                className={cn(
                                    "aspect-[4/5] rotate-2 hover:rotate-0 hover:z-10 transition-transform duration-300",
                                    isLeaving ? "animate-fly-out-chaos-2" : (isReturning ? "animate-fly-in-chaos-2" : "")
                                )}
                                style={isLeaving || isReturning ? { animationDelay: "150ms" } : undefined}
                            >
                                <BookingHowItWorks mode="card" className="h-full w-full" />
                            </div>
                            {card}
                        </div>
                    )
                }

                return card
            })}
        </div>
    )
}
