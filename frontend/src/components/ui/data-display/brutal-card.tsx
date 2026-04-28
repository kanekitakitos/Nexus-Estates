import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const brutalCardShellVariants = cva(
    "border-[3px] border-foreground dark:border-zinc-800 p-8 rounded-[2rem] shadow-[12px_12px_0_0_#0D0D0D] dark:shadow-[12px_12px_0_0_#18181b] transition-all duration-500",
    {
        variants: {
            tone: {
                default: "bg-white dark:bg-zinc-900",
                cream: "bg-[#FAFAF5] dark:bg-zinc-950/50",
            },
        },
        defaultVariants: { tone: "default" },
    }
)

export interface BrutalCardProps extends VariantProps<typeof brutalCardShellVariants> {
    children: ReactNode;
    id?: string;
    title?: ReactNode;
    subtitle?: string;
    icon?: ReactNode;
    iconBgColor?: string;
    iconTextColor?: string;
    className?: string;
    isActive?: boolean;
}

/**
 * BrutalCard - Contentor Padrão de Seções (Rubber Brutalism).
 * 
 * Centraliza o estilo fundos sólidos, bordas espessas e sombras pesadas
 * usadas em todas as seções de formulários/dashboards neo-brutalistas.
 */
export function BrutalCard({ 
    children, 
    id,
    title, 
    subtitle, 
    icon, 
    iconBgColor = "bg-primary/10 border-primary/20", 
    iconTextColor = "text-primary", 
    className,
    isActive = false,
    tone = "default",
}: BrutalCardProps) {
    return (
        <section 
            id={id}
            className={cn(
                brutalCardShellVariants({ tone }),
                isActive ? "ring-4 ring-primary ring-offset-4 ring-offset-background dark:ring-offset-zinc-950 scale-[1.01] z-10" : "z-0",
                className
            )}
        >
            {(title || icon) && (
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {icon && (
                            <div className={cn("p-4 rounded-2xl border-2 flex items-center justify-center", iconBgColor, iconTextColor)}>
                                {icon}
                            </div>
                        )}
                        <div>
                            {subtitle && (
                                <span className={cn("font-mono text-[9px] font-black uppercase tracking-widest block mb-1", iconTextColor)}>
                                    {subtitle}
                                </span>
                            )}
                            {title && (
                                <h3 className="font-black uppercase text-2xl tracking-tighter text-foreground dark:text-white">
                                    {title}
                                </h3>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="w-full relative">
                {children}
            </div>
        </section>
    )
}
