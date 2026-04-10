"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Save, Eye, LayoutDashboard,
    CheckCircle2, AlertCircle, Timer, Undo2, Upload, ArrowLeft,
    MapPin, Check, Trash2, LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { BrutalButton } from "@/components/ui/forms/button"
import { BrutalShard } from "@/components/ui/data-display/card"
import { ImageInput } from "@/components/ui/file-handler/imageInput"
import { PropertyInputField } from "./components/property-input-field"
import { AmenitiesField } from "./components/amenities-field"
import { toast } from "sonner"

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/** Cabeçalho de Gestão: Navegação, Modo e Persistência */
function EditHeader({
    title, mode, onModeChange, onBack, onSave, onDiscard, isSaving, hasChanges
}: {
    title: string; mode: 'VIEW' | 'EDIT'; onModeChange: (m: 'VIEW' | 'EDIT') => void;
    onBack: () => void; onSave: () => void; onDiscard: () => void; isSaving: boolean; hasChanges: boolean
}) {
    return (
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 backdrop-blur-md border-2 border-foreground p-3 rounded-xl shadow-[4px_4px_0_0_#0D0D0D]">
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Voltar" className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
                <div className="h-8 w-[2px] bg-foreground/10 mx-1" />
                <div className="flex flex-col">
                    <span className="font-mono text-[9px] font-black uppercase text-primary italic leading-none mb-1">Nexus_Active_Asset //</span>
                    <h2 className="text-xl font-black uppercase tracking-tighter leading-none truncate max-w-[200px]">{title}</h2>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex bg-foreground/5 p-1 rounded-lg">
                    {[
                        { id: 'VIEW', label: 'Preview', icon: Eye },
                        { id: 'EDIT', label: 'Edit', icon: LayoutDashboard },
                    ].map((btn) => (
                        <button
                            key={btn.id} onClick={() => onModeChange(btn.id as any)}
                            className={cn(
                                "px-4 py-1.5 rounded-md font-mono text-[10px] font-black uppercase transition-all flex items-center gap-2",
                                mode === btn.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <btn.icon size={14} /> {btn.label}
                        </button>
                    ))}
                </div>
                <div className="h-8 w-[2px] bg-foreground/10 mx-2" />
                <AnimatePresence>
                    {hasChanges && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-2">
                            <button onClick={onDiscard} className="p-2 text-muted-foreground hover:text-rose-500 transition-colors" title="Descartar"><Undo2 size={18} /></button>
                            <BrutalButton onClick={onSave} disabled={isSaving} className="h-10 px-6 bg-emerald-500 text-white border-2 border-foreground rounded-xl shadow-[4px_4px_0_0_#0D0D0D] text-[10px] font-black uppercase tracking-widest gap-2">
                                {isSaving ? "Sync..." : "Guardar Ativo"} <Save size={14} />
                            </BrutalButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}

/** Visualização detalhada (Preview Mode) */
function PreviewMode({ property }: { property: OwnProperty }) {
    const title = typeof property.title === 'string' ? property.title : property.title?.pt || property.title?.en || "Sem Título"
    const desc = typeof property.description === 'string' ? property.description : property.description?.pt || "Sem descrição."
    const images = property.imageUrl ? [property.imageUrl] : ["/placeholder-property.jpg"]
    const [idx, setIdx] = useState(0)

    return (
        <div className="space-y-6">
            <div className="relative aspect-[16/7] bg-white/40 backdrop-blur-md border-2 border-foreground rounded-3xl overflow-hidden shadow-[8px_8px_0_0_#0D0D0D]">
                <motion.img key={idx} src={images[idx]} className="w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-10">
                    <div className="flex gap-2">
                        {images.map((_, i) => <div key={i} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-8 bg-primary" : "w-1.5 bg-white/50")} />)}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <BrutalShard rotate="primary">
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <MapPin className="h-4 w-4" />
                            <span className="font-mono text-[10px] font-black uppercase tracking-widest">{property.location}</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-none">{title}</h1>
                        <span className="font-black text-2xl text-primary">€{property.price}<span className="text-[10px] text-muted-foreground ml-1">/ NOITE</span></span>
                    </div>
                </BrutalShard>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <BrutalShard rotate="secondary">
                        <span className="font-mono text-[9px] font-black uppercase text-primary block mb-3">DESCRIÇÃO //</span>
                        <p className="font-mono text-[11px] leading-relaxed text-muted-foreground italic line-clamp-4">{desc}</p>
                    </BrutalShard>
                    <BrutalShard rotate="primary">
                        <span className="font-mono text-[9px] font-black uppercase text-primary block mb-3">CONFORTO //</span>
                        <div className="flex flex-wrap gap-2">
                            {property.tags?.slice(0, 6).map((t, i) => (
                                <span key={i} className="border-2 border-foreground/10 bg-background/40 px-2 py-1 rounded-lg font-mono text-[9px] font-black uppercase flex items-center gap-1">
                                    <Check className="h-3 w-3 text-primary" /> {typeof t === 'string' ? t : (t as any).pt}
                                </span>
                            ))}
                        </div>
                    </BrutalShard>
                </div>
            </div>
        </div>
    )
}

/** Formulário de Edição (Edit Mode) */
function EditModeFields({ draft, initial, updateField }: { draft: OwnProperty; initial: OwnProperty; updateField: (f: keyof OwnProperty, v: any) => void }) {
    return (
        <section className="bg-white/40 backdrop-blur-md border-2 border-foreground p-6 rounded-3xl shadow-[8px_8px_0_0_#0D0D0D] space-y-8">
            <div>
                <h3 className="font-black uppercase text-2xl tracking-tighter mb-6 flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-lg text-primary"><LayoutDashboard size={20} /></span> Informação Técnica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PropertyInputField label="Título" value={draft.title as string} savedValue={initial.title as string} onChange={(v) => updateField('title', v)} onRevert={() => updateField('title', initial.title)} />
                    <PropertyInputField label="Preço" type="number" value={draft.price} savedValue={initial.price} onChange={(v) => updateField('price', Number(v))} onRevert={() => updateField('price', initial.price)} />
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PropertyInputField label="Localização" value={draft.location} savedValue={initial.location} onChange={(v) => updateField('location', v)} onRevert={() => updateField('location', initial.location)} />
                    <PropertyInputField label="Cidade" value={draft.city} savedValue={initial.city} onChange={(v) => updateField('city', v)} onRevert={() => updateField('city', initial.city)} />
                    <PropertyInputField label="Max Hóspedes" type="number" value={draft.maxGuests} savedValue={initial.maxGuests} onChange={(v) => updateField('maxGuests', Number(v))} onRevert={() => updateField('maxGuests', initial.maxGuests)} />
                </div>
                <div className="mt-6">
                    <PropertyInputField label="Descrição" value={draft.description as string} savedValue={initial.description as string} onChange={(v) => updateField('description', v)} onRevert={() => updateField('description', initial.description)} multiline rows={3} />
                </div>
            </div>
            <div className="pt-8 border-t border-foreground/5">
                <AmenitiesField selectedIds={draft.amenityIds || []} savedIds={initial.amenityIds || []} onUpdateIds={(ids) => updateField('amenityIds', ids)} onRevert={() => updateField('amenityIds', initial.amenityIds || [])} />
            </div>
        </section>
    )
}

/** Botão de Status Individual */
function StatusToggle({ label, icon: Icon, color, isActive, onClick }: { label: string; icon: LucideIcon; color: string; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center justify-between p-3 border-2 rounded-xl transition-all",
                isActive ? "bg-white border-foreground shadow-[2px_2px_0_0_#000]" : "border-transparent text-muted-foreground hover:bg-foreground/5"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? color : ""} />
                <span className="font-black text-xs uppercase tracking-tight">{label}</span>
            </div>
            {isActive && <div className="h-2 w-2 rounded-full bg-foreground" />}
        </button>
    )
}

// ─── Componente Principal ───────────────────────────────────────────────────

export interface PropertyEditProps {
    property: OwnProperty
    onBack: () => void
    onSave: (updated: OwnProperty) => Promise<void>
}

export function PropertyEdit({ property: initialProperty, onBack, onSave }: PropertyEditProps) {
    const [mode, setMode] = useState<'VIEW' | 'EDIT'>('VIEW')
    const [draft, setDraft] = useState<OwnProperty>({ ...initialProperty })
    const [isSaving, setIsSaving] = useState(false)
    const [pendingChanges, setPendingChanges] = useState(false)

    const updateField = (field: keyof OwnProperty, value: any) => {
        setDraft(prev => ({ ...prev, [field]: value }))
        setPendingChanges(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave(draft)
            setPendingChanges(false)
            setMode('VIEW')
            toast.success("Ativo atualizado")
        } catch (error) {
            toast.error("Erro ao sincronizar")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6 pt-4">
            <EditHeader
                title={draft.title as string} mode={mode} onModeChange={setMode}
                onBack={onBack} onSave={handleSave} onDiscard={() => { setDraft({ ...initialProperty }); setPendingChanges(false); }}
                isSaving={isSaving} hasChanges={pendingChanges}
            />

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8">
                    {mode === 'VIEW' ? <PreviewMode property={draft} /> : <EditModeFields draft={draft} initial={initialProperty} updateField={updateField} />}
                </div>

                <aside className="lg:col-span-4 space-y-6">
                    <section className="bg-white/40 backdrop-blur-md border-2 border-foreground p-5 rounded-3xl shadow-[4px_4px_0_0_#0D0D0D]">
                        <h4 className="font-mono text-[10px] font-black uppercase text-primary italic mb-4">Status_Manager //</h4>
                        <div className="grid gap-2">
                            <StatusToggle label="Disponível" icon={CheckCircle2} color="text-emerald-500" isActive={draft.status === 'AVAILABLE'} onClick={() => updateField('status', 'AVAILABLE')} />
                            <StatusToggle label="Manutenção" icon={Timer} color="text-yellow-500" isActive={draft.status === 'MAINTENANCE'} onClick={() => updateField('status', 'MAINTENANCE')} />
                            <StatusToggle label="Ocupada" icon={AlertCircle} color="text-rose-500" isActive={draft.status === 'BOOKED'} onClick={() => updateField('status', 'BOOKED')} />
                        </div>
                    </section>

                    <section className="bg-white/40 backdrop-blur-md border-2 border-foreground p-5 rounded-3xl shadow-[4px_4px_0_0_#0D0D0D]">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-mono text-[10px] font-black uppercase text-primary italic">Media_Nexus //</h4>
                            <button title="Upload" className="p-1 hover:bg-primary/10 rounded text-primary transition-colors"><Upload size={14} /></button>
                        </div>
                        <ImageInput value={draft.imageUrl} onChange={(url) => updateField('imageUrl', url)} onRemove={() => updateField('imageUrl', "")} />
                        <div className="mt-4 p-3 bg-foreground/5 rounded-xl flex items-center gap-3 opacity-60">
                            <Trash2 size={16} />
                            <p className="font-mono text-[8px] uppercase font-black leading-tight">Remover este ativo permanentemente da rede</p>
                        </div>
                    </section>
                </aside>
            </main>
        </div>
    )
}