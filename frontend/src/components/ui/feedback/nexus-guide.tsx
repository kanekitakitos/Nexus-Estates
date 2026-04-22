"use client"
 
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, ArrowRight } from "lucide-react"
import { createPortal } from "react-dom"
import { useSyncExternalStore } from "react"
 
export interface NexusGuideStep {
    id: string;
    title: string;
    content: string;
}

export interface NexusGuideProps {
    /** 1-indexed step current position */
    step: number;
    /** Total number of steps available */
    totalSteps: number;
    /** The content shown in the guide box */
    content: React.ReactNode;
    /** System/context name to show in the header */
    contextName?: string;
    /** Function to move to next step */
    onNext: () => void;
    /** Function to skip the entire guide */
    onSkip: () => void;
    /** Function when reaching the end of the guide */
    onEnd: () => void;
}
 
/**
 * NexusGuide - Global Floating Assistant (via Portal)
 * 
 * Uses React Portal to escape any parent stacking contexts/overflows 
 * and render at the very top of the application layer.
 * A premium, rubber neobrutalist floating guide that onboards users.
 */
export function NexusGuide({ step, totalSteps, content: stepContent, contextName = "Nexus System", onNext, onSkip, onEnd }: NexusGuideProps) {
    const mounted = useSyncExternalStore(
        (onStoreChange) => {
            onStoreChange()
            return () => {}
        },
        () => true,
        () => false
    )
 
    const content = (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                drag
                dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
                style={{ zIndex: 999999 }}
                className="fixed bottom-8 right-8 w-[380px] pointer-events-none"
            >
                <motion.div 
                    layout
                    className="bg-white dark:bg-zinc-900 border-[4px] border-foreground dark:border-zinc-700 rounded-[3rem] shadow-[30px_30px_0_0_#0D0D0D] p-10 pointer-events-auto relative overflow-hidden ring-4 ring-white/20"
                >
                    {/* Glowing Accent */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-orange-500" />
                    
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-3xl bg-primary border-2 border-foreground dark:border-zinc-700 flex items-center justify-center shadow-[6px_6px_0_0_#0D0D0D] -rotate-6 group-hover:rotate-0 transition-transform cursor-grab active:cursor-grabbing">
                                    <Sparkles size={32} className="text-white animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-black uppercase text-xl tracking-tighter leading-none text-foreground dark:text-white">Nexus Assistant</h4>
                                    <span className="font-mono text-[11px] font-black text-primary uppercase mt-1 animate-pulse">{contextName} 0{step}</span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEnd(); }}
                                className="p-2.5 bg-foreground/10 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border-2 border-transparent hover:border-foreground"
                            >
                                <X size={22} strokeWidth={4} />
                            </button>
                        </div>
 
                        <div className="bg-foreground/5 dark:bg-white/5 p-7 rounded-[2rem] border-2 border-dashed border-foreground/20 dark:border-white/20 relative shadow-inner">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="min-h-[110px] flex items-center"
                                >
                                    <p className="font-mono text-[13px] font-black leading-relaxed text-foreground dark:text-zinc-100">
                                        {stepContent}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
 
                        <div className="flex items-center justify-between pt-4">
                            <button 
                                onClick={onSkip} 
                                className="font-mono text-[12px] uppercase font-black text-muted-foreground hover:text-rose-500 transition-colors tracking-widest"
                            >
                                Skip_Tutorial
                            </button>
                            
                            <button 
                                onClick={onNext} 
                                className="h-16 px-12 bg-primary text-primary-foreground border-4 border-foreground rounded-[1.5rem] font-black uppercase text-[13px] shadow-[8px_8px_0_0_#0D0D0D] hover:shadow-[4px_4px_0_0_#0D0D0D] hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-4 group/btn"
                            >
                                {step < totalSteps ? "Next_Step" : "Finalize"}
                                <ArrowRight size={22} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={4} />
                            </button>
                        </div>
                    </div>
 
                    {/* Progress indicator bottom bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-foreground/10 dark:bg-white/10">
                        <motion.div 
                            initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
                            animate={{ width: `${(step / totalSteps) * 100}%` }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="h-full bg-primary"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
 
    if (!mounted) return null
 
    return createPortal(content, document.body)
}
