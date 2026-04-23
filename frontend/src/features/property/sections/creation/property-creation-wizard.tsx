"use client"

import { AnimatePresence, motion } from "framer-motion"
import { 
  Layout, ArrowRight, Save, 
  Users, Home, MapPin, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

import { usePropertyForm } from "../../hooks"
import { OwnProperty, WizardStep } from "@/types"
import { pageVariants, nexusEntrance } from "../../animations"
import { BoingText } from "@/components/effects/BoingText"
import { BrutalField } from "@/components/ui/forms/brutal-field"
import { BrutalButton } from "@/components/ui/forms/button"
import { BrutalSurface } from "@/components/ui/layout/brutal-surface"
import { AmenitiesField } from "../../components/amenities-field"
import { PropertyCardItem } from "../../components/property-card-item"
import { CollaboratorManager } from "../../components/collaborator-manager"

// ─── Tipos e Interfaces ───────────────────────────────────────────────────

/**
 * Propriedades do Orchestrador do Wizard de Criação/Edição.
 *
 * @description Define o contrato público do wizard multi-etapa,
 * incluindo dados iniciais, callback de fecho e callback pós-gravação.
 */
export interface PropertyFormProps {
    /** Dados iniciais do ativo (null para criação de novo ativo) */
    property: OwnProperty | null
    /** Callback para fechar o wizard e regressar à listagem */
    onClose: () => void
    /** Callback disparado após gravação bem-sucedida no backend */
    onSaved: () => void
}

/**
 * Metadados de cada etapa do wizard.
 *
 * @description Cada etapa possui uma chave de roteamento (`key`),
 * um rótulo para exibição (`label`) e um indicador numérico (`n`).
 */
export interface WizardStepMeta {
    key: WizardStep
    label: string
    n: string
}

// ─── Metadata & Config ──────────────────────────────────────────────────────

/**
 * STEPS_META — Configuração estática das etapas do wizard.
 *
 * @description Define a ordem e os rótulos de cada passo:
 * 1. Identidade (essence) — título, descrição, preço
 * 2. Localização (location) — região, cidade, morada
 * 3. Comodidades (amenities) — matriz de conforto
 * 4. Equipa (permissions) — colaboradores e ACL
 * 5. Revisão (preview) — validação final antes de guardar
 */
const STEPS_META: WizardStepMeta[] = [
    { key: "essence", label: "Identidade", n: "1" },
    { key: "location", label: "Localização", n: "2" },
    { key: "amenities", label: "Comodidades", n: "3" },
    { key: "permissions", label: "Equipa", n: "4" },
    { key: "preview", label: "Revisão", n: "5" },
]

// ─── Sub-Componentes de UI ──────────────────────────────────────────────────

/**
 * WizardProgress — Indicador de progresso técnico e visual.
 *
 * @description Exibe a etapa atual, o título da secção e uma linhagem
 * industrial de passos numerados com feedback de estado:
 * - **Concluído**: verde (idx < currentIdx)
 * - **Ativo**: primário (idx === currentIdx)
 * - **Pendente**: muted (idx > currentIdx)
 *
 * @param currentStep - Chave da etapa ativa (ex: 'essence')
 * @param isEdit - Indica se estamos a editar ou a criar um novo ativo
 */
function WizardProgress({ currentStep, isEdit }: { currentStep: WizardStep; isEdit: boolean }) {
    const currentIdx = STEPS_META.findIndex((s) => s.key === currentStep)
    return (
        <div className="mb-10 flex flex-col gap-6 border-b border-[#0D0D0D]/15 pb-8 dark:border-zinc-800 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#0D0D0D]/25 bg-primary text-white dark:border-zinc-600">
                    <Layout className="h-6 w-6" strokeWidth={2} />
                </div>
                <div>
                    <p className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.4em] text-[#8C7B6B]">
                        {isEdit ? "Protocolo_Edição // Ativo" : "Protocolo_Criação // Novo"}
                    </p>
                    <h2 className="font-serif text-3xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] md:text-5xl dark:text-white">
                        <BoingText text={STEPS_META.find((s) => s.key === currentStep)?.label || ""} color="currentColor" activeColor="#F97316" />
                    </h2>
                </div>
            </div>
            <ol className="flex flex-wrap items-center gap-2">
                {STEPS_META.map((s, idx) => (
                    <li key={s.key} className="flex items-center gap-2">
                        <span
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                                currentStep === s.key
                                    ? "border-primary bg-primary/15 text-primary"
                                    : idx < currentIdx
                                      ? "border-emerald-600/40 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                      : "border-[#0D0D0D]/15 text-[#8C7B6B] dark:border-zinc-700"
                            )}
                        >
                            {s.n}
                        </span>
                        {idx < STEPS_META.length - 1 && (
                            <span className="hidden h-px w-4 bg-[#0D0D0D]/15 sm:block dark:bg-zinc-700" aria-hidden />
                        )}
                    </li>
                ))}
            </ol>
        </div>
    )
}

