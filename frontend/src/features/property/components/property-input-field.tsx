import { cn } from "@/lib/utils"
import { BrutalButton } from "@/components/ui/forms/button"
import { BrutalInput } from "@/components/ui/forms/input"
import { Field, FieldLabel } from "@/components/ui/forms/field"

const FIELD_STYLE = "gap-1"
const TEXT_STYLE = "font-mono font-bold uppercase text-xs md:text-sm"
const INPUT_STYLE = "font-mono font-bold uppercase text-xs md:text-sm flex-6"

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
            <div className="flex gap-4">
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
                    <BrutalButton className="flex-none px-4" type="button" onClick={onRevert}>
                        Revert
                    </BrutalButton>
                )}
            </div>
        </Field>
    )
}