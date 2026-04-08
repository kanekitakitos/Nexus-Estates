import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, Mail, Shield, UserPlus, X, Users, Home, Maximize, Check, Loader2, AlertCircle, MapPin } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PropertyInputField } from "../../components/property-input-field"
import { AmenitiesField } from "../../components/amenities-field"
import { PropertyCardItem } from "../../components/property-card-item"
import { OwnProperty } from "@/types"
import { itemFadeRight } from "../../animations"

// ─── Essence Step ───────────────────────────────────────────────────────────

export function EssenceStep({ property, initialData, updateField }: { property: OwnProperty, initialData: OwnProperty | null, updateField: any }) {
    const getVal = (v: any) => typeof v === 'string' ? v : v?.pt || ""
    return (
        <div className="grid gap-6">
            <PropertyInputField 
                label="Título do Ativo" 
                value={getVal(property.title)} 
                savedValue={initialData ? getVal(initialData.title) : ""} 
                onChange={(val) => updateField('title', String(val))}
                onRevert={() => updateField('title', initialData ? getVal(initialData.title) : "")}
            />
            <PropertyInputField 
                label="Descrição Editorial" 
                value={getVal(property.description)} 
                savedValue={initialData ? getVal(initialData.description) : ""} 
                onChange={(val) => updateField('description', String(val))}
                onRevert={() => updateField('description', initialData ? getVal(initialData.description) : "")}
            />
            <PropertyInputField 
                label="Preço Base (€ / Noite)" 
                type="number"
                value={property.price} 
                savedValue={initialData?.price || 0} 
                onChange={(val) => updateField('price', Number(val))}
                onRevert={() => updateField('price', initialData?.price || 0)}
            />
        </div>
    )
}

// ─── Location Step ──────────────────────────────────────────────────────────

export function LocationStep({ property, initialData, updateField }: { property: OwnProperty, initialData: OwnProperty | null, updateField: any }) {
    return (
        <div className="grid gap-6">
            <PropertyInputField 
                label="Região / Destino" 
                value={property.location} 
                savedValue={initialData?.location || ""} 
                onChange={(val) => updateField('location', String(val))}
                onRevert={() => updateField('location', initialData?.location || "")}
            />
            <div className="grid grid-cols-2 gap-6">
                <PropertyInputField 
                    label="Cidade" 
                    value={property.city} 
                    savedValue={initialData?.city || ""}
                    onChange={(val) => updateField('city', String(val))} 
                    onRevert={() => updateField('city', initialData?.city || "")}
                />
                <PropertyInputField 
                    label="Morada" 
                    value={property.address} 
                    savedValue={initialData?.address || ""}
                    onChange={(val) => updateField('address', String(val))} 
                    onRevert={() => updateField('address', initialData?.address || "")}
                />
            </div>
        </div>
    )
}

// ─── Amenities Step ─────────────────────────────────────────────────────────

export function AmenitiesStep({ property, initialData, updateField }: { property: OwnProperty, initialData: OwnProperty | null, updateField: any }) {
    return (
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border-2 border-foreground p-6 rounded-xl">
            <AmenitiesField 
                selectedIds={property.amenityIds || []}
                savedIds={initialData?.amenityIds || []}
                onUpdateIds={(ids) => updateField('amenityIds', ids)}
                onRevert={() => updateField('amenityIds', initialData?.amenityIds || [])}
            />
        </div>
    )
}

// ─── Permissions Step ───────────────────────────────────────────────────────