/**
 * EssenceStep — Estágio 01: Definição da Identidade Visual e Textual.
 *
 * @description Campos de título, descrição e preço base do ativo.
 * Utiliza `BrutalField` para feedback visual de dirty-state e reversão.
 *
 * @param property - Dados atuais do ativo em edição
 * @param initial - Dados originais para comparação (null em criação)
 * @param updateField - Callback genérico de atualização de campo
 */
function EssenceStep({ 
  property, initial, updateField 
}: { 
  property: OwnProperty; initial: OwnProperty | null; updateField: <K extends keyof OwnProperty>(f: K, v: OwnProperty[K]) => void 
}) {
    const getVal = (v: OwnProperty['title'] | OwnProperty['description']) => typeof v === 'string' ? v : v?.pt || ""
    return (
        <div className="grid gap-6">
            <BrutalField label="Título" value={getVal(property.title)} savedValue={initial ? getVal(initial.title) : ""} onChange={(v) => updateField('title', v as string)} onRevert={() => updateField('title', initial?.title || "")} />
            <BrutalField label="Descrição" value={getVal(property.description)} savedValue={initial ? getVal(initial.description) : ""} onChange={(v) => updateField('description', v as string)} onRevert={() => updateField('description', initial?.description || "")} multiline rows={4} />
            <BrutalField label="Valor Base (€)" type="number" value={property.price as number} savedValue={initial?.price || 0} onChange={(v) => updateField('price', Number(v))} onRevert={() => updateField('price', initial?.price || 0)} />
        </div>
    )
}

/**
 * LocationStep — Estágio 02: Logística e Distribuição Geográfica.
 *
 * @description Campos de região, cidade e morada do ativo.
 * Permite localização precisa para indexação no sistema Nexus.
 *
 * @param property - Dados atuais do ativo em edição
 * @param initial - Dados originais para comparação
 * @param updateField - Callback genérico de atualização de campo
 */
function LocationStep({ 
  property, initial, updateField 
}: { 
  property: OwnProperty; initial: OwnProperty | null; updateField: <K extends keyof OwnProperty>(f: K, v: OwnProperty[K]) => void 
}) {
    return (
        <div className="grid gap-6">
            <BrutalField label="Região" value={property.location as string} savedValue={initial?.location || ""} onChange={(v) => updateField('location', v as string)} onRevert={() => updateField('location', initial?.location || "")} />
            <div className="grid grid-cols-2 gap-6">
                <BrutalField label="Cidade" value={property.city as string} savedValue={initial?.city || ""} onChange={(v) => updateField('city', v as string)} onRevert={() => updateField('city', initial?.city || "")} />
                <BrutalField label="Morada" value={property.address as string} savedValue={initial?.address || ""} onChange={(v) => updateField('address', v as string)} onRevert={() => updateField('address', initial?.address || "")} />
            </div>
        </div>
    )
}

