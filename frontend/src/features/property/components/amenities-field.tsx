import { BrutalButton } from "@/components/ui/forms/button"
import { BrutalInput } from "@/components/ui/forms/input"
import { Field, FieldLabel } from "@/components/ui/forms/field"
import { BrutalShard } from "@/components/ui/data-display/card"
import { Badge } from "@/components/ui/badge"

const TEXT_STYLE = "font-mono font-bold uppercase text-xs md:text-sm"

interface AmenitiesFieldProps {
    tags: string[]
    savedTags: string[]
    onUpdateTags: (newTags: string[]) => void
    onRevert: () => void
}

export function AmenitiesField({ tags, savedTags, onUpdateTags, onRevert }: AmenitiesFieldProps) {
    const didChange = JSON.stringify(tags) !== JSON.stringify(savedTags)

    return (
        <Field>
            <FieldLabel className={TEXT_STYLE}>Amenities</FieldLabel>
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                    {tags.map((tag, index) => (
                        <BrutalShard key={index} className="p-0 flex flex-row items-center overflow-hidden w-auto">
                            <BrutalInput
                                value={tag}
                                className="font-mono text-xs border-none outline-none focus-visible:ring-0 w-32"
                                onChange={(e) => {
                                    const newTags = [...tags]
                                    newTags[index] = e.target.value
                                    onUpdateTags(newTags)
                                }}
                            />
                            <button
                                type="button"
                                className="bg-destructive hover:bg-destructive/80 text-white px-3 py-2 h-full font-bold transition-colors"
                                onClick={() => {
                                    const newTags = tags.filter((_, i) => i !== index)
                                    onUpdateTags(newTags)
                                }}
                            >
                                X
                            </button>
                        </BrutalShard>
                    ))}
                    <Badge
                        variant="amenity"
                        className="cursor-pointer hover:scale-105 transition-transform self-center py-2"
                        onClick={() => {
                            const newTags = [...tags, "new amenity"]
                            onUpdateTags(newTags)
                        }}
                    >
                        + New Amenity
                    </Badge>
                </div>

                {didChange && (
                    <BrutalButton className="w-fit" type="button" onClick={onRevert}>
                        Revert Amenities
                    </BrutalButton>
                )}
            </div>
        </Field>
    )
}