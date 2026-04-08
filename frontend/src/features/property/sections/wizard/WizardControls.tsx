import { ArrowLeft, ArrowRight, Save } from "lucide-react"
import { WizardStep } from "../../types"

interface WizardControlsProps {
    step: WizardStep
    isSaving: boolean
    isEdit: boolean
    onClose: () => void
    onPrev: () => void
    onNext: () => void
    onSave: () => Promise<void>
}

export function WizardControls({ 
    step, 
    isSaving, 
    isEdit, 
    onClose, 
    onPrev, 
    onNext, 
    onSave 
}: WizardControlsProps) {
    return (
        <div className="mt-16 flex items-center justify-between gap-6 border-t-[3px] border-foreground pt-12">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onClose}
                    className="px-8 h-14 rounded-xl border-3 border-foreground font-mono text-xs font-black uppercase tracking-widest hover:bg-muted/10 transition-all flex items-center justify-center"
                >
                    Cancelar
                </button>
                
                {step !== 'essence' && (
                    <button 
                        onClick={onPrev}
                        className="px-8 h-14 rounded-xl border-3 border-foreground font-mono text-xs font-black uppercase tracking-widest bg-background hover:bg-muted/5 transition-all flex items-center justify-center gap-3"
                    >
                        <ArrowLeft className="h-4 w-4" strokeWidth={3} />
                        Anterior
                    </button>
                )}
            </div>

            {step === 'preview' ? (
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className="px-12 h-14 rounded-xl border-3 border-foreground bg-primary text-white font-mono text-xs font-black uppercase tracking-[0.2em] shadow-[6px_6px_0_0_#0D0D0D] hover:shadow-[10px_10px_0_0_#0D0D0D] hover:-translate-x-1 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                    {isSaving ? "A PROCESSAR..." : isEdit ? "CONCLUIR EDIÇÃO //" : "LANÇAR PROPRIEDADE //"}
                    <Save className="h-5 w-5 text-white" strokeWidth={3} />
                </button>
            ) : (
                <button 
                    onClick={onNext}
                    className="px-12 h-14 rounded-xl border-3 border-foreground bg-foreground text-background font-mono text-xs font-black uppercase tracking-[0.2em] shadow-[6px_6px_0_0_rgba(0,0,0,0.2)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,0.2)] hover:-translate-x-1 hover:-translate-y-1 transition-all flex items-center justify-center gap-4"
                >
                    Próximo Passo
                    <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </button>
            )}
        </div>
    )
}