/**
 * AmenitiesStep — Estágio 03: Matriz de Comodidades do Ativo.
 *
 * @description Integra o campo `AmenitiesField` para seleção de
 * serviços e comodidades disponíveis no catálogo Nexus.
 *
 * @param property - Dados atuais do ativo
 * @param initial - Dados originais para reversão
 * @param updateField - Callback genérico de atualização de campo
 */
function AmenitiesStep({ 
  property, initial, updateField 
}: { 
  property: OwnProperty; initial: OwnProperty | null; updateField: <K extends keyof OwnProperty>(f: K, v: OwnProperty[K]) => void 
}) {
    return (
        <BrutalSurface variant="pro" padding="md">
            <AmenitiesField 
                selectedIds={property.amenityIds || []} savedIds={initial?.amenityIds || []} 
                onUpdateIds={(ids) => updateField('amenityIds', ids)} onRevert={() => updateField('amenityIds', initial?.amenityIds || [])} 
            />
        </BrutalSurface>
    )
}

/**
 * PermissionsStep — Estágio 04: Gestão de Equipa e Colaboradores.
 *
 * @description Permite adicionar colaboradores ao ativo antes de publicar.
 * As permissões efetivas dependem do nível de acesso Nexus de cada utilizador.
 *
 * @param property - Dados atuais do ativo
 * @param updateField - Callback genérico de atualização de campo
 */
function PermissionsStep({ 
  property, updateField 
}: { 
  property: OwnProperty; updateField: <K extends keyof OwnProperty>(f: K, v: OwnProperty[K]) => void 
}) {
    return (
        <div className="space-y-6">
            <p className="text-sm font-serif italic text-[#8C7B6B] dark:text-zinc-500">
                Opcional. Podes convidar colegas antes de publicar — as permissões efetivas dependem do nível de acesso Nexus.
            </p>
            <CollaboratorManager 
                isCard={false}
                permissions={property.permissions || []} 
                onAdd={(email, level) => updateField("permissions", [...(property.permissions || []), { email, level }])}
                onRemove={(email) => updateField("permissions", (property.permissions || []).filter(p => p.email !== email))}
            />
        </div>
    )
}

/**
 * PreviewStep — Estágio 05: Revisão Final e Mockup de Publicação.
 *
 * @description Mostra uma pré-visualização do ativo usando o `PropertyCardItem`
 * e um resumo dos dados principais para validação antes da gravação.
 *
 * @param property - Dados completos do ativo para revisão
 */
