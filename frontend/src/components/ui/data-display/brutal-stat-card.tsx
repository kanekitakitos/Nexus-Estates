import { LucideIcon, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface BrutalStatCardProps {
    label: string;
    value: number | string;
    color: string;
    glowColor: string;
    bgColor?: string;
    icon: LucideIcon;
    suffix?: string;
    pulseColor?: string;
    className?: string;
}

const statCardVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: (i: number) => ({
        opacity: 1, scale: 1, y: 0,
        transition: { delay: i * 0.1, type: "spring" as const, stiffness: 100, damping: 12 }
    }),
    hover: { 
        scale: 1.02, y: -2,
        boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
        transition: { type: "spring" as const, stiffness: 400, damping: 10 }
    }
}

const healthBarPulse = {
    initial: { scaleY: 0.1, opacity: 0.2 },
    animate: (i: number) => ({
        scaleY: [0.1, 1, 0.4, 0.8, 0.2],
        opacity: [0.2, 1, 0.5, 0.8, 0.3],
        transition: {
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            repeatType: "mirror" as const,
            delay: i * 0.1,
            ease: "easeInOut" as const
        }
    })
}

/**
 * BrutalStatCard - Cartão de Estatísticas em Rubber Brutalism
 * 
 * Reutilizável em qualquer dashboard para mostrar KPIs com animações pulsantes,
 * equalizadores de saúde, e design Neo-Brutalista Premium.
 */
export function BrutalStatCard({
    label,
    value,
    color,
    glowColor,
    bgColor = "bg-[#FAFAF5] dark:bg-zinc-950",
    icon: Icon,
    suffix = "SYS",
    pulseColor,
    className
}: BrutalStatCardProps) {
    
    const parsedValue = typeof value === 'number' ? value : 10;
    const resolvedPulseBg = pulseColor || color.replace('text', 'bg');

    return (
        <motion.div
            variants={statCardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className={cn(
                "relative group p-6 border-[3px] border-foreground dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-[8px_8px_0_0_#0D0D0D]",
                "dark:shadow-[8px_8px_0_0_rgba(24,24,27,1)] transition-all duration-300",
                bgColor,
                className
            )}
        >
            {/* Noise & Glow Layers */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.1] contrast-125 mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
            />
            <div className={cn(
                "absolute -right-4 -top-4 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700",
                glowColor
            )} />

            {/* Content */}
            <div className="relative z-10 space-y-6">
                
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-3 rounded-2xl border-[3px] border-foreground dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[4px_4px_0_0_#0D0D0D]",
                            "transition-transform group-hover:-rotate-3"
                        )}>
                            <Icon className={cn("w-5 h-5", color)} strokeWidth={3} />
                        </div>
                        <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground whitespace-nowrap">
                            {label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 dark:bg-white/5 rounded-xl border-2 border-foreground/10 dark:border-white/10 shadow-inner">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]", resolvedPulseBg)} />
                        <Activity className="w-3 h-3 opacity-40 text-foreground dark:text-zinc-400" />
                    </div>
                </div>

                {/* Display Principal */}
                <div className="flex items-end justify-between border-b-[3px] border-foreground/5 dark:border-white/5 pb-6">
                    <div className="flex items-baseline gap-2">
                        <span
                            className={cn(
                                "text-6xl font-black tracking-tighter italic drop-shadow-[3px_3px_0px_rgba(0,0,0,0.15)]",
                                color
                            )}
                            style={{ WebkitTextStroke: "1px rgba(0,0,0,0.05)" }}
                        >
                            {typeof value === 'number' ? value.toString().padStart(2, '0') : value}
                        </span>
                        <span className="font-mono text-[11px] font-bold uppercase opacity-40">
                            {suffix}
                        </span>
                    </div>
                    <div className="text-[9px] font-mono font-black uppercase text-muted-foreground vertical-rl rotate-180 opacity-20 tracking-widest">
                        NEXUS_METRICS
                    </div>
                </div>

                {/* Equalizador */}
                <div className="flex gap-2 h-1.5">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            variants={healthBarPulse}
                            custom={i}
                            initial="initial"
                            animate="animate"
                            className={cn(
                                "flex-1 rounded-sm",
                                i < (parsedValue % 10 || 5) ? resolvedPulseBg : "bg-foreground/10 dark:bg-zinc-800"
                            )}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
