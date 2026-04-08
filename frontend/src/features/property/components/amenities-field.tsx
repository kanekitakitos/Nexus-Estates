import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, RotateCcw, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAmenityCatalog } from "../hooks/use-amenity-catalog"

interface AmenitiesFieldProps {
    selectedIds: number[]
    savedIds: number[]
    onUpdateIds: (newIds: number[]) => void
    onRevert: () => void
}

const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
    "General": { color: "text-primary", icon: "🏠" },
    "Kitchen": { color: "text-emerald-500", icon: "🍳" },
    "Bathroom": { color: "text-blue-500", icon: "🚿" },
    "Entertainment": { color: "text-pink-500", icon: "🎮" },
    "Outdoor": { color: "text-orange-500", icon: "🌳" },
    "Safety": { color: "text-rose-500", icon: "🔒" },
}

export function AmenitiesField({ selectedIds, savedIds, onUpdateIds, onRevert }: AmenitiesFieldProps) {
    const { amenities, isLoading } = useAmenityCatalog()

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

    const groupedAmenities = amenities.reduce((acc, amenity) => {
        const category = amenity.category || "General"
        if (!acc[category]) acc[category] = []
        acc[category].push(amenity)
        return acc
    }, {} as Record<string, typeof amenities>)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed border-foreground/20 bg-muted/5">
                <Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={3} />
                <span className="font-mono text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Indexing Amenities //
                </span>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-foreground/10 pb-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-foreground bg-primary shadow-[3px_3px_0_0_#0D0D0D]">
                        <Sparkles className="h-6 w-6 text-primary-foreground" strokeWidth={3} />
                    </div>
                    <div>
                        <span className="font-mono text-[10px] font-black uppercase tracking-widest text-primary">02 // Services</span>
                        <h4 className="text-xl font-black uppercase tracking-tighter leading-none">Amenities</h4>
                    </div>
                </div>

                <AnimatePresence>
                    {didChange && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={onRevert}
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-md border-2 border-foreground bg-primary text-primary-foreground font-mono text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_#0D0D0D] hover:shadow-[5px_5px_0_0_#0D0D0D] transition-all"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={3} />
                            Reset //
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Categories */}
            <div className="grid gap-8">
                {Object.entries(groupedAmenities).map(([category, items], categoryIndex) => {
                    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG["General"]

                    return (
                        <div key={category} className="space-y-4">
                            {/* Category Header */}
                            <div className="flex items-center gap-3">
                                <span className="flex-shrink-0 text-xl">{config.icon}</span>
                                <h5 className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">{category}</h5>
                                <div className="h-px flex-1 bg-foreground/10" />
                                <span className="font-mono text-[9px] font-black text-muted-foreground">
                                    [{items.filter(a => selectedIds.includes(a.id)).length}/{items.length}]
                                </span>
                            </div>

                            {/* Amenities Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {items.map((amenity) => {
                                    const isSelected = selectedIds.includes(amenity.id)

                                    return (
                                        <button
                                            key={amenity.id}
                                            onClick={() => toggleAmenity(amenity.id)}
                                            type="button"
                                            className={cn(
                                                "relative flex items-center justify-between gap-3 px-4 py-3 rounded-md border-2 transition-all duration-200 text-left",
                                                isSelected
                                                    ? "border-foreground bg-foreground text-background shadow-[4px_4px_0_0_#e2621c] -translate-x-1 -translate-y-1"
                                                    : "border-foreground/20 bg-muted/5 hover:border-foreground/40 hover:-translate-x-0.5 hover:-translate-y-0.5"
                                            )}
                                        >
                                            <span className={cn(
                                                "font-mono text-[10px] font-black uppercase tracking-widest",
                                                isSelected ? "text-primary" : "text-foreground"
                                            )}>
                                                {typeof amenity.name === 'string' 
                                                    ? amenity.name 
                                                    : ((amenity.name as any)?.pt || (amenity.name as any)?.en || "")}
                                            </span>

                                            <div className={cn(
                                                "flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-all",
                                                isSelected
                                                    ? "border-primary bg-primary rounded-sm"
                                                    : "border-foreground/20 rounded-sm"
                                            )}>
                                                <AnimatePresence>
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            exit={{ scale: 0 }}
                                                        >
                                                            <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={4} />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Change Indicator Shard */}
            <AnimatePresence>
                {didChange && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl border-2 border-primary bg-primary/5 text-primary shadow-[4px_4px_0_0_#e2621c]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="font-mono text-[10px] font-black uppercase tracking-widest">
                                pending changes detected // unsaved items: {Math.abs(selectedIds.length - savedIds.length)}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}