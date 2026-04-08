import { Layout } from "lucide-react"
import { cn } from "@/lib/utils"
import { WizardStep } from "../../types"

const STEPS: { key: WizardStep; label: string; n: string }[] = [
    { key: 'essence',     label: 'Essência // 01', n: '01' },
    { key: 'location',    label: 'Destino // 02',  n: '02' },
    { key: 'amenities',   label: 'Serviços // 03', n: '03' },
    { key: 'permissions', label: 'Equipa // 04',   n: '04' },
    { key: 'preview',     label: 'Aprovação // 05', n: '05' },
]

interface WizardProgressProps {
    currentStep: WizardStep
    isEdit: boolean
}

export function WizardProgress({ currentStep, isEdit }: WizardProgressProps) {
    const currentIdx = STEPS.findIndex(s => s.key === currentStep)
    
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b-4 border-foreground pb-8 px-4 md:px-0">
            <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border-[3px] border-foreground bg-primary shadow-[6px_6px_0_0_#0D0D0D]">
                    <Layout className="h-8 w-8 text-white" strokeWidth={3} />
                </div>
                <div>
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1 block decoration-primary decoration-4 underline-offset-4 underline">
                        {isEdit ? "Edit_Asset" : "Create_Asset"} // Nexus_Protocol
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                        {STEPS.find(s => s.key === currentStep)?.label}
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {STEPS.map((s, idx) => (
                    <div key={s.key} className="flex items-center">
                        <div className={cn(
                            "h-10 w-10 flex items-center justify-center rounded-lg border-2 border-foreground font-mono font-black text-xs transition-all",
                            currentStep === s.key ? "bg-primary text-white scale-110 shadow-[3px_3px_0_0_#0D0D0D]" : 
                            currentIdx > idx ? "bg-emerald-400 opacity-60" : "bg-muted opacity-30"
                        )}>
                            {s.n}
                        </div>
                        {idx < STEPS.length - 1 && <div className="w-4 h-0.5 bg-foreground/10 mx-1" />}
                    </div>
                ))}
            </div>
        </div>
    )
}
