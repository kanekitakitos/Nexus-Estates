import { motion } from "framer-motion"
import { Plus, Sparkles, LayoutGrid, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"

// ─── List Header ───────────────────────────────────────────────────────────

export function ListHeader({ addNewProperty, onAdd }: { addNewProperty?: boolean, onAdd?: () => void }) {
    return (
        <div className="relative border-b-2 border-foreground pb-8 flex flex-col md:flex-row justify-between items-end gap-6 overflow-hidden">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-primary">Nexus_Inventory //</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic">Meus <span className="text-primary underline">Ativos</span></h1>
            </motion.div>

            {addNewProperty && (
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

// ─── List Stats ────────────────────────────────────────────────────────────

export function ListStats({ propertys }: { propertys: OwnProperty[] }) {
    const stats = [
        { label: "Total", v: propertys.length, c: "bg-white/40", i: <LayoutGrid size={18}/> },
        { label: "Operacional", v: propertys.filter(p=>p.status==="AVAILABLE").length, c: "bg-emerald-50/40", t: "text-emerald-600", i: <CheckCircle2 size={18}/> },
        { label: "Ocupado", v: propertys.filter(p=>p.status==="BOOKED").length, c: "bg-rose-50/40", t: "text-rose-600", i: <Clock size={18}/> },
    ]
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s, idx) => (
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

// ─── Empty State ───────────────────────────────────────────────────────────

export function EmptyState() {
    return (
        <div className="py-20 border-2 border-dashed border-foreground/20 rounded-3xl flex flex-col items-center text-center bg-white/30 backdrop-blur-sm">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-black uppercase tracking-tighter text-2xl mb-2">Sem Resultados</h3>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Nenhum ativo encontrado para os filtros atuais // Nexus_Null</p>
        </div>
    )
}
