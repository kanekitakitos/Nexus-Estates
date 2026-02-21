import { BookingCard, BookingProperty } from "./booking-card"

interface BookingListProps {
    properties: BookingProperty[]
    onBook?: (id: string) => void
}

export function BookingList({ properties, onBook }: BookingListProps) {
    if (properties.length === 0) {
        return (
            <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border-[3px] border-dashed border-foreground/30 p-8 text-center animate-in fade-in-50 bg-secondary/20">
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
            {properties.map((property, index) => (
                <div 
                    key={property.id} 
                    className={`${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 hover:z-10 transition-transform duration-300`}
                >
                    <BookingCard 
                        property={property} 
                        onBook={onBook} 
                    />
                </div>
            ))}
        </div>
    )
}
