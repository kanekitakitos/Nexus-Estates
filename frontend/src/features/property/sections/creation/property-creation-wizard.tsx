"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { 
  Layout, ArrowRight, Save, 
  Users, Home, MapPin, Sparkles, Image as ImageIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { notify } from "@/lib/notify"

import { usePropertyForm } from "../../model/hooks"
import { OwnProperty, WizardStep } from "@/types"
import { pageVariants, nexusEntrance } from "../../lib/animations"
import { BoingText } from "@/components/effects/BoingText"
import { BrutalField } from "@/components/ui/forms/brutal-field"
import { BrutalButton } from "@/components/ui/forms/button"
import { BrutalSurface } from "@/components/ui/layout/brutal-surface"
import { ImageInput } from "@/components/ui/file-handler/imageInput"
import { AmenitiesField } from "../../components/amenities-field"
import { PropertyCardItem } from "../../components/property-card-item"
import { CollaboratorManager } from "../../components/collaborator-manager"
import { propertyCopy, propertyTokens } from "../../lib/property-tokens"

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
    { key: "essence", label: propertyCopy.wizard.stepEssenceLabel, n: propertyCopy.wizard.stepEssenceN },
    { key: "location", label: propertyCopy.wizard.stepLocationLabel, n: propertyCopy.wizard.stepLocationN },
    { key: "amenities", label: propertyCopy.wizard.stepAmenitiesLabel, n: propertyCopy.wizard.stepAmenitiesN },
    { key: "permissions", label: propertyCopy.wizard.stepPermissionsLabel, n: propertyCopy.wizard.stepPermissionsN },
    { key: "preview", label: propertyCopy.wizard.stepPreviewLabel, n: propertyCopy.wizard.stepPreviewN },
]

const TITLE_MAX_LENGTH = 20

// ─── Sub-Componentes de UI ──────────────────────────────────────────────────

function resolveStr(value: unknown): string {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "object") {
        const obj = value as Record<string, unknown>
        return (typeof obj["pt"] === "string" ? (obj["pt"] as string) : "") || (typeof obj["en"] === "string" ? (obj["en"] as string) : "") || ""
    }
    return ""
}

type WizardErrors = Partial<Record<"title" | "description" | "price" | "maxGuests" | "location" | "city" | "address", string>>

function validateStep(step: WizardStep, property: OwnProperty): WizardErrors {
    const errors: WizardErrors = {}
    const title = resolveStr(property.title).trim()
    const description = resolveStr(property.description).trim()

    if (step === "essence" || step === "preview") {
        if (!title) errors.title = "Título é obrigatório"
        else if (title.length < 3) errors.title = "Título demasiado curto"
        else if (title.length > TITLE_MAX_LENGTH) errors.title = `Título demasiado longo (máx. ${TITLE_MAX_LENGTH} caracteres)`

        if (!description) errors.description = "Descrição é obrigatória"
        else if (description.length < 10) errors.description = "Descrição demasiado curta"

        const price = Number(property.price)
        if (!Number.isFinite(price) || price <= 0) errors.price = "Valor base inválido"

        const maxGuests = Number(property.maxGuests)
        if (!Number.isFinite(maxGuests) || maxGuests < 1) errors.maxGuests = "Capacidade inválida"
    }

    if (step === "location" || step === "preview") {
        if (!String(property.location || "").trim()) errors.location = "Região é obrigatória"
        if (!String(property.city || "").trim()) errors.city = "Cidade é obrigatória"
        if (!String(property.address || "").trim()) errors.address = "Morada é obrigatória"
    }

    return errors
}

function buildStepValidationNotice() {
    return {
        title: "Faltam campos obrigatórios",
        description: "Preenche os campos assinalados a vermelho para continuar.",
    }
}

