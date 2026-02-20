import { BookingCard, BookingProperty } from "./booking-card"

interface BookingListProps {
    properties: BookingProperty[]
    onBook?: (id: string) => void
}

export function BookingList({ properties, onBook }: BookingListProps) {
    if (properties.length === 0) {
        return (
            <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 text-lg font-semibold">No properties found</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        We could not find any properties matching your criteria. Try adjusting your filters.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {properties.map((property) => (
                <BookingCard 
                    key={property.id} 
                    property={property} 
                    onBook={onBook} 
                />
            ))}
        </div>
    )
}
