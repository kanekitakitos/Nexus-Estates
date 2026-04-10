"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { 
  Layout, ArrowLeft, ArrowRight, Save, Eye, Shield, X, 
  Users, Home, MapPin, Sparkles, LucideIcon
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { usePropertyForm } from "./hooks"
import { OwnProperty, WizardStep } from "@/types"
import { pageVariants } from "./animations"
import { PropertyInputField } from "./components/property-input-field"
import { AmenitiesField } from "./components/amenities-field"
import { PropertyCardItem } from "./components/property-card-item"

// ─── Metadata & Config ──────────────────────────────────────────────────────

const STEPS_META: { key: WizardStep; label: string; n: string }[] = [
    { key: 'essence',     label: 'Essência // 01', n: '01' },
    { key: 'location',    label: 'Destino // 02',  n: '02' },
    { key: 'amenities',   label: 'Serviços // 03', n: '03' },
    { key: 'permissions', label: 'Equipa // 04',   n: '04' },
    { key: 'preview',     label: 'Aprovação // 05', n: '05' },
]

// ─── Sub-Componentes de UI ──────────────────────────────────────────────────

/** Indicador de progresso industrial */
function WizardProgress({ currentStep, isEdit }: { currentStep: WizardStep, isEdit: boolean }) {
    const currentIdx = STEPS_META.findIndex(s => s.key === currentStep)
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b-4 border-foreground pb-8">
            <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border-[3px] border-foreground bg-primary shadow-[6px_6px_0_0_#0D0D0D]">
                    <Layout className="h-8 w-8 text-white" strokeWidth={3} />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1 block underline underline-offset-4 decoration-4">
                      {isEdit ? "Edit_Asset" : "Create_Asset"} // Nexus_Protocol
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                      {STEPS_META.find(s => s.key === currentStep)?.label}
                  </h2>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {STEPS_META.map((s, idx) => (
                    <div key={idx} className="flex items-center">
                        <div className={cn(
                            "h-10 w-10 flex items-center justify-center rounded-lg border-2 border-foreground font-mono font-black text-xs transition-all",
                            currentStep === s.key ? "bg-primary text-white scale-110 shadow-[3px_3px_0_0_#0D0D0D]" : currentIdx > idx ? "bg-emerald-400 opacity-60" : "bg-muted opacity-30"
                        )}>{s.n}</div>
                        {idx < STEPS_META.length - 1 && <div className="w-4 h-0.5 bg-foreground/10 mx-1" />}
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Estágio 01: Identidade Visual e Textual */
function EssenceStep({ property, initial, updateField }: { property: OwnProperty; initial: OwnProperty | null; updateField: any }) {
    const getVal = (v: any) => typeof v === 'string' ? v : v?.pt || ""
    return (
        <div className="grid gap-6">
            <PropertyInputField label="Título" value={getVal(property.title)} savedValue={initial ? getVal(initial.title) : ""} onChange={(v) => updateField('title', v)} onRevert={() => updateField('title', initial?.title || "")} />
            <PropertyInputField label="Descrição" value={getVal(property.description)} savedValue={initial ? getVal(initial.description) : ""} onChange={(v) => updateField('description', v)} onRevert={() => updateField('description', initial?.description || "")} multiline rows={4} />
            <PropertyInputField label="Valor Base (€)" type="number" value={property.price} savedValue={initial?.price || 0} onChange={(v) => updateField('price', Number(v))} onRevert={() => updateField('price', initial?.price || 0)} />
        </div>
    )
}

/** Estágio 02: Logística e Localização */
function LocationStep({ property, initial, updateField }: { property: OwnProperty; initial: OwnProperty | null; updateField: any }) {
    return (
        <div className="grid gap-6">
            <PropertyInputField label="Região" value={property.location} savedValue={initial?.location || ""} onChange={(v) => updateField('location', v)} onRevert={() => updateField('location', initial?.location || "")} />
            <div className="grid grid-cols-2 gap-6">
                <PropertyInputField label="Cidade" value={property.city} savedValue={initial?.city || ""} onChange={(v) => updateField('city', v)} onRevert={() => updateField('city', initial?.city || "")} />
                <PropertyInputField label="Morada" value={property.address} savedValue={initial?.address || ""} onChange={(v) => updateField('address', v)} onRevert={() => updateField('address', initial?.address || "")} />
            </div>
        </div>
    )
}

/** Estágio 03: Catálogo de Comodidades */
function AmenitiesStep({ property, initial, updateField }: { property: OwnProperty; initial: OwnProperty | null; updateField: any }) {
    return (
        <div className="bg-white/40 backdrop-blur-md border-2 border-foreground p-6 rounded-xl shadow-[4px_4px_0_0_#0D0D0D]">
            <AmenitiesField 
                selectedIds={property.amenityIds || []} savedIds={initial?.amenityIds || []} 
                onUpdateIds={(ids) => updateField('amenityIds', ids)} onRevert={() => updateField('amenityIds', initial?.amenityIds || [])} 
            />
        </div>
    )
}

/** Estágio 04: Gestão de Permissões */
function PermissionsStep({ property, updateField }: { property: OwnProperty; updateField: any }) {
    const [email, setEmail] = useState("")
    const add = () => {
        if (!email.includes("@")) return toast.error("Email inválido")
        updateField('permissions', [...(property.permissions || []), { email, level: "Editor" }])
        setEmail(""); toast.success("Convidado")
    }

    return (
        <div className="bg-white/40 backdrop-blur-md border-2 border-foreground p-6 rounded-xl space-y-6 shadow-[4px_4px_0_0_#0D0D0D]">
            <div className="space-y-2">
                <label className="font-mono text-[10px] font-black uppercase text-primary italic tracking-widest">Colaborador //</label>
                <div className="flex gap-3">
                    <input className="flex-1 border-2 border-foreground h-12 px-4 rounded-lg font-mono text-xs" placeholder="Email..." value={email} onChange={e => setEmail(e.target.value)} />
                    <button onClick={add} className="h-12 px-6 bg-primary text-white border-2 border-foreground rounded-lg font-mono text-[10px] font-black shadow-[3px_3px_0_0_#000]">ADICIONAR</button>
                </div>
            </div>
            <div className="grid gap-2 max-h-[150px] overflow-y-auto">
                {property.permissions?.map(p => (
                    <div key={p.email} className="flex justify-between items-center p-3 border-2 border-foreground rounded-lg bg-white/20">
                        <span className="font-mono text-xs font-bold">{p.email}</span>
                        <button onClick={() => updateField('permissions', property.permissions?.filter(x => x.email !== p.email))}><X size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Estágio 05: Aprovação Final */
function PreviewStep({ property }: { property: OwnProperty }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="scale-95 lg:scale-100 origin-top "><PropertyCardItem prop={property} onSelect={() => {}} /></div>
            <div className="bg-white/40 backdrop-blur-md border-2 border-foreground p-8 rounded-xl shadow-[8px_8px_0_0_#0D0D0D] space-y-6">
                <h3 className="font-mono text-[10px] font-black uppercase text-primary italic border-b-2 border-primary/20 pb-2">Validação_Protocolo //</h3>
                <div className="grid gap-4">
                    {[
                        { l: "REGISTO", v: property.title as string, i: Home },
                        { l: "ZONA", v: property.location, i: MapPin },
                        { l: "YIELD", v: `${property.price}€`, i: Sparkles },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <item.i className="h-4 w-4 text-primary" />
                            <div className="flex flex-col"><span className="text-[8px] font-mono opacity-50 uppercase">{item.l}</span><span className="text-sm font-black uppercase">{item.v}</span></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Rodapé de Comando */
function WizardFooter({ 
    step, isSaving, isEdit, onBack, onNext, onSave, onClose 
}: { 
    step: WizardStep; isSaving: boolean; isEdit: boolean; onBack: () => void; onNext: () => void; onSave: () => void; onClose: () => void 
}) {
    return (
        <div className="mt-12 flex items-center justify-between gap-6 border-t-[3px] border-foreground pt-10">
            <button onClick={onClose} className="px-6 h-12 rounded-xl border-2 border-foreground font-mono text-[10px] font-black uppercase shadow-[2px_2px_0_0_#0D0D0D]">Sair</button>
            <div className="flex gap-4">
                {step !== 'essence' && <button onClick={onBack} className="px-6 h-12 rounded-xl border-2 border-foreground font-mono text-[10px] font-black uppercase bg-background shadow-[2px_2px_0_0_#0D0D0D]">Anterior</button>}
                {step === 'preview' ? (
                    <button onClick={onSave} disabled={isSaving} className="px-10 h-12 rounded-xl border-2 border-foreground bg-primary text-white font-mono text-[10px] font-black uppercase shadow-[4px_4px_0_0_#0D0D0D] flex items-center gap-2">
                        {isSaving ? "SYNCING..." : "EFETUAR REGISTO"} <Save size={16}/>
                    </button>
                ) : (
                    <button onClick={onNext} className="px-10 h-12 rounded-xl border-2 border-foreground bg-foreground text-background font-mono text-[10px] font-black uppercase shadow-[4px_4px_0_0_#0D0D0D] flex items-center gap-2">
                        PRÓXIMO <ArrowRight size={16}/>
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function PropertyForm({ property: initialData, onClose, onSaved }: { property: OwnProperty | null; onClose: () => void; onSaved: () => void }) {
    const { property, step, isSaving, isEdit, updateField, nextStep, prevStep, handleFinalSave } = usePropertyForm(initialData, onSaved)

    return (
        <div className="flex flex-col min-h-[80vh]">
            <WizardProgress currentStep={step} isEdit={isEdit} />
            
            <AnimatePresence mode="wait">
                <motion.div key={step} initial="initial" animate="animate" exit="exit" variants={pageVariants} className="flex-1">
                    {step === 'essence' && <EssenceStep property={property} initial={initialData} updateField={updateField} />}
                    {step === 'location' && <LocationStep property={property} initial={initialData} updateField={updateField} />}
                    {step === 'amenities' && <AmenitiesStep property={property} initial={initialData} updateField={updateField} />}
                    {step === 'permissions' && <PermissionsStep property={property} updateField={updateField} />}
                    {step === 'preview' && <PreviewStep property={property} />}
                </motion.div>
            </AnimatePresence>

            <WizardFooter 
                step={step} isSaving={isSaving} isEdit={isEdit} 
                onBack={prevStep} onNext={nextStep} onSave={handleFinalSave} onClose={onClose} 
            />
        </div>
    )
}