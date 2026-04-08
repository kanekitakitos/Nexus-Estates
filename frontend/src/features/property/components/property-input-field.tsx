import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw } from "lucide-react"

interface PropertyInputFieldProps {
    label: string
    value: string | number
    savedValue: string | number
    type?: "text" | "number"
    onChange: (val: string | number) => void
    onRevert: () => void
}

export function PropertyInputField({
                                       label,
                                       value,
                                       savedValue,
                                       type = "text",
                                       onChange,
                                       onRevert
                                   }: PropertyInputFieldProps) {
    const didChange = value !== savedValue

    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-mono font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                {label}
            </label>

            <div className="relative flex gap-3 items-center">
                <div className="relative flex-1 group">
                    <input
                        type={type}
                        value={value || ""}
                        onChange={(e) => {
                            const val = type === "number" ? Number(e.target.value) : e.target.value
                            onChange(val)
                        }}
                        className={cn(
                            "relative w-full px-4 py-3.5 rounded-xl font-mono text-sm font-bold",
                            "bg-muted/5 border-2 transition-all duration-200",
                            "placeholder:text-muted-foreground/30 placeholder:uppercase",
                            "focus:outline-none focus:bg-background focus:shadow-[4px_4px_0_0_#0D0D0D] focus:-translate-x-0.5 focus:-translate-y-0.5",
                            didChange
                                ? "border-primary text-primary shadow-[3px_3px_0_0_#e2621c]"
                                : "border-foreground focus:border-primary focus:shadow-[4px_4px_0_0_#e2621c]"
                        )}
                        placeholder={`DIGITAR ${label.toUpperCase()}...`}
                    />
                </div>

                <AnimatePresence>
                    {didChange && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: 10 }}
                            whileHover={{ rotate: -180, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onRevert}
                            type="button"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_#0D0D0D] hover:shadow-[5px_5px_0_0_#0D0D0D] transition-all"
                            title="Reverter alteração"
                        >
                            <RotateCcw className="h-5 w-5" strokeWidth={3} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {didChange && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[9px] font-mono font-black uppercase tracking-widest text-primary flex items-center gap-2 px-1"
                    >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Alteração não guardada //
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}