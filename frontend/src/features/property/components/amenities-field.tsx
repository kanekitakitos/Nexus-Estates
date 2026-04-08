import { BrutalButton } from "@/components/ui/forms/button"
import { Field, FieldLabel } from "@/components/ui/forms/field"
import { Badge } from "@/components/ui/badge"
import { useAmenityCatalog } from "../hooks/use-amenity-catalog"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const TEXT_STYLE = "font-mono font-bold uppercase text-xs md:text-sm"

interface AmenitiesFieldProps {
    selectedIds: number[]
    savedIds: number[]
    onUpdateIds: (newIds: number[]) => void
    onRevert: () => void
}

export function AmenitiesField({ selectedIds, savedIds, onUpdateIds, onRevert }: AmenitiesFieldProps) {
    const { amenities, isLoading } = useAmenityCatalog()
    
    // Detect changes by comparing sorted arrays
    const currentSorted = [...selectedIds].sort((a, b) => a - b)
    const savedSorted = [...savedIds].sort((a, b) => a - b)
    const didChange = JSON.stringify(currentSorted) !== JSON.stringify(savedSorted)

    const toggleAmenity = (id: number) => {
        if (selectedIds.includes(id)) {
            onUpdateIds(selectedIds.filter(i => i !== id))
        } else {
            onUpdateIds([...selectedIds, id])
        }
    }

    // Group amenities by category
    const groupedAmenities = amenities.reduce((acc, amenity) => {
        const category = amenity.category || "General"
        if (!acc[category]) acc[category] = []
        acc[category].push(amenity)
        return acc
    }, {} as Record<string, typeof amenities>)

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-4 font-mono text-sm">
                <Loader2 className="animate-spin h-4 w-4" />
                LOADING AMENITIES CATALOG...
            </div>
        )
    }

    return (
        <Field>
            <FieldLabel className={TEXT_STYLE}>Property Amenities</FieldLabel>
            <div className="flex flex-col gap-6">
                {Object.entries(groupedAmenities).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b-2 border-black/10 pb-1">
                            {category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {items.map((amenity) => {
                                const isSelected = selectedIds.includes(amenity.id)
                                return (
                                    <Badge
                                        key={amenity.id}
                                        variant={isSelected ? "amenity" : "outline"}
                                        className={cn(
                                            "cursor-pointer transition-all flex items-center gap-1 py-1.5 px-3 border-2 hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0",
                                            isSelected 
                                                ? "bg-primary text-primary-foreground border-black shadow-[2px_2px_0_0_#000]" 
                                                : "bg-white text-black border-black/20 hover:border-black"
                                        )}
                                        onClick={() => toggleAmenity(amenity.id)}
                                    >
                                        {isSelected && <Check size={12} strokeWidth={4} />}
                                        <span className="font-bold whitespace-nowrap">{amenity.name}</span>
                                    </Badge>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {didChange && (
                    <div className="pt-2">
                        <BrutalButton 
                            className="w-fit text-xs px-4 py-2 bg-orange-400" 
                            type="button" 
                            onClick={onRevert}
                        >
                            REVERT TO SAVED AMENITIES
                        </BrutalButton>
                    </div>
                )}
            </div>
        </Field>
    )
}