function PreviewStep({ property }: { property: OwnProperty }) {
    const titleStr = typeof property.title === "string" ? property.title : property.title?.pt || "—"
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="min-w-0">
                <PropertyCardItem prop={property} onSelect={() => {}} variant="portfolio" />
            </div>
            <BrutalSurface variant="pro" padding="lg" className="space-y-6">
                <div>
                    <h3 className="font-serif text-xl font-bold italic uppercase tracking-tight text-[#0D0D0D] dark:text-white">Protocolo_Final // Resumo</h3>
                    <p className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#8C7B6B] dark:text-zinc-500">Confere os dados principais antes de guardar no Nexus_Core.</p>
                </div>
                <ul className="space-y-4 border-t border-[#0D0D0D]/10 pt-4 dark:border-zinc-800">
                    {[
                        { l: "Título", v: titleStr, i: Home },
                        { l: "Local", v: `${property.city} · ${property.location}`, i: MapPin },
                        { l: "Preço base", v: `${property.price} €`, i: Sparkles },
                        { l: "Lotação", v: `${property.maxGuests} hóspedes`, i: Users },
                    ].map((item, i) => (
                        <li key={i} className="flex gap-3">
                            <item.i className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-[#8C7B6B]">{item.l}</p>
                                <p className="text-sm font-medium text-[#0D0D0D] dark:text-zinc-100">{item.v}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </BrutalSurface>
        </div>
    )
}

/**
 * WizardFooter — Navegação e Ações de Comando do Wizard.
 *
 * @description Barra inferior com botões de "Sair", "Anterior", "Seguinte"
 * e "Guardar" (no último passo). Adapta-se automaticamente à etapa ativa.
 *
 * @param step - Etapa ativa do wizard
 * @param isSaving - Estado de persistência no backend
 * @param onBack - Callback para retroceder uma etapa
 * @param onNext - Callback para avançar uma etapa
 * @param onSave - Callback para disparar a gravação final
 * @param onClose - Callback para encerrar o wizard sem guardar
 */
function WizardFooter({ 
    step, isSaving, onBack, onNext, onSave, onClose 
}: { 
    step: WizardStep; isSaving: boolean; isEdit: boolean; onBack: () => void; onNext: () => void; onSave: () => void; onClose: () => void 
}) {
    return (
        <div className="mt-12 flex flex-col gap-4 border-t border-[#0D0D0D]/15 pt-8 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
            <BrutalButton type="button" variant="brutal-wizard-exit" onClick={onClose}>
                Sair
            </BrutalButton>
            <div className="flex flex-wrap gap-3">
                {step !== "essence" && (
                    <BrutalButton type="button" variant="brutal-wizard-back" onClick={onBack}>
                        Anterior
                    </BrutalButton>
                )}
                {step === "preview" ? (
                    <BrutalButton type="button" variant="brutal-wizard-save" onClick={onSave} disabled={isSaving}>
                        {isSaving ? "A guardar…" : "Guardar propriedade"} <Save size={16} strokeWidth={2} />
                    </BrutalButton>
                ) : (
                    <BrutalButton type="button" variant="brutal-wizard-next" onClick={onNext}>
                        Seguinte <ArrowRight size={16} strokeWidth={2} />
                    </BrutalButton>
                )}
            </div>
        </div>
    )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * PropertyCreationWizard — Orchestrador da Criação e Edição Rápida de Ativos.
 *
 * @description Wizard multi-etapa que guia o utilizador através de fluxos
 * lógicos de parametrização de ativos, garantindo integridade de dados
 * e feedback visual contínuo. Utiliza o hook `usePropertyForm` para
 * gestão centralizada do estado do formulário.
 *
 * @see usePropertyForm — Hook de orquestração de estado (hooks.ts)
 * @see pageVariants — Animações de transição (animations.ts)
 */
export function PropertyCreationWizard({ property: initialData, onClose, onSaved }: PropertyFormProps) {
    const { property, step, isSaving, isEdit, updateField, nextStep, prevStep, handleFinalSave } = usePropertyForm(initialData, onSaved)

    return (
        <motion.div 
            variants={nexusEntrance}
            initial="initial"
            animate="animate"
            className="flex flex-col min-h-[80vh]"
        >
            {/* Indicador de Progresso */}
            <WizardProgress currentStep={step} isEdit={isEdit} />
            
            {/* Content Display com Animação de Transição */}
            <AnimatePresence mode="wait">
                <motion.div key={step} initial="initial" animate="animate" exit="exit" variants={pageVariants} className="flex-1">
                    {step === 'essence' && <EssenceStep property={property} initial={initialData} updateField={updateField} />}
                    {step === 'location' && <LocationStep property={property} initial={initialData} updateField={updateField} />}
                    {step === 'amenities' && <AmenitiesStep property={property} initial={initialData} updateField={updateField} />}
                    {step === 'permissions' && <PermissionsStep property={property} updateField={updateField} />}
                    {step === 'preview' && <PreviewStep property={property} />}
                </motion.div>
            </AnimatePresence>

            {/* Comandos de Navegação */}
            <WizardFooter 
                step={step} isSaving={isSaving} isEdit={isEdit} 
                onBack={prevStep} onNext={nextStep} onSave={handleFinalSave} onClose={onClose} 
            />
        </motion.div>
    )
}

/**
 * Re-export com nome legado para compatibilidade.
 * @deprecated Usar `PropertyCreationWizard` directamente.
 */
export const PropertyForm = PropertyCreationWizard
