import { BrutalButton } from "@/components/ui/forms/button"
import { Field, FieldLabel } from "@/components/ui/forms/field"
import { Badge } from "@/components/ui/badge"
import { useAmenityCatalog } from "../hooks/use-amenity-catalog"
import { Check, Loader2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

const TEXT_STYLE = "font-mono font-black uppercase text-[10px] tracking-widest text-muted-foreground"

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
                {Object.entries(groupedAmenities).map(([category, items], i) => (
                    <div key={category} className="space-y-4">
                        <div className="flex items-center gap-2 border-b-2 border-foreground/20 pb-2">
                            <span className="font-mono text-[10px] font-black text-primary">0{i + 1} //</span>
                            <h4 className="text-sm md:text-base font-black uppercase tracking-widest text-foreground">
                                {category}
                            </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {items.map((amenity) => {
                                const isSelected = selectedIds.includes(amenity.id)
                                return (
                                    <Badge
                                        key={amenity.id}
                                        variant={isSelected ? "amenity" : "outline"}
                                        className={cn(
                                            "cursor-pointer transition-all flex items-center gap-1.5 py-1.5 px-3 border-2 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 text-xs md:text-sm font-mono",
                                            isSelected 
                                                ? "bg-primary text-primary-foreground border-foreground shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.8)]" 
                                                : "bg-background text-foreground border-foreground/30 hover:border-foreground hover:shadow-[2px_2px_0_0_rgb(0,0,0)] dark:hover:shadow-[2px_2px_0_0_rgba(255,255,255,0.8)]"
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
                    <div className="pt-4 border-t-2 border-foreground/10">
                        <BrutalButton 
                            className="w-fit text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-2 bg-orange-400 text-black border-2 border-foreground shadow-[3px_3px_0_0_rgb(0,0,0)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgb(0,0,0)]" 
                            type="button" 
                            onClick={onRevert}
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-2" strokeWidth={3} />
                            REVERT TO SAVED AMENITIES
                        </BrutalButton>
                    </div>
                )}
            </div>
        </Field>
    )
}