function WizardLivePreview({ property }: { property: OwnProperty }) {
    const title = resolveStr(property.title) || propertyCopy.cards.fallbackTitle
    return (
        <div className="sticky top-6 space-y-4">
            <div className="rounded-3xl border-2 border-[#0D0D0D]/10 bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/60">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black uppercase tracking-[0.35em] text-primary">
                        Live_Preview
                    </span>
                    <span className="font-mono text-[9px] font-black uppercase tracking-[0.35em] text-[#8C7B6B] dark:text-zinc-500">
                        Draft
                    </span>
                </div>
            </div>
            <div className="min-w-0">
                <PropertyCardItem
                    prop={{
                        ...property,
                        title,
                        description: resolveStr(property.description),
                        imageUrl: property.imageUrl || property.imageUrl,
                    }}
                    onSelect={() => {}}
                    variant="grid"
                />
            </div>
        </div>
    )
}

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
function WizardProgress({ currentStep, isEdit, onSelectStep }: { currentStep: WizardStep; isEdit: boolean; onSelectStep?: (step: WizardStep) => void }) {
    const currentIdx = STEPS_META.findIndex((s) => s.key === currentStep)
    return (
        <div className={cn(propertyTokens.ui.wizard.progressWrapClass, "pt-5")}>
            <div className="flex items-start gap-4 min-w-0">
                <div className={propertyTokens.ui.wizard.progressIconWrapClass}>
                    <Layout className="h-6 w-6" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                    <p className={propertyTokens.ui.wizard.progressProtocolClass}>
                        {isEdit ? propertyCopy.wizard.editProtocol : propertyCopy.wizard.createProtocol}
                    </p>
                    <h2 className={propertyTokens.ui.wizard.progressTitleClass}>
                        <BoingText
                            text={STEPS_META.find((s) => s.key === currentStep)?.label || ""}
                            color="currentColor"
                            activeColor={propertyTokens.ui.preview.boingActiveColor}
                        />
                    </h2>
                </div>
            </div>
            <div className="w-full md:w-auto md:self-center">
                <ol className="flex max-w-full items-center justify-start gap-2 overflow-x-auto pb-2 md:justify-end">
                    {STEPS_META.map((s, idx) => (
                        <li key={s.key} className="shrink-0">
                            <button
                                type="button"
                                onClick={() => onSelectStep?.(s.key)}
                                className={cn(
                                    "group flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all whitespace-nowrap",
                                    currentStep === s.key
                                        ? "border-primary bg-primary/15 text-primary"
                                        : idx < currentIdx
                                          ? "border-emerald-600/40 bg-emerald-50 text-emerald-800 hover:border-emerald-700/60 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                          : propertyTokens.ui.wizard.progressPendingStepClass
                                )}
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs font-black font-mono">
                                    {s.n}
                                </span>
                                <span className="font-mono text-[9px] font-black uppercase tracking-widest opacity-70 group-hover:opacity-100">
                                    {s.label}
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>
            </div>
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
  property, initial, updateField, invalid
}: { 
  property: OwnProperty
  initial: OwnProperty | null
  updateField: <K extends keyof OwnProperty>(f: K, v: OwnProperty[K]) => void
  invalid?: Partial<Record<"title" | "description" | "price" | "maxGuests", boolean>>
}) {
    const getVal = (v: OwnProperty['title'] | OwnProperty['description']) => typeof v === 'string' ? v : v?.pt || ""
    return (
        <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="min-w-0 lg:col-span-2">
                    <BrutalField
                        label={propertyCopy.wizard.essenceTitleLabel}
                        value={getVal(property.title)}
                        savedValue={initial ? getVal(initial.title) : ""}
                        onChange={(v) => updateField('title', v as string)}
                        onRevert={() => updateField('title', initial?.title || "")}
                        invalid={Boolean(invalid?.title)}
                        maxLength={TITLE_MAX_LENGTH}
                    />
                </div>
                <div className="min-w-0 lg:col-span-2">
                    <BrutalField
                        label={propertyCopy.wizard.essenceDescriptionLabel}
                        value={getVal(property.description)}
                        savedValue={initial ? getVal(initial.description) : ""}
                        onChange={(v) => updateField('description', v as string)}
                        onRevert={() => updateField('description', initial?.description || "")}
                        multiline
                        rows={5}
                        invalid={Boolean(invalid?.description)}
                    />
                </div>
                <BrutalField
                    label={propertyCopy.wizard.essenceBaseValueLabel}
                    type="number"
                    value={property.price as number}
                    savedValue={initial?.price || 0}
                    onChange={(v) => updateField('price', Number(v))}
                    onRevert={() => updateField('price', initial?.price || 0)}
                    invalid={Boolean(invalid?.price)}
                />
                <BrutalField
                    label={propertyCopy.wizard.previewLabelCapacity}
                    type="number"
                    value={property.maxGuests as number}
                    savedValue={initial?.maxGuests || 1}
                    onChange={(v) => updateField('maxGuests', Number(v))}
                    onRevert={() => updateField('maxGuests', initial?.maxGuests || 1)}
                    invalid={Boolean(invalid?.maxGuests)}
                />
            </div>

            <BrutalSurface variant="pro" padding="md">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0D0D0D] bg-white shadow-[2px_2px_0_0_#0D0D0D] dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
                            <ImageIcon className="h-5 w-5 text-primary" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-[#8C7B6B] dark:text-zinc-500">
                                {propertyCopy.details.mediaTitle}
                            </p>
                            <h3 className="truncate font-serif text-lg font-bold italic uppercase tracking-tight text-[#0D0D0D] dark:text-zinc-100">
                                {propertyCopy.details.mediaSubtitle}
                            </h3>
                        </div>
                    </div>
                </div>
                <p className={propertyTokens.ui.details.mediaHintClass}>{propertyCopy.details.mediaHint}</p>
                <div className="mt-4">
                    <ImageInput
                        value={property.imageUrl || ""}
                        onChange={(url) => updateField("imageUrl", url)}
                        onUploadComplete={(urls) => {
                            const next = urls?.[0] || ""
                            if (next) updateField("imageUrl", next)
                        }}
                        onRemove={() => updateField("imageUrl", "")}
                    />
                </div>
            </BrutalSurface>
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
  property, initial, updateField, invalid
}: { 
  property: OwnProperty
  initial: OwnProperty | null
  updateField: <K extends keyof OwnProperty>(f: K, v: OwnProperty[K]) => void
  invalid?: Partial<Record<"location" | "city" | "address", boolean>>
}) {
    return (
        <div className="grid gap-6">
            <BrutalField label={propertyCopy.wizard.locationRegionLabel} value={property.location as string} savedValue={initial?.location || ""} onChange={(v) => updateField('location', v as string)} onRevert={() => updateField('location', initial?.location || "")} invalid={Boolean(invalid?.location)} />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <BrutalField label={propertyCopy.wizard.locationCityLabel} value={property.city as string} savedValue={initial?.city || ""} onChange={(v) => updateField('city', v as string)} onRevert={() => updateField('city', initial?.city || "")} invalid={Boolean(invalid?.city)} />
                <BrutalField label={propertyCopy.wizard.locationAddressLabel} value={property.address as string} savedValue={initial?.address || ""} onChange={(v) => updateField('address', v as string)} onRevert={() => updateField('address', initial?.address || "")} invalid={Boolean(invalid?.address)} />
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
        <BrutalSurface variant="pro" padding="lg" className="overflow-hidden">
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
            <p className={propertyTokens.ui.wizard.permissionsHintClass}>
                {propertyCopy.wizard.permissionsHint}
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
    const titleStr = typeof property.title === "string" ? property.title : property.title?.pt || propertyCopy.wizard.previewTitleFallback
    const descStr = typeof property.description === "string" ? property.description : property.description?.pt || ""
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="min-w-0">
                <div className="mb-4 rounded-3xl border-2 border-[#0D0D0D]/10 bg-white/70 p-4 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/40">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
                        Preview_Card
                    </span>
                </div>
                <PropertyCardItem prop={property} onSelect={() => {}} variant="grid" />
            </div>
            <BrutalSurface variant="pro" padding="lg" className="space-y-6 min-w-0">
                <div>
                    <h3 className={propertyTokens.ui.wizard.previewTitleClass}>{propertyCopy.wizard.previewSummaryTitle}</h3>
                    <p className={propertyTokens.ui.wizard.previewSubtitleClass}>{propertyCopy.wizard.previewSummarySubtitle}</p>
                </div>
                <ul className={propertyTokens.ui.wizard.previewListClass}>
                    {[
                        { l: propertyCopy.wizard.previewLabelTitle, v: titleStr, i: Home },
                        { l: propertyCopy.wizard.previewLabelLocation, v: `${property.city}${propertyCopy.wizard.previewLocationJoiner}${property.location}`, i: MapPin },
                        { l: propertyCopy.wizard.previewLabelBasePrice, v: `${property.price}${propertyCopy.wizard.previewPriceSuffix}`, i: Sparkles },
                        { l: propertyCopy.wizard.previewLabelCapacity, v: `${property.maxGuests}${propertyCopy.wizard.previewGuestsSuffix}`, i: Users },
                    ].map((item, i) => (
                        <li key={i} className="flex gap-3">
                            <item.i className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                            <div>
                                <p className={propertyTokens.ui.wizard.previewLabelClass}>{item.l}</p>
                                <p className={propertyTokens.ui.wizard.previewValueClass}>{item.v}</p>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="pt-2">
                    <p className={propertyTokens.ui.wizard.previewLabelClass}>{propertyCopy.wizard.essenceDescriptionLabel}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#0D0D0D]/80 dark:text-zinc-200 min-w-0">
                        {descStr || propertyCopy.preview.descriptionMissing}
                    </p>
                </div>
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
        <div className={propertyTokens.ui.wizard.footerWrapClass}>
            <BrutalButton type="button" variant="brutal-wizard-exit" onClick={onClose}>
                {propertyCopy.wizard.footerExit}
            </BrutalButton>
            <div className="flex flex-wrap gap-3">
                {step !== "essence" && (
                    <BrutalButton type="button" variant="brutal-wizard-back" onClick={onBack}>
                        {propertyCopy.wizard.footerBack}
                    </BrutalButton>
                )}
                {step === "preview" ? (
                    <BrutalButton type="button" variant="brutal-wizard-save" onClick={onSave} disabled={isSaving}>
                        {isSaving ? propertyCopy.wizard.footerSaving : propertyCopy.wizard.footerSave} <Save size={16} strokeWidth={2} />
                    </BrutalButton>
                ) : (
                    <BrutalButton type="button" variant="brutal-wizard-next" onClick={onNext}>
                        {propertyCopy.wizard.footerNext} <ArrowRight size={16} strokeWidth={2} />
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
    const { property, step, isSaving, isEdit, updateField, goToStep, nextStep, prevStep, handleFinalSave } = usePropertyForm(initialData, onSaved)
    const errors = validateStep(step, property)
    const canProceed = Object.keys(errors).length === 0
    const [validationArmed, setValidationArmed] = React.useState<Partial<Record<WizardStep, boolean>>>({})

    const armValidation = (stepToArm: WizardStep) => {
        setValidationArmed((prev) => ({ ...prev, [stepToArm]: true }))
    }

    const onSelectStep = (next: WizardStep) => {
        const currentIdx = STEPS_META.findIndex((s) => s.key === step)
        const nextIdx = STEPS_META.findIndex((s) => s.key === next)
        if (nextIdx <= currentIdx) return goToStep(next)
        if (!canProceed) {
            armValidation(step)
            const notice = buildStepValidationNotice()
            notify.warning(notice.title, { description: notice.description })
            return
        }
        const safeNext = STEPS_META[Math.min(currentIdx + 1, STEPS_META.length - 1)]?.key
        return goToStep(safeNext)
    }

    const onNext = () => {
        const nextErrors = validateStep(step, property)
        if (Object.keys(nextErrors).length > 0) {
            armValidation(step)
            const notice = buildStepValidationNotice()
            notify.warning(notice.title, { description: notice.description })
            return
        }
        nextStep()
    }

    const onSave = () => {
        const finalErrors = validateStep("preview", property)
        if (Object.keys(finalErrors).length > 0) {
            const notice = buildStepValidationNotice()
            const essenceErrors = validateStep("essence", property)
            const locationErrors = validateStep("location", property)
            if (Object.keys(essenceErrors).length > 0) {
                armValidation("essence")
                goToStep("essence")
            } else if (Object.keys(locationErrors).length > 0) {
                armValidation("location")
                goToStep("location")
            }
            notify.warning(notice.title, { description: notice.description })
            return
        }
        handleFinalSave()
    }

    return (
        <motion.div 
            variants={nexusEntrance}
            initial="initial"
            animate="animate"
            className="flex flex-col min-h-[80vh] pt-5"
        >
            {/* Indicador de Progresso */}
            <WizardProgress currentStep={step} isEdit={isEdit} onSelectStep={onSelectStep} />
            
            {/* Content Display com Animação de Transição */}
            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
                <div className="min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial="initial" animate="animate" exit="exit" variants={pageVariants} className="flex-1 min-w-0">
                            {step === 'essence' && (
                                <div className="space-y-6">
                                    <EssenceStep
                                        property={property}
                                        initial={initialData}
                                        updateField={updateField}
                                        invalid={
                                            validationArmed.essence
                                                ? {
                                                      title: Boolean(errors.title),
                                                      description: Boolean(errors.description),
                                                      price: Boolean(errors.price),
                                                      maxGuests: Boolean(errors.maxGuests),
                                                  }
                                                : undefined
                                        }
                                    />
                                </div>
                            )}
                            {step === 'location' && (
                                <div className="space-y-6">
                                    <LocationStep
                                        property={property}
                                        initial={initialData}
                                        updateField={updateField}
                                        invalid={
                                            validationArmed.location
                                                ? {
                                                      location: Boolean(errors.location),
                                                      city: Boolean(errors.city),
                                                      address: Boolean(errors.address),
                                                  }
                                                : undefined
                                        }
                                    />
                                </div>
                            )}
                            {step === 'amenities' && <AmenitiesStep property={property} initial={initialData} updateField={updateField} />}
                            {step === 'permissions' && <PermissionsStep property={property} updateField={updateField} />}
                            {step === 'preview' && (
                                <div className="space-y-6">
                                    <PreviewStep property={property} />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="hidden lg:block">
                    <WizardLivePreview property={property} />
                </div>
            </div>

            {/* Comandos de Navegação */}
            <WizardFooter 
                step={step} isSaving={isSaving} isEdit={isEdit} 
                onBack={prevStep} onNext={onNext} onSave={onSave} onClose={onClose} 
            />
        </motion.div>
    )
}

/**
 * Re-export com nome legado para compatibilidade.
 * @deprecated Usar `PropertyCreationWizard` directamente.
 */
export const PropertyForm = PropertyCreationWizard
