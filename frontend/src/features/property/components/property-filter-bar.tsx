import { motion } from "framer-motion"
import { Search, SlidersHorizontal, ArrowUpDown, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/overlay/dropdown-menu"

interface PropertyFilterBarProps {
    /** Estado completo dos filtros vindo do hook usePropertyFilters */
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
    /** Função para atualizar critérios individuais de pesquisa */
    setFilter: (key: string, value: any) => void
    /** Define a densidade visual (default para páginas, compact para sidebars) */
    variant?: "default" | "compact"
}

/** Configuração dos filtros de status com os seus respetivos gradientes e etiquetas */
const STATUS_FILTERS = [
    { key: "available", label: "Disponível" },
    { key: "booked", label: "Ocupada" },
    { key: "maintenance", label: "Manutenção" },
]

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/** Cabeçalho da barra de filtros com iconografia e título */
function FilterHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-primary shadow-[2px_2px_0_0_#0D0D0D]">
                <SlidersHorizontal className="h-5 w-5 text-primary-foreground" strokeWidth={3} />
            </div>
            <div>
                <span className="font-mono text-[9px] font-black uppercase tracking-widest text-primary leading-none block mb-0.5">00 // Filtros</span>
                <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Explorar</h3>
            </div>
        </div>
    )
}

/** Grupo de botões de filtro por estado do ativo */
function StatusFilterGroup({ filters, setFilter, isCompact }: { filters: any; setFilter: any; isCompact: boolean }) {
    return (
        <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => {
                const isActive = filters[status.key]
                return (
                    <button
                        key={status.key}
                        onClick={() => setFilter(status.key, !isActive)}
                        title={`Filtrar por ${status.label}`}
                        className={cn(
                            "rounded-md font-mono font-black uppercase tracking-widest border-2 border-foreground transition-all duration-200",
                            isActive 
                                ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_#0D0D0D] -translate-x-0.5 -translate-y-0.5" 
                                : "bg-muted/10 text-muted-foreground hover:bg-muted/20",
                            isCompact ? "px-2 py-1 text-[8px]" : "px-3 py-1.5 text-[9px]"
                        )}
                    >
                        {status.label.slice(0, 4)}
                    </button>
                )
            })}
        </div>
    )
}

/** Campo de input numérico para limites de preço */
function PriceInput({ placeholder, value, onChange }: { placeholder: string; value: number | ""; onChange: (e: any) => void }) {
    return (
        <div className="relative w-full max-w-[80px]">
            <input
                type="number" placeholder={placeholder} value={value} onChange={onChange}
                className="w-full px-3 py-2 rounded-md bg-muted/5 border-2 border-foreground focus:bg-background focus:shadow-[2px_2px_0_0_#0D0D0D] outline-none font-mono font-black text-[10px] transition-all placeholder:text-muted-foreground/30 uppercase tracking-widest"
            />
        </div>
    )
}

/** Dropdown de ordenação (Nexus_Sort) */
function SortDropdown({ currentSort, onSort, isCompact }: { currentSort: string; onSort: (v: string) => void; isCompact: boolean }) {
    const options = [
        { val: "sem filtro", label: "Padrão" },
        { val: "crescente", label: "Asc" },
        { val: "decrescente", label: "Desc" }
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "flex items-center justify-center gap-2 rounded-md border-2 border-foreground bg-primary/10 font-mono font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-primary",
                    isCompact ? "px-2 py-1 text-[8px]" : "px-4 py-2 text-[9px]"
                )}>
                    <ArrowUpDown className={isCompact ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={3} />
                    <span>{currentSort === "sem filtro" ? "ORDEM" : currentSort.slice(0, 4)}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-2 border-foreground shadow-[4px_4px_0_0_#0D0D0D] p-1 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                <DropdownMenuRadioGroup value={currentSort}>
                    {options.map((item) => (
                        <DropdownMenuRadioItem
                            key={item.val} value={item.val} onClick={() => onSort(item.val)}
                            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
                        >
                            {item.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

/** Input de pesquisa textual com ícone */
function SearchInput({ icon, placeholder, value, onChange, isCompact }: { icon: any; placeholder: string; value: string; onChange: (e: any) => void; isCompact?: boolean }) {
    return (
        <div className="relative group w-full">
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-300", isCompact ? "left-3" : "left-3.5")}>
                {icon}
            </div>
            <input
                type="search" placeholder={placeholder} value={value} onChange={onChange}
                className={cn(
                    "w-full pr-4 rounded-md bg-muted/5 border-2 border-foreground focus:bg-background focus:shadow-[3px_3px_0_0_#0D0D0D] outline-none font-mono font-bold transition-all placeholder:text-muted-foreground/30 placeholder:font-black uppercase tracking-widest",
                    isCompact ? "pl-9 py-2 text-[9px]" : "pl-10 pr-4 py-3 text-[10px]"
                )}
            />
        </div>
    )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * PropertyFilterBar - Motor de Pesquisa e Filtragem Nexus.
 * 
 * Componente refatorado para maior clareza, utilizando sub-componentes para 
 * gerir a complexidade visual entre os modos default e compact.
 */
export function PropertyFilterBar({ filters, setFilter, variant = "default" }: PropertyFilterBarProps) {
    const isCompact = variant === "compact"

    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className={cn(
                "sticky top-0 z-20 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b-2 border-foreground",
                isCompact ? "p-3 space-y-3" : "p-4 md:p-6 space-y-4 md:space-y-6"
            )}
        >
            {!isCompact && <FilterHeader />}

            <div className="grid gap-2">
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

            <div className={cn("flex flex-wrap items-center gap-2", isCompact ? "justify-start" : "justify-between pt-2 border-t border-foreground/5")}>
                <StatusFilterGroup filters={filters} setFilter={setFilter} isCompact={isCompact} />

                <div className="flex items-center gap-2">
                    {!isCompact && (
                        <>
                            <PriceInput 
                                placeholder="MIN" value={filters.minPrice} 
                                onChange={(e) => setFilter("minPrice", e.target.value === "" ? "" : Number(e.target.value))} 
                            />
                            <PriceInput 
                                placeholder="MAX" value={filters.maxPrice} 
                                onChange={(e) => setFilter("maxPrice", e.target.value === "" ? "" : Number(e.target.value))} 
                            />
                        </>
                    )}

                    <SortDropdown currentSort={filters.sortPrice} onSort={(v) => setFilter("sortPrice", v)} isCompact={isCompact} />
                </div>
            </div>
        </motion.div>
    )
}