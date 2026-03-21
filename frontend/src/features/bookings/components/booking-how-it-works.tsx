/**
 * @description
 * Ficheiro para implementar um componete para servir de guia visual do Processo de Reserva
 * 
 * @version 1.0
 */

import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { BrutalCard } from "@/components/ui/data-display/card"
import { Badge } from "@/components/ui/badge"
import { motion, useReducedMotion } from "framer-motion"

interface BookingHowItWorksProps {
    mode?: "default" | "card"
    className?: string
}

/**
 * Componente Informativo: Como Funciona (How It Works).
 * 
 * Um cartão visualmente rico que explica o processo de reserva em 3 passos simples.
 * Utiliza um design "brutalista" com sombras fortes e elementos decorativos.
 * 
 * Ideal para ser exibido na barra lateral ou em seções de ajuda.
 * 
 * @param mode - Modo de exibição (atualmente suporta "default" e "card").
 * @param className - Classes CSS adicionais para customização de layout.
 */
export function BookingHowItWorks({ mode: _mode = "default", className }: BookingHowItWorksProps) {
    const shouldReduceMotion = useReducedMotion()
    const compact = _mode === "card"

    return (
        <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -6, x: 2 }}
            whileTap={shouldReduceMotion ? undefined : { y: -2, x: 0, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn("h-full w-full", className)}
        >
            <BrutalCard variant="primary" className="group relative h-full w-full overflow-hidden flex flex-col justify-between">
                <HeaderSection compact={compact} />
                <StepsSection compact={compact} />
                <DecorativeBackground />
            </BrutalCard>
        </motion.div>
    )
}

// --- Sub-components ---

/**
 * Subcomponente: Cabeçalho do Cartão.
 * 
 * Exibe o ícone de "Guia" e o título principal "How it works".
 */
function HeaderSection({ compact }: { compact: boolean }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-full border-[2px] border-foreground bg-background flex items-center justify-center shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.9)]">
                    <Users className="w-5 h-5 text-foreground" />
                </div>
                <Badge variant="brutal" className="-rotate-3">
                    Guide
                </Badge>
            </div>
            
            <h3
                className={cn(
                    "font-mono font-black uppercase leading-[0.85] text-primary-foreground drop-shadow-[3px_3px_0_rgb(0,0,0)] break-words",
                    compact ? "text-2xl" : "text-3xl"
                )}
            >
                How it<br/>works
            </h3>
        </div>
    )
}

/**
 * Subcomponente: Lista de Passos.
 * 
 * Renderiza os passos do processo (Browse, Book, Enjoy) como badges interativos.
 * Cada passo tem um número e um rótulo descritivo.
 */
function StepsSection({ compact }: { compact: boolean }) {
    const shouldReduceMotion = useReducedMotion()

    const steps = [
        { step: 1, label: "Browse" },
        { step: 2, label: "Book" },
        { step: 3, label: "Enjoy" }
    ]

    return (
        <div className="flex flex-col gap-3 mt-4">
            {steps.map((item) => (
                <motion.div
                    key={item.step}
                    whileHover={shouldReduceMotion ? undefined : { x: 6 }}
                    whileTap={shouldReduceMotion ? undefined : { x: 2, scale: 0.99 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Badge variant="brutal" className={cn("w-full justify-start gap-3 rounded-md", compact ? "p-1.5" : "p-2")}>
                        <div className="flex items-center justify-center w-6 h-6 border-[2px] border-foreground bg-primary text-primary-foreground font-mono text-xs font-bold ">{item.step}</div>
                        <span className="font-mono text-sm font-bold text-foreground uppercase">{item.label}</span>
                    </Badge>
                </motion.div>
            ))}
        </div>
    )
}

/**
 * Subcomponente: Fundo Decorativo.
 * 
 * Adiciona elementos visuais abstratos (círculos, blur) para enriquecer o design
 * sem interferir na legibilidade do conteúdo.
 */
function DecorativeBackground() {
    return (
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-background/10 rounded-full blur-xl pointer-events-none" />
    )
}
