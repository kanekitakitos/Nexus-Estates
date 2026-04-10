"use client"

import { motion } from "framer-motion"

import { useMemo } from "react"
import { LayoutGrid, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { BrutalStatCard } from "@/components/ui/data-display/brutal-stat-card"
import { BoingText } from "@/components/BoingText"
import { staggerContainer, statCardVariants } from "../animations"
import { useEffect, useState } from "react"

// ─── Tipos e Props ────────────────────────────────────────────────────────

/** Propriedades do dashboard de estatísticas de ativos */
export interface PropertyStatsProps {
    /** Lista de ativos para agregação de dados */
    propertys: OwnProperty[]
    /** Classes CSS adicionais para o contentor grid */
    className?: string
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * AnimatedCounter - Componente de transição numérica fluida.
 */
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let start = 0
        const end = value
        if (start === end) return
        
        const totalMiliseconds = duration
        const incrementTime = (totalMiliseconds / end) > 10 ? (totalMiliseconds / end) : 10
        
        const timer = setInterval(() => {
            start += 1
            setCount(start)
            if (start === end) clearInterval(timer)
        }, incrementTime)

        return () => clearInterval(timer)
    }, [value, duration])

    return <>{count.toString().padStart(2, '0')}</>
}

/**
 * PropertyStats - Painel de Indicadores de Desempenho (KPIs).
 * 
 * @description Providencia uma visão consolidada do estado operacional da frota
 * de ativos Nexus. Utiliza cartões de alto contraste (Neo-Brutalist) para destacar
 * métricas críticas como disponibilidade, manutenção e ocupação total.
 * Integra o componente BoingText para interatividade cinética nos títulos.
 */
export function PropertyStats({ propertys, className }: PropertyStatsProps) {
    /** Agrega os dados dos ativos em objectos de configuração para os cartões */
    const statsData = useMemo(() => [
        {
            label: "Total_Ativos",
            value: propertys.length,
            color: "text-primary",
            glowColor: "bg-primary",
            icon: LayoutGrid,
            suffix: "SYS"
        },
        {
            label: "Operacional",
            value: propertys.filter(p => p.status === "AVAILABLE").length,
            color: "text-emerald-500",
            glowColor: "bg-emerald-500",
            icon: CheckCircle2,
            suffix: "OK"
        },
        {
            label: "Indisponível",
            value: propertys.filter(p => p.status === "BOOKED" || p.status === "MAINTENANCE").length,
            color: "text-rose-500",
            glowColor: "bg-rose-500",
            icon: Clock,
            suffix: "LIVE"
        },
    ], [propertys])

    return (
        <motion.div 
            initial="initial" 
            animate="animate" 
            variants={staggerContainer}
            className={cn("grid grid-cols-1 sm:grid-cols-3 gap-8", className)}
        >
            {statsData.map((item, idx) => (
                <motion.div key={item.label} variants={statCardVariants} custom={idx}>
                    <BrutalStatCard
                        label={
                            <BoingText 
                                text={item.label} 
                                color="currentColor" 
                                activeColor="#F97316" 
                                stagger={0.03}
                            />
                        }
                        value={<AnimatedCounter value={item.value} />}
                        color={item.color}
                        glowColor={item.glowColor}
                        icon={item.icon}
                        suffix={item.suffix}
                        bgColor="bg-[#FAFAF5] dark:bg-zinc-950"
                    />
                </motion.div>
            ))}
        </motion.div>
    )
}