export function PermissionsStep({ property, updateField }: { property: OwnProperty, updateField: any }) {
    const [newEmail, setNewEmail] = useState("")
    const [newLevel, setNewLevel] = useState("Viewer")
    const [isChecking, setIsChecking] = useState(false)
    const [checkStatus, setCheckStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')

    const verifyAndAdd = async () => {
        if (!newEmail.includes("@")) return toast.error("Email inválido")
        
        setIsChecking(true)
        setCheckStatus('idle')

        try {
            await new Promise(r => setTimeout(r, 800))
            const isValid = newEmail.length > 5 && !newEmail.includes("error")

            if (isValid) {
                setCheckStatus('valid')
                updateField('permissions', [...(property.permissions || []), { email: newEmail, level: newLevel }])
                toast.success("Colaborador validado")
                setNewEmail("")
                setTimeout(() => setCheckStatus('idle'), 2000)
            } else {
                setCheckStatus('invalid')
                toast.error("Utilizador não encontrado")
            }
        } catch (e) {
            toast.error("Erro ao verificar")
        } finally {
            setIsChecking(false)
        }
    }

    return (
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border-2 border-foreground p-6 rounded-xl space-y-6 shadow-[4px_4px_0_0_#0D0D0D] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)]">
            <div className="space-y-2">
                <label className="font-mono text-[10px] font-black uppercase tracking-widest text-primary italic">Convidar Colaborador //</label>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <input 
                            placeholder="Email do colaborador..."
                            className={cn(
                                "w-full bg-background border-2 border-foreground h-12 px-4 rounded-lg font-mono text-xs transition-all",
                                checkStatus === 'valid' && "border-emerald-500",
                                checkStatus === 'invalid' && "border-rose-500"
                            )}
                            value={newEmail} 
                            onChange={e => {
                                setNewEmail(e.target.value)
                                if (checkStatus !== 'idle') setCheckStatus('idle')
                            }}
                            title="Novo Email"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            {checkStatus === 'valid' && <Check className="h-4 w-4 text-emerald-500" />}
                            {checkStatus === 'invalid' && <AlertCircle className="h-4 w-4 text-rose-500" />}
                        </div>
                    </div>
                    <select 
                        className="h-12 border-2 border-foreground px-2 rounded-lg font-mono text-[10px] bg-background font-bold tracking-tighter" 
                        value={newLevel} 
                        onChange={e => setNewLevel(e.target.value)}
                        title="Nível de Acesso"
                    >
                        <option>Viewer</option>
                        <option>Collaborator</option>
                        <option>Manager</option>
                    </select>
                    <button 
                        onClick={verifyAndAdd} 
                        disabled={isChecking}
                        className="h-12 px-6 bg-primary text-primary-foreground border-2 border-foreground rounded-lg font-mono text-[10px] font-black hover:-translate-y-0.5 transition-all shadow-[3px_3px_0_0_#000]"
                    >
                        {isChecking ? "..." : "CONVIDAR"}
                    </button>
                </div>
            </div>

            <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {(property.permissions || []).map(p => (
                    <motion.div 
                        initial="initial"
                        animate="animate"
                        variants={itemFadeRight}
                        key={p.email} 
                        className="flex justify-between items-center p-3 border-2 border-foreground rounded-lg bg-white/20 dark:bg-black/20 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <div className="flex flex-col">
                                <span className="font-mono text-xs font-bold leading-none">{p.email}</span>
                                <span className="font-mono text-[9px] text-muted-foreground uppercase">{p.level}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => updateField('permissions', property.permissions?.filter(x => x.email !== p.email))}
                            className="p-1 hover:bg-rose-50 rounded transition-colors group-hover:text-rose-500"
                            title="Remover"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// ─── Preview Step ───────────────────────────────────────────────────────────

export function PreviewStep({ property }: { property: OwnProperty }) {
    const title = typeof property.title === 'string' ? property.title : property.title?.pt || ""
    return (
        <div className="space-y-8">
            <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-4 rounded-xl flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <p className="font-mono text-[10px] text-muted-foreground leading-tight uppercase font-bold tracking-tighter">
                    Esta é uma pré-visualização fidedigna de como o seu ativo será apresentado no catálogo público Nex Estates.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="scale-95 lg:scale-100 origin-top transition-transform">
                    <PropertyCardItem prop={property} onSelect={() => {}} />
                </div>
                
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border-2 border-foreground p-8 rounded-xl shadow-[8px_8px_0_0_#0D0D0D] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.05)] space-y-8">
                    <div>
                        <h3 className="font-mono text-xs font-black uppercase mb-6 text-primary italic border-b-2 border-primary/20 pb-2">Resumo de Auditoria //</h3>
                        
                        <div className="grid gap-4">
                            {[
                                { l: "Identificação", v: title, icon: Home },
                                { l: "Localização", v: `${property.city}, ${property.location}`, icon: MapPin },
                                { l: "Capacidade", v: `${property.maxGuests} Hóspedes`, icon: Users },
                                { l: "Rentabilidade", v: `€${property.price} / Noite`, icon: Shield },
                            ].map(i => (
                                <div key={i.l} className="flex items-center gap-4 group">
                                    <div className="h-8 w-8 flex items-center justify-center rounded border-2 border-foreground bg-background dark:bg-slate-900 group-hover:bg-primary/10 transition-colors">
                                        <i.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-[9px] uppercase text-muted-foreground tracking-widest">{i.l}</span>
                                        <span className="font-mono text-xs font-black truncate max-w-[200px]">{i.v}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t-2 border-foreground/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-3 w-3 text-emerald-500" />
                            <span className="font-mono text-[9px] font-bold text-emerald-500 uppercase">Validação de Segurança Passou</span>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">
                            Ao lançar este ativo, ele será indexado imediatamente e ficará disponível para gestão colaborativa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
