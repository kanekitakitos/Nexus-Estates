"use client"

import { motion } from "framer-motion"
import { Plus, Sparkles, LayoutGrid, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { PropertyCardItem } from "./components/property-card-item"
import { PropertyFilterBar } from "./components/property-filter-bar"
import { usePropertyFilters } from "./hooks"
import { OwnProperty, PropertyListVariant } from "@/types"
import { staggerContainer, itemFadeUp } from "./animations"

// ─── Sub-Componentes de Layout ──────────────────────────────────────────────

/** Cabeçalho da listagem com título e ação global */
function ListHeader({ onAdd, showAdd }: { onAdd?: () => void; showAdd: boolean }) {
    return (
        <div className="relative border-b-2 border-foreground pb-8 flex flex-col md:flex-row justify-between items-end gap-6 overflow-hidden">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-primary">Nexus_Inventory //</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic">Meus <span className="text-primary underline">Ativos</span></h1>
            </motion.div>

            {showAdd && (
                <button 
                  onClick={onAdd}
                  className="px-8 py-4 bg-primary text-white border-2 border-foreground rounded-xl font-mono text-xs font-black uppercase shadow-[4px_4px_0_0_#0D0D0D] hover:shadow-[6px_6px_0_0_#0D0D0D] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> NOVO_ATIVO //
                </button>
            )}
        </div>
    )
}

/** Shards de Estatísticas do Portefólio */
function ListStats({ propertys }: { propertys: OwnProperty[] }) {
    const stats = [
        { label: "Total", v: propertys.length, c: "bg-white/40", i: <LayoutGrid size={18}/> },
        { label: "Operacional", v: propertys.filter(p=>p.status==="AVAILABLE").length, c: "bg-emerald-50/40", t: "text-emerald-600", i: <CheckCircle2 size={18}/> },
        { label: "Ocupado", v: propertys.filter(p=>p.status==="BOOKED").length, c: "bg-rose-50/40", t: "text-rose-600", i: <Clock size={18}/> },
    ]
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s) => (
                <div key={s.label} className={cn("p-4 border-2 border-foreground rounded-xl shadow-[4px_4px_0_0_#0D0D0D] flex items-center justify-between", s.c)}>
                    <div className="flex flex-col">
                        <span className="font-mono text-[9px] font-black uppercase text-muted-foreground">{s.label} //</span>
                        <span className={cn("text-3xl font-black leading-none mt-1", s.t || "text-foreground")}>{s.v}</span>
                    </div>
                    <div className={s.t || "text-muted-foreground"}>{s.i}</div>
                </div>
            ))}
        </div>
    )
}

/** Grelha de Ativos com animação de cascata */
function AssetGrid({ items, onSelect, onEdit, onDelete }: { items: OwnProperty[]; onSelect?: any; onEdit?: any; onDelete?: any }) {
    if (items.length === 0) return (
        <div className="py-20 border-2 border-dashed border-foreground/20 rounded-3xl flex flex-col items-center text-center bg-white/30 backdrop-blur-sm">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-black uppercase tracking-tighter text-2xl mb-2">Sem Resultados</h3>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Nenhum ativo encontrado para os filtros atuais // Nexus_Null</p>
        </div>
    )

    return (
        <motion.div initial="initial" animate="animate" variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((prop) => (
                <motion.div key={prop.id} variants={itemFadeUp}>
                    <PropertyCardItem prop={prop} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} variant="compact" />
                </motion.div>
            ))}
        </motion.div>
    )
}

// ─── Componente Principal ───────────────────────────────────────────────────

interface PropertyListProps {
    variant?: PropertyListVariant
    addNewProperty?: boolean
    propertys: OwnProperty[]
    onSelect?: (id: string) => void
    onAdd?: () => void
    onEdit?: (prop: OwnProperty) => void
    onDelete?: (id: string) => void | Promise<void>
    isLoading?: boolean
}

/**
 * PropertyList - Módulo de Listagem de Ativos
 * 
 * Componente refatorado para gerir as duas vistas (CARDS/BARS) através de 
 * sub-componentes especializados e filtros desacoplados.
 */
export function PropertyList({ variant = "CARDS", propertys, ...props }: PropertyListProps) {
    const { filters, updateFilter, filteredProperties } = usePropertyFilters(propertys)

    if (variant === "BARS") {
        return (
            <div className="h-full flex flex-col pt-4 overflow-hidden">
                <PropertyFilterBar filters={filters} setFilter={updateFilter} variant="compact" />
                {props.addNewProperty && (
                    <button onClick={props.onAdd} className="w-full h-10 border-2 border-dashed border-foreground/30 rounded-lg font-mono text-[10px] uppercase font-black my-4">
                        [ + ] NOVO_ATIVO
                    </button>
                )}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {filteredProperties.map((prop) => (
                        <PropertyCardItem key={prop.id} prop={prop} onSelect={props.onSelect as any} onEdit={props.onEdit} onDelete={props.onDelete} variant="mini" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-10 py-6">
            <ListHeader onAdd={props.onAdd} showAdd={!!props.addNewProperty} />
            <ListStats propertys={propertys} />

            <div className="space-y-6">
                {props.isLoading ? (
                    <div className="h-40 border-2 border-foreground animate-pulse rounded-xl bg-muted/10"/>
                ) : (
                    <AssetGrid items={filteredProperties} onSelect={props.onSelect} onEdit={props.onEdit} onDelete={props.onDelete} />
                )}
            </div>
        </div>
    )
}