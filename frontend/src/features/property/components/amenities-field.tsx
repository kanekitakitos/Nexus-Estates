import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, RotateCcw, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAmenityCatalog } from "../hooks"

interface AmenitiesFieldProps {
    /** Lista de IDs de comodidade atualmente selecionados em memória */
    selectedIds: number[]
    /** Lista de IDs de comodidade originais da persistência (para comparação) */
    savedIds: number[]
    /** Callback para atualizar a coleção de IDs selecionados */
    onUpdateIds: (newIds: number[]) => void
    /** Callback para repor o estado inicial (savedIds) */
    onRevert: () => void
}

/** Configuração visual das categorias de comodidades (Ícone e Cor) */
const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
    "General": { color: "text-primary", icon: "🏠" },
    "Kitchen": { color: "text-emerald-500", icon: "🍳" },
    "Bathroom": { color: "text-blue-500", icon: "🚿" },
    "Entertainment": { color: "text-pink-500", icon: "🎮" },
    "Outdoor": { color: "text-orange-500", icon: "🌳" },
    "Safety": { color: "text-rose-500", icon: "🔒" },
}

// ─── Sub-Componentes de UI ──────────────────────────────────────────────────

/** Mostra o estado de carregamento técnico do catálogo */
function AmenityLoading() {
    return (
        <div className="flex items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed border-foreground/20 bg-muted/5">
            <Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={3} />
            <span className="font-mono text-xs font-black uppercase tracking-widest text-muted-foreground">
                Indexing Amenities //
            </span>
        </div>
    )
}

/** Cabeçalho da secção com título e ação de reset */
function AmenityHeader({ didChange, onRevert }: { didChange: boolean; onRevert: () => void }) {
    return (
        <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground bg-primary shadow-[2px_2px_0_0_#0D0D0D]">
                    <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
                </div>
                <div>
                    <span className="font-mono text-[8px] font-black uppercase tracking-widest text-primary leading-none block">02 // Serviços</span>
                    <h4 className="text-md font-black uppercase tracking-tighter leading-tight">Amenities</h4>
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
                        className="flex items-center gap-2 px-3 py-1 rounded-lg border-2 border-foreground bg-primary text-primary-foreground font-mono text-[8px] font-black uppercase shadow-[2px_2px_0_0_#0D0D0D]"
                        title="Descartar alterações de comodidades"
                    >
                        <RotateCcw className="h-3 w-3" strokeWidth={3} />
                        Reset //
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}

/** Cabeçalho de cada categoria (General, Kitchen, etc) */
function AmenityCategoryHeader({ category, count, total }: { category: string; count: number; total: number }) {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG["General"]
    return (
        <div className="flex items-center gap-2">
            <span className="flex-shrink-0 text-md">{config.icon}</span>
            <h5 className="font-mono text-[8px] font-black uppercase tracking-[0.1em] text-foreground/40">{category}</h5>
            <div className="h-[1px] flex-1 bg-foreground/5" />
            <span className="font-mono text-[8px] font-black text-muted-foreground">
                {count}/{total}
            </span>
        </div>
    )
}

/** Botão de alternância (Toggle) para uma comodidade individual */
function AmenityToggleButton({ name, isSelected, onClick }: { name: string | any; isSelected: boolean; onClick: () => void }) {
    const resolvedName = typeof name === 'string' ? name : (name?.pt || name?.en || "")
    
    return (
        <button
            onClick={onClick}
            type="button"
            className={cn(
                "relative flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-left",
                isSelected
                    ? "border-foreground bg-foreground text-background shadow-[3px_3px_0_0_#e2621c] -translate-x-0.5 -translate-y-0.5"
                    : "border-foreground/10 bg-muted/5 hover:border-foreground/30"
            )}
        >
            <span className={cn(
                "font-mono text-[9px] font-bold uppercase truncate pr-1",
                isSelected ? "text-primary" : "text-foreground"
            )}>
                {resolvedName}
            </span>

            <div className={cn(
                "flex h-3.5 w-3.5 shrink-0 items-center justify-center border-2 transition-all",
                isSelected ? "border-primary bg-primary rounded-sm" : "border-foreground/20 rounded-sm"
            )}>
                <AnimatePresence>
                    {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={4} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </button>
    )
}

/** Indicador visual de alterações pendentes */
function AmenityChangeIndicator({ diff }: { diff: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 rounded-lg border border-primary bg-primary/5 text-primary flex items-center gap-2"
        >
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[8px] font-black uppercase tracking-widest">
                Changes Pending // {diff > 0 ? "+" : ""}{diff} items
            </span>
        </motion.div>
    )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * AmenitiesField - Gestor de Serviços e Comodidades.
 * 
 * Componente refatorado para maior legibilidade, sub-dividindo a lógica visual
 * em componentes especializados.
 */
export function AmenitiesField({ selectedIds, savedIds, onUpdateIds, onRevert }: AmenitiesFieldProps) {
    const { amenities, isLoading } = useAmenityCatalog()

    // Lógica de comparação para detetar alterações
    const currentSorted = [...selectedIds].sort((a, b) => a - b)
    const savedSorted = [...savedIds].sort((a, b) => a - b)
    const didChange = JSON.stringify(currentSorted) !== JSON.stringify(savedSorted)
    const diffCount = selectedIds.length - savedIds.length

    const toggleAmenity = (id: number) => {
        onUpdateIds(selectedIds.includes(id) 
            ? selectedIds.filter(i => i !== id) 
            : [...selectedIds, id]
        )
    }

    /** Agrupamento por categoria editorial */
    const groupedAmenities = amenities.reduce((acc, amenity) => {
        const cat = amenity.category || "General"
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(amenity)
        return acc
    }, {} as Record<string, typeof amenities>)

    if (isLoading) return <AmenityLoading />

    return (
        <div className="space-y-4">
            <AmenityHeader didChange={didChange} onRevert={onRevert} />

            <div className="grid gap-4">
                {Object.entries(groupedAmenities).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                        <AmenityCategoryHeader 
                            category={category} 
                            count={items.filter(a => selectedIds.includes(a.id)).length} 
                            total={items.length} 
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                            {items.map((amenity) => (
                                <AmenityToggleButton 
                                    key={amenity.id}
                                    name={amenity.name}
                                    isSelected={selectedIds.includes(amenity.id)}
                                    onClick={() => toggleAmenity(amenity.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {didChange && <AmenityChangeIndicator diff={diffCount} />}
            </AnimatePresence>
        </div>
    )
}