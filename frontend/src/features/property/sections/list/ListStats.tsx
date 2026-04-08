import { motion } from "framer-motion"
import { LayoutGrid, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "../../types"

interface ListStatsProps {
    propertys: OwnProperty[]
}

export function ListStats({ propertys }: ListStatsProps) {
    const stats = [
        { 
            label: "Inventário Total", 
            value: propertys.length, 
            icon: <LayoutGrid size={24} />, 
            color: "bg-[#FAF9F6]"
        },
        { 
            label: "Operacional", 
            value: propertys.filter(p => p.status === "AVAILABLE").length, 
            icon: <CheckCircle2 size={24} />, 
            color: "bg-[#E7F6EC]", 
            textColor: "text-emerald-600"
        },
        { 
            label: "Ocupação Ativa", 
            value: propertys.filter(p => p.status === "BOOKED").length, 
            icon: <Clock size={24} />, 
            color: "bg-[#FFF0F0]", 
            textColor: "text-rose-600"
        },
        { 
            label: "Manutenção / Off", 
            value: propertys.filter(p => p.status === "MAINTENANCE").length, 
            icon: <AlertCircle size={24} />, 
            color: "bg-[#FFF9F2]", 
            textColor: "text-amber-600"
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
                <StatBox 
                    key={stat.label}
                    label={stat.label} 
                    value={stat.value} 
                    icon={stat.icon} 
                    color={stat.color} 
                    textColor={stat.textColor}
                    index={idx}
                />
            ))}
        </div>
    )
}

function StatBox({ label, value, icon, color, textColor, index }: { label: string; value: number; icon: React.ReactNode; color: string; textColor?: string; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 20, 
                delay: index * 0.1 
            }}
            whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { type: "spring", stiffness: 450, damping: 12 }
            }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "group relative p-6 rounded-2xl border-[3px] border-foreground flex flex-col justify-between shadow-[6px_6px_0_0_#0D0D0D] hover:shadow-[10px_10px_0_0_#0D0D0D] overflow-hidden min-h-[140px] cursor-pointer transition-all duration-300",
                color
            )}
        >
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-foreground/5 rounded-full blur-3xl group-hover:bg-primary/20 group-hover:scale-150 transition-all duration-700" />
            
            <div className="flex justify-between items-start relative z-10">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">
                    {label} //
                </span>
                <div className={cn("transition-all duration-500 group-hover:rotate-12 group-hover:scale-125", textColor || "text-foreground/40")}>
                    {icon}
                </div>
            </div>

            <div className="mt-6 flex items-end justify-between relative z-10">
                <span className={cn("text-5xl font-black leading-none tracking-tighter", textColor || "text-foreground")}>
                    {value}
                </span>
                
                <div className="flex gap-1.5 items-end h-8 pb-1">
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ height: [8, 20, 8] }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                delay: i * 0.2 + index * 0.1,
                                ease: "easeInOut"
                            }}
                            className={cn("w-2 rounded-full", (value > i * 2) ? (textColor?.replace('text-', 'bg-') || "bg-primary") : "bg-foreground/10")}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
