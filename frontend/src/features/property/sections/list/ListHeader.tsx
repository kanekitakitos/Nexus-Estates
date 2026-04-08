import { motion } from "framer-motion"
import { Plus, Sparkles } from "lucide-react"

interface ListHeaderProps {
    addNewProperty?: boolean
    onAdd?: () => void
}

export function ListHeader({ addNewProperty, onAdd }: ListHeaderProps) {
    return (
        <div className="relative border-b-[4px] border-foreground pb-12 overflow-hidden">
            {/* Decorative Background Text */}
            <div className="absolute top-0 right-0 hidden lg:block select-none pointer-events-none opacity-[0.03]">
                <span className="font-black text-[120px] uppercase tracking-tighter leading-none italic block -mr-10">
                    PROPERTIES
                </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <motion.div 
                            animate={{ rotate: [0, 90, 180, 270, 360] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="h-10 w-10 flex items-center justify-center rounded-md border-2 border-foreground bg-primary shadow-[3px_3px_0_0_#0D0D0D]"
                        >
                            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={3} />
                        </motion.div>
                        <span className="font-mono text-xs font-black uppercase tracking-[0.4em] text-primary underline underline-offset-8 decoration-primary/30 decoration-4">
                            Inventory Management //
                        </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.8] italic">
                        Meu <br />
                        <span className="text-primary group relative">
                            Portfólio
                            <motion.div 
                                className="absolute -bottom-2 left-0 h-3 bg-foreground/10 -z-10"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </span>
                    </h1>
                    
                    <p className="font-mono text-sm font-black text-muted-foreground uppercase tracking-widest max-w-xl leading-relaxed">
                        Controlo operacional e monitorização de ativos imobiliários Nexus em tempo real / redundância redundante.
                    </p>
                </motion.div>

                {addNewProperty && (
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                    >
                        <motion.button
                            onClick={onAdd}
                            whileHover="hover"
                            whileTap="tap"
                            className="group relative flex items-center gap-6 px-10 py-7 bg-primary border-[4px] border-foreground rounded-2xl shadow-[12px_12px_0_0_#0D0D0D] hover:shadow-[16px_16px_0_0_#0D0D0D] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            <motion.div 
                                className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-25 transition-opacity"
                                variants={{
                                    hover: { rotate: 360, scale: 1.5, transition: { duration: 10, repeat: Infinity, ease: "linear" } }
                                }}
                            >
                                <Sparkles className="w-32 h-32 text-white" strokeWidth={4} />
                            </motion.div>

                            <div className="relative z-10 flex items-center gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl border-[3px] border-foreground bg-background shadow-[4px_4px_0_0_#0D0D0D] group-hover:bg-primary group-hover:text-primary-foreground transition-colors overflow-hidden">
                                    <motion.div
                                        variants={{
                                            hover: { rotate: 90, scale: 1.2 }
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <Plus className="w-8 h-8" strokeWidth={5} />
                                    </motion.div>
                                </div>
                                
                                <div className="flex flex-col items-start">
                                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.5em] text-white/60 mb-1">
                                        Nexus_Terminal //
                                    </span>
                                    <span className="text-2xl font-black uppercase tracking-tighter text-white italic">
                                        Adicionar_Ativo
                                    </span>
                                </div>
                            </div>

                            <motion.div
                                className="absolute top-0 right-0 h-full w-2 bg-foreground"
                                variants={{
                                    hover: { width: "12px" }
                                }}
                            />
                        </motion.button>

                        <div className="absolute -top-3 -right-3 px-3 py-1 bg-white border-2 border-foreground rounded-full text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_#0D0D0D] rotate-12 group-hover:rotate-0 transition-transform">
                            LIVE //
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
