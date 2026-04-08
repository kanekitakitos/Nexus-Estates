import { cn } from "@/lib/utils"
import { BrutalButton } from "@/components/ui/forms/button"
import { BrutalInput } from "@/components/ui/forms/input"
import { Field, FieldLabel } from "@/components/ui/forms/field"
import { RotateCcw } from "lucide-react"

const FIELD_STYLE = "gap-1.5"
const TEXT_STYLE = "font-mono font-black uppercase text-[10px] tracking-widest text-muted-foreground"
const INPUT_STYLE = "border-2 border-foreground bg-background focus:shadow-[4px_4px_0_0_rgb(0,0,0)] dark:focus:shadow-[4px_4px_0_0_rgba(255,255,255,0.8)] rounded-none font-mono font-bold uppercase text-xs md:text-sm flex-1 transition-all duration-200"

interface PropertyInputFieldProps {
    label: string
    value: string | number
    savedValue: string | number
    type?: "text" | "number"
    onChange: (val: string | number) => void
    onRevert: () => void
}

export function PropertyInputField({ label, value, savedValue, type = "text", onChange, onRevert }: PropertyInputFieldProps) {
    const didChange = value !== savedValue

    return (
        <Field className={cn(FIELD_STYLE, "flex-1")}>
            <FieldLabel className={TEXT_STYLE}>{label}</FieldLabel>
            <div className="flex gap-2">
                <BrutalInput
                    value={value || ""}
                    className={INPUT_STYLE}
                    type={type}
                    onChange={(e) => {
                        const val = type === "number" ? Number(e.target.value) : e.target.value
                        onChange(val)
                    }}
                />
                {didChange && (
                    <BrutalButton 
                        className="flex-none px-3 bg-orange-400 text-black border-2 border-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-[2px_2px_0_0_rgb(0,0,0)] hover:shadow-[4px_4px_0_0_rgb(0,0,0)]" 
                        type="button" 
                        onClick={onRevert}
                        title="Revert Change"
                    >
                        <RotateCcw className="w-4 h-4" strokeWidth={3} />
                    </BrutalButton>
                )}
            </div>
        </Field>
    )
}