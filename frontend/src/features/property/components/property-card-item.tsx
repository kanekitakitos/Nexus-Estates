import { Home, MapPin, Users2, Pencil, Trash2, ArrowRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { brutalCardHover, microPop } from "../animations"

const STATUS_CONFIG = {
    AVAILABLE: {
        bg: "bg-emerald-50 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-400",
        label: "Disponível",
        dot: "bg-emerald-500",
    },
    BOOKED: {
        bg: "bg-rose-50 dark:bg-rose-400/10 text-rose-800 dark:text-rose-400",
        label: "Ocupada",
        dot: "bg-rose-500",
    },
    MAINTENANCE: {
        bg: "bg-amber-50 dark:bg-amber-400/10 text-amber-800 dark:text-amber-400",
        label: "Manutenção",
        dot: "bg-amber-500",
    },
}

interface PropertyCardItemProps {
    prop: OwnProperty
    onSelect: (id: string) => void
    onEdit?: (prop: OwnProperty) => void
    onDelete?: (id: string) => void | Promise<void>
    variant?: "default" | "compact" | "mini"
}

export function PropertyCardItem({ prop, onSelect, onEdit, onDelete, variant = "default" }: PropertyCardItemProps) {
    const statusConfig = STATUS_CONFIG[prop.status]
    const isCompact = variant === "compact"
    const isMini = variant === "mini"
    const currentIsCompact = isCompact || isMini
    
    // Secure ID resolution for Neo-Brutal display
    const resolvedId = (id: string) => {
        if (!id || typeof id !== 'string') return "00"
        const lastPart = id.slice(-2)
        const parsed = parseInt(lastPart, 16)
        if (isNaN(parsed)) return "00"
        return (parsed % 99 + 1).toString().padStart(2, '0')
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={brutalCardHover(currentIsCompact)}
            whileTap={microPop}
            onClick={() => onSelect(prop.id)}
            className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-md border-[3px] border-foreground transition-all duration-300",
                "shadow-[6px_6px_0_0_#0D0D0D] dark:shadow-[6px_6px_0_0_rgba(0,0,0,0.5)] hover:shadow-[12px_12px_0_0_#0D0D0D] dark:hover:shadow-[12px_12px_0_0_rgba(0,0,0,0.6)]",
                isCompact && "shadow-[4px_4px_0_0_#0D0D0D] dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] hover:shadow-[8px_8px_0_0_#0D0D0D]",
                isMini && "shadow-[3px_3px_0_0_#0D0D0D] border-2 rounded-xl"
            )}
        >
            <div className={cn(
                "flex h-full",
                isMini ? "flex-row items-center p-2 gap-3" : 
                isCompact ? "flex-col" : "min-h-[260px] md:flex-row"
            )}>
                {/* Image Section */}
                <div className={cn(
                    "relative overflow-hidden bg-muted/10 border-foreground group/img shrink-0",
                    isMini ? "h-12 w-12 rounded-lg border-2" :
                    isCompact
                        ? "w-full aspect-[4/3] border-b-[3px]"
                        : "w-full md:w-[220px] lg:w-[280px] border-b-[3px] md:border-b-0 md:border-r-[3px]"
                )}>
                    {prop.imageUrl ? (
                        <motion.img
                            src={prop.imageUrl}
                            alt={typeof prop.title === 'string' ? prop.title : prop.title?.pt || prop.title?.en}
                            className="h-full w-full object-cover grayscale-[0.3] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted/10">
                            <Home className={cn(isCompact ? "h-10 w-10" : "h-12 w-12", "text-muted-foreground/20")} strokeWidth={1} />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 pointer-events-none" />

                    {prop.featured && !isMini && (
                        <div className="absolute top-3 left-3 z-10">
                            <motion.div
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="flex items-center gap-1 rounded-md bg-yellow-400 font-black uppercase tracking-widest border-2 border-foreground shadow-[2px_2px_0_0_#0D0D0D] px-2 py-1 text-[9px] text-black"
                            >
                                <Star className="h-3 w-3" fill="currentColor" />
                                <span>HOT</span>
                            </motion.div>
                        </div>
                    )}

                    {!isMini && (
                        <div className={cn("absolute bottom-2 left-3 z-10 mix-blend-difference pointer-events-none text-white/50", isCompact ? "opacity-40" : "")}>
                            <span className={cn("font-mono font-black block leading-none saturate-0", isCompact ? "text-2xl" : "text-4xl")}>
                                #{resolvedId(prop.id)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className={cn(
                    "flex-1 flex flex-col justify-center min-w-0 relative bg-transparent",
                    isMini ? "p-0" : isCompact ? "p-5 bg-card/10" : "p-6 md:p-8 bg-card/10"
                )}>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:invert"
                        style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '14px 14px' }}
                    />

                    <div className={cn("relative z-10", isMini ? "flex flex-col" : isCompact ? "space-y-3" : "space-y-4")}>
                        <div className="min-w-0">
                            {!isMini && (
                                <div className={cn(
                                    "flex items-center gap-2 font-mono font-black uppercase tracking-widest text-primary mb-1",
                                    isCompact ? "text-[9px]" : "text-[10px] tracking-[0.2em]"
                                )}>
                                    <MapPin className="h-3.5 w-3.5" strokeWidth={4} />
                                    <span className="truncate">
                                        {prop.location}{isCompact ? "" : ` // ${prop.city}`}
                                    </span>
                                </div>
                            )}
                            <h3 className={cn(
                                "font-black uppercase tracking-tighter transition-colors duration-400 leading-tight text-foreground",
                                isMini ? "text-sm truncate" : 
                                isCompact ? "text-2xl line-clamp-2" : "text-3xl md:text-4xl line-clamp-1"
                            )}>
                                {typeof prop.title === 'string' ? prop.title : prop.title?.pt || prop.title?.en}
                            </h3>
                            {isMini && (
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusConfig.dot)} />
                                    <span className="text-[10px] font-black font-mono text-primary truncate tracking-tighter">
                                        {prop.price}€ // {prop.location}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!currentIsCompact && (
                            <div className="flex flex-wrap gap-2">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className={cn(
                                        "flex items-center gap-2 rounded-md border-2 border-foreground shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] flex-shrink-0",
                                        "px-3 py-1.5 shadow-[3px_3px_0_0_#0D0D0D] dark:shadow-[3px_3px_0_0_rgba(0,0,0,0.2)]",
                                        statusConfig.bg
                                    )}
                                >
                                    <motion.span
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="rounded-full h-2 w-2 statusConfig.dot"
                                    />
                                    <span className="font-mono font-black uppercase tracking-widest text-[9px]">
                                        {statusConfig.label}
                                    </span>
                                </motion.div>
                            </div>
                        )}

                        {!currentIsCompact && (
                            <p className="text-sm md:text-base font-mono text-muted-foreground/60 dark:text-muted-foreground/40 line-clamp-2 leading-[1.3] border-l-2 border-primary/20 pl-4 py-1">
                                {typeof prop.description === 'string' ? prop.description : prop.description?.pt || prop.description?.en || "Alojamento premium."}
                            </p>
                        )}
                    </div>

                    {!isMini && (
                        <div className={cn(
                            "flex items-end justify-between gap-4 relative z-10",
                            isCompact ? "mt-6 pt-4 border-t-2" : "mt-6 pt-5 border-t-2",
                            "border-foreground/5 dark:border-white/5"
                        )}>
                            <div className="flex flex-col group/price min-w-0">
                                {!isMini && <span className="text-[9px] font-mono font-black uppercase text-muted-foreground/40 tracking-[0.3em] mb-0.5">Yield //</span>}
                                <div className="flex items-baseline gap-1">
                                    <span className={cn(
                                        "font-black leading-none tracking-tighter transition-all group-hover/price:text-primary text-foreground",
                                        isMini ? "text-2xl" : isCompact ? "text-4xl" : "text-4xl md:text-5xl"
                                    )}>
                                        {prop.price}€
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {isCompact && (
                                    <div className="flex h-9 items-center gap-1.5 rounded-md border-2 border-foreground bg-background px-2.5 shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] font-mono font-black text-sm">
                                        <Users2 className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                                        <span className="text-foreground">{prop.maxGuests}</span>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit?.(prop) }}
                                        className={cn(
                                            "flex items-center justify-center rounded-md border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0_0_#0D0D0D] dark:hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all outline-none",
                                            isCompact ? "h-9 w-9" : "h-11 w-11"
                                        )}
                                        title="Editar"
                                    >
                                        <Pencil className={isCompact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}