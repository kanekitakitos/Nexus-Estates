import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { floating, gentleRotate } from "../../animations"

export function EmptyState() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-[500px] w-full border-[4px] border-foreground rounded-[40px] bg-transparent overflow-hidden flex flex-col items-center justify-center p-12 shadow-[12px_12px_0_0_#0D0D0D]"
        >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                    variants={floating}
                    animate="animate"
                    className="absolute -top-10 -left-10 w-40 h-40 border-[3px] border-primary/20 rounded-full"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg space-y-8">
                <motion.div
                    variants={gentleRotate}
                    animate="animate"
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary blur-3xl opacity-20 scale-150" />
                    <div className="h-32 w-32 bg-foreground rounded-3xl flex items-center justify-center shadow-[8px_8px_0_0_#FF5F1F]">
                        <AlertCircle className="h-16 w-16 text-white" strokeWidth={3} />
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <span className="font-mono text-xs font-black uppercase tracking-[0.5em] text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                        ERR://NULL_INVENTORY_DETECTED
                    </span>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8] italic">
                        Onde estão <br />
                        <span className="text-primary underline decoration-foreground decoration-[6px]">As Casas?</span>
                    </h2>
                    <p className="font-mono text-sm font-black text-muted-foreground uppercase tracking-widest leading-relaxed pt-4">
                        O sistema Nexus executou uma varredura completa mas o inventário retornou zero ativos. / Talvez devas criar o teu primeiro império imobiliário agora?
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
