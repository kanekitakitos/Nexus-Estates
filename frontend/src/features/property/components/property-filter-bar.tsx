import { forwardRef, ComponentProps } from "react"
import { motion } from "framer-motion"
import { Search, SlidersHorizontal, ArrowUpDown, MapPin } from "lucide-react"
import { Input } from "@/components/ui/forms/input"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/overlay/dropdown-menu"

interface PropertyFilterBarProps {
    filters: {
        queryNome: string
        queryLocal: string
        available: boolean
        booked: boolean
        maintenance: boolean
        minPrice: number | ""
        maxPrice: number | ""
        sortPrice: "sem filtro" | "crescente" | "decrescente"
    }
    setFilter: (key: string, value: any) => void
    variant?: "default" | "compact"
}

const STATUS_FILTERS = [
    { key: "available", label: "Disponível", gradient: "from-emerald-500 to-teal-600" },
    { key: "booked", label: "Ocupada", gradient: "from-rose-500 to-pink-600" },
    { key: "maintenance", label: "Manutenção", gradient: "from-amber-500 to-orange-600" },
]

export function PropertyFilterBar({ filters, setFilter, variant = "default" }: PropertyFilterBarProps) {
    const isCompact = variant === "compact"

    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "sticky top-0 z-20 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b-2 border-foreground",
                isCompact ? "p-3 space-y-3" : "p-4 md:p-6 space-y-4 md:space-y-6"
            )}
        >
            {/* Main Search & Minimal Header */}
            {!isCompact && (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-primary shadow-[2px_2px_0_0_#0D0D0D]">
                        <SlidersHorizontal className="h-5 w-5 text-primary-foreground" strokeWidth={3} />
                    </div>
                    <div>
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-primary leading-none block mb-0.5">00 // Filtros</span>
                        <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Explorar</h3>
                    </div>
                </div>
            )}

            <div className={cn("grid gap-2", isCompact ? "grid-cols-1" : "grid-cols-1")}>
                <SearchInput
                    icon={<Search className="h-4 w-4" strokeWidth={3} />}
                    placeholder={isCompact ? "PESQUISAR..." : "PESQUISAR ATIVO..."}
                    value={filters.queryNome}
                    onChange={(e) => setFilter("queryNome", e.target.value)}
                    isCompact={isCompact}
                />
                {!isCompact && (
                    <SearchInput
                        icon={<MapPin className="h-4 w-4" strokeWidth={3} />}
                        placeholder="CIDADE / ZONA..."
                        value={filters.queryLocal}
                        onChange={(e) => setFilter("queryLocal", e.target.value)}
                    />
                )}
            </div>

            {/* Compact Row for Status & Sort */}
            <div className={cn(
                "flex flex-wrap items-center gap-2",
                isCompact ? "justify-start" : "justify-between pt-2 border-t border-foreground/5"
            )}>
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((status) => (
                        <button
                            key={status.key}
                            onClick={() => setFilter(status.key, !filters[status.key as keyof typeof filters])}
                            className={cn(
                                "rounded-md font-mono font-black uppercase tracking-widest border-2 border-foreground transition-all duration-200",
                                filters[status.key as keyof typeof filters]
                                    ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_#0D0D0D] -translate-x-0.5 -translate-y-0.5"
                                    : "bg-muted/10 text-muted-foreground hover:bg-muted/20",
                                isCompact ? "px-2 py-1 text-[8px]" : "px-3 py-1.5 text-[9px]"
                            )}
                        >
                            {status.label.slice(0, 4)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {!isCompact && (
                        <>
                            <PriceInput
                                placeholder="MIN"
                                value={filters.minPrice}
                                onChange={(e) => setFilter("minPrice", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                            <PriceInput
                                placeholder="MAX"
                                value={filters.maxPrice}
                                onChange={(e) => setFilter("maxPrice", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                        </>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "flex items-center justify-center gap-2 rounded-md border-2 border-foreground bg-primary/10 font-mono font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-primary",
                                isCompact ? "px-2 py-1 text-[8px]" : "px-4 py-2 text-[9px]"
                            )}>
                                <ArrowUpDown className={isCompact ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={3} />
                                <span>{filters.sortPrice === "sem filtro" ? "ORDEM" : filters.sortPrice.slice(0, 4)}</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-2 border-foreground shadow-[4px_4px_0_0_#0D0D0D] p-1 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                            <DropdownMenuRadioGroup value={filters.sortPrice}>
                                {[
                                    { val: "sem filtro", label: "Padrão" },
                                    { val: "crescente", label: "Asc" },
                                    { val: "decrescente", label: "Desc" }
                                ].map((item) => (
                                    <DropdownMenuRadioItem
                                        key={item.val}
                                        value={item.val}
                                        onClick={() => setFilter("sortPrice", item.val)}
                                        className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
                                    >
                                        {item.label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </motion.div>
    )
}

// Helper Components

function SearchInput({
                         icon,
                         placeholder,
                         value,
                         onChange,
                         isCompact
                     }: {
    icon: React.ReactNode
    placeholder: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    isCompact?: boolean
}) {
    return (
        <div className="relative group w-full">
            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-300",
                isCompact ? "left-3" : "left-3.5"
            )}>
                {icon}
            </div>
            <input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={cn(
                    "w-full pr-4 rounded-md bg-muted/5 border-2 border-foreground focus:bg-background focus:shadow-[3px_3px_0_0_#0D0D0D] outline-none font-mono font-bold transition-all placeholder:text-muted-foreground/30 placeholder:font-black uppercase tracking-widest",
                    isCompact ? "pl-9 py-2 text-[9px]" : "pl-10 pr-4 py-3 text-[10px]"
                )}
            />
        </div>
    )
}

function PriceInput({
                        placeholder,
                        value,
                        onChange
                    }: {
    placeholder: string
    value: number | ""
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <div className="relative w-full max-w-[80px]">
            <input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-md bg-muted/5 border-2 border-foreground focus:bg-background focus:shadow-[2px_2px_0_0_#0D0D0D] outline-none font-mono font-black text-[10px] transition-all placeholder:text-muted-foreground/30 uppercase tracking-widest"
            />
        </div>
    )
}