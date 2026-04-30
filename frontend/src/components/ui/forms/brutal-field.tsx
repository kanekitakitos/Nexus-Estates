"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw } from "lucide-react"

// ─── Tipos e Props ────────────────────────────────────────────────────────

/** Propriedades do campo de entrada Brutalist */
export interface BrutalFieldProps {
    /** Etiqueta descritiva do campo */
    label: string
    /** Valor atual em memória */
    value: string | number
    /** Valor original persistido para deteção de alterações */
    savedValue: string | number
    /** Tipo de entrada nativa do browser */
    type?: "text" | "number" | "time" | "date" | "password" | "email"
    /** Ativa a mutação para área de texto multiline */
    multiline?: boolean
    /** Número de linhas iniciais para o modo textarea */
    rows?: number
    /** Callback disparado na alteração do estado local */
    onChange: (val: string | number) => void
    /** Protocolo de reversão para o savedValue */
    onRevert: () => void
    /** Texto de antevisão (opcional) */
    placeholder?: string
    /** Extensão de estilo via classes Tailwind */
    className?: string
    invalid?: boolean
    maxLength?: number
    /** Desativa a interação com o campo */
    disabled?: boolean
}

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/**
 * FieldLabel - Etiqueta superior com tipografia técnica.
 */
function FieldLabel({ label }: { label: string }) {
    return (
        <label className="block font-mono text-[9px] font-black uppercase tracking-[0.4em] text-[#0D0D0D]/65 dark:text-zinc-400 px-1 mb-1">
            {label}
        </label>
    )
}

/**
 * RevertButton - Gatilho de restauração de estado com animação de rotação.
 */
function RevertButton({ onClick }: { onClick: () => void }) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            whileHover={{ rotate: -90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            type="button"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-foreground dark:border-zinc-700 bg-primary text-white shadow-[4px_4px_0_0_#0D0D0D] hover:shadow-[6px_6px_0_0_#0D0D0D] transition-all"
            title="Reverter para o valor original"
        >
            <RotateCcw className="h-6 w-6" strokeWidth={3} />
        </motion.button>
    )
}

/**
 * ChangeIndicator - Meta-informação sobre a divergência de estado.
 */
function ChangeIndicator() {
    return (
        <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[9px] font-mono font-black uppercase tracking-widest text-primary flex items-center gap-2 px-1 mt-2"
        >
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            Modificação Ativa // Não Sincronizada
        </motion.p>
    )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * BrutalField - Primitiva de Input com Arquitetura de Feedback Cinético.
 * 
 * @description Um componente de input de alta fidelidade desenhado sob a estética
 * Editorial Neo-Brutalist. Oferece deteção automática de "dirty state", permitindo
 * reversão imediata e feedback visual através de sombras projetadas e bordas
 * dinâmicas.
 */
export function BrutalField({
    label,
    value,
    savedValue,
    type = "text",
    multiline = false,
    rows = 1,
    onChange,
    onRevert,
    placeholder,
    className,
    invalid = false,
    maxLength,
    disabled = false
}: BrutalFieldProps) {
    /** Determina se o valor local diverge da persistência */
    const isDirty = value !== savedValue
    const displayValue = value ?? ""

    const defaultPlaceholder = placeholder || `DIGITAR ${label.toUpperCase()}...`

    const stateClasses = invalid
        ? "border-rose-500/60 dark:border-rose-500/50 text-foreground dark:text-zinc-100 focus:border-rose-500/70 dark:focus:border-rose-500/70 focus-visible:ring-rose-500/20"
        : isDirty
          ? "border-primary text-primary shadow-[4px_4px_0_0_#F97316]"
          : "border-foreground dark:border-zinc-700 text-foreground dark:text-zinc-100 focus:border-primary dark:focus:border-primary"

    /** Estilização centralizada baseada no estado do campo */
    const fieldClasses = cn(
        "relative w-full px-4 py-3.5 rounded-2xl font-mono text-sm font-bold transition-all duration-300",
        "bg-[#FAFAF5] dark:bg-zinc-900 border-[3px] outline-none",
        "placeholder:text-muted-foreground/40 placeholder:uppercase",
        "focus:bg-white dark:focus:bg-zinc-950 focus:shadow-[6px_6px_0_0_#0D0D0D] focus:-translate-x-1 focus:-translate-y-1",
        disabled && "opacity-50 cursor-not-allowed grayscale",
        multiline && "resize-none min-h-[120px]",
        "focus-visible:ring-2 focus-visible:ring-primary/20",
        stateClasses
    )

    return (
        <div className={cn("group flex flex-col", className)}>
            <FieldLabel label={label} />

            <div className="relative flex gap-3 items-start">
                <div className="relative flex-1">
                    {multiline ? (
                        <textarea
                            rows={rows}
                            value={displayValue}
                            disabled={disabled}
                            onChange={(e) => onChange(e.target.value)}
                            className={fieldClasses}
                            placeholder={defaultPlaceholder}
                            maxLength={maxLength}
                        />
                    ) : (
                        <input
                            type={type}
                            value={displayValue}
                            disabled={disabled}
                            spellCheck={false}
                            onChange={(e) => {
                                const val = type === "number" && e.target.value !== ""
                                    ? Number(e.target.value)
                                    : e.target.value
                                onChange(val)
                            }}
                            className={fieldClasses}
                            placeholder={defaultPlaceholder}
                            maxLength={type === "number" ? undefined : maxLength}
                        />
                    )}
                </div>

                <AnimatePresence>
                    {isDirty && !disabled && (
                        <RevertButton onClick={onRevert} />
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isDirty && !disabled && <ChangeIndicator />}
            </AnimatePresence>
        </div>
    )
}
