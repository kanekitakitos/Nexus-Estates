"use client"

import { useState } from "react"
import {
    CheckCircle2, AlertCircle, Timer, Globe, Info, Sparkles, Trash2, LucideIcon, ChevronDown, Star
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { BrutalField } from "@/components/ui/forms/brutal-field"
import { BrutalCard } from "@/components/ui/data-display/brutal-card"
import { ImageInput } from "@/components/ui/file-handler/imageInput"
import { AmenitiesField } from "../../components/amenities-field"
import { BoingText } from "@/components/effects/BoingText"
import { staggerContainer, itemFadeUp } from "../../lib/animations"
import { propertyCopy, propertyTokens } from "../../lib/property-tokens"

// ─── Tipos de Props Internos ────────────────────────────────────────────────

/** Props partilhadas pelos sub-componentes de edição de dados do ativo */
interface SectionDraftProps {
    draft: OwnProperty
    initial: OwnProperty
    updateField: <K extends keyof OwnProperty>(field: K, value: OwnProperty[K]) => void
}

// ─── Sub-Componentes Internos ──────────────────────────────────────────────

/**
 * StatusToggle — Botão de seleção de estado operacional.
 *
 * @description Utilizado para alternar entre estados como Disponível,
 * Manutenção ou Bloqueado com feedback visual imediato.
 * Cada botão exibe um ícone, label e indicador de estado (dot).
 *
 * @param label - Texto descritivo do estado
 * @param icon - Componente Lucide para ícone do estado
 * @param color - Classe de cor para o ícone quando inativo
 * @param isActive - Indica se este estado está ativo
 * @param onClick - Callback para ativar este estado
 */
function StatusToggle({
    label, icon: Icon, color, isActive, onClick
}: {
    label: string; icon: LucideIcon; color: string; isActive: boolean; onClick: () => void
}) {
    return (
        <button
            type="button" onClick={onClick}
            className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors",
                isActive
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : propertyTokens.ui.details.statusInactiveClass
            )}
        >
            <div className="flex items-center gap-2.5">
                <Icon size={16} className={cn(isActive ? "text-primary" : color)} strokeWidth={2.5} />
                <span className={propertyTokens.ui.details.statusLabelClass}>{label}</span>
            </div>
            <span className={cn(
                "h-2 w-2 shrink-0 rounded-full border-2",
                isActive ? "border-primary bg-primary" : "border-zinc-300 dark:border-zinc-600"
            )} />
        </button>
    )
}

/**
 * IdentitySection — Campos base de identificação do ativo.
 *
 * @description Encapsula Título, Preço e Descrição Técnica utilizando BrutalFields.
 * Permite edição inline com feedback de dirty-state e reversão.
 *
 * @param draft - Estado atual do ativo em edição
 * @param initial - Estado original para comparação e reversão
 * @param updateField - Callback genérico para atualização de campo
 */
function IdentitySection({ draft, initial, updateField }: SectionDraftProps) {
    return (
        <BrutalCard
            title={propertyCopy.details.identityTitle}
            subtitle={propertyCopy.details.identitySubtitle}
            icon={<Info size={20} strokeWidth={2.5} />}
            iconBgColor={propertyTokens.ui.details.identityIconBgColor}
            iconTextColor={propertyTokens.ui.details.identityIconTextColor}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <BrutalField
                    label={propertyCopy.details.fieldTitle}
                    value={draft.title as string}
                    savedValue={initial.title as string}
                    onChange={(v) => updateField('title', v as string)}
                    onRevert={() => updateField('title', initial.title as string)}
                />
                <BrutalField
                    label={propertyCopy.details.fieldPrice}
                    type="number"
                    value={draft.price as number}
                    savedValue={initial.price as number}
                    onChange={(v) => updateField('price', Number(v))}
                    onRevert={() => updateField('price', initial.price as number)}
                />
            </div>
            <BrutalField
                label={propertyCopy.details.fieldDescription}
                value={draft.description as string}
                savedValue={initial.description as string}
                onChange={(v) => updateField('description', v as string)}
                onRevert={() => updateField('description', initial.description as string)}
                multiline rows={4}
            />
        </BrutalCard>
    )
}

/**
 * MediaSection — Gestão de imagem e visibilidade de destaque.
 *
 * @description Gere a imagem principal de catálogo e o estado 'Featured' do ativo.
 * Integra o componente `ImageInput` para upload/remoção de media e
 * um checkbox para marcar o ativo como "Destaque de Portfólio".
 *
 * @param draft - Estado atual do ativo
 * @param updateField - Callback genérico para atualização de campo
 */
function MediaSection({ draft, updateField }: Pick<SectionDraftProps, "draft" | "updateField">) {
    return (
        <BrutalCard
            title={propertyCopy.details.mediaTitle}
            subtitle={propertyCopy.details.mediaSubtitle}
            icon={<Sparkles size={20} strokeWidth={2.5} />}
            iconBgColor={propertyTokens.ui.details.mediaIconBgColor}
            iconTextColor={propertyTokens.ui.details.mediaIconTextColor}
        >
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/2">
                    <ImageInput
                        value={draft.imageUrl}
                        onChange={(url) => updateField("imageUrl", url)}
                        onRemove={() => updateField("imageUrl", "")}
                    />
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                    <p className={propertyTokens.ui.details.mediaHintClass}>
                        {propertyCopy.details.mediaHint}
                    </p>
                    <div className="pt-2">
                        <label className={propertyTokens.ui.details.featuredRowClass}>
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded-md border-2 border-primary text-primary focus:ring-primary/20"
                                checked={!!draft.featured}
                                onChange={(e) => updateField("featured", e.target.checked)}
                            />
                            <Star className={cn("h-4 w-4", draft.featured ? "text-primary fill-current" : propertyTokens.ui.details.featuredIconInactiveClass)} />
                            <span className={propertyTokens.ui.details.featuredLabelClass}>{propertyCopy.details.featuredLabel}</span>
                        </label>
                    </div>
                </div>
            </div>
        </BrutalCard>
    )
}

/**
 * OperationalStatusSection — Gestão do ciclo de vida do ativo.
 *
 * @description Secção brutalista para alternar o estado operacional
 * do ativo entre Disponível, Manutenção e Bloqueado.
 *
 * @param status - Estado operacional atual do ativo
 * @param onUpdate - Callback para mudar o estado operacional
 */
function OperationalStatusSection({ status, onUpdate }: { status: string; onUpdate: (s: string) => void }) {
    return (
        <div className={propertyTokens.ui.details.operationalBoxClass}>
            <div className="mb-6 flex items-center justify-between">
                <h3 className={propertyTokens.ui.details.operationalTitleClass}>
                    <BoingText text={propertyCopy.details.operationalTitle} color="currentColor" activeColor={propertyTokens.ui.preview.boingActiveColor} />
                </h3>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="grid gap-3">
                <StatusToggle label={propertyCopy.details.statusAvailable} icon={CheckCircle2} color="text-emerald-500" isActive={status === "AVAILABLE"} onClick={() => onUpdate("AVAILABLE")} />
                <StatusToggle label={propertyCopy.details.statusMaintenance} icon={Timer} color="text-amber-500" isActive={status === "MAINTENANCE"} onClick={() => onUpdate("MAINTENANCE")} />
                <StatusToggle label={propertyCopy.details.statusBooked} icon={AlertCircle} color="text-rose-500" isActive={status === "BOOKED"} onClick={() => onUpdate("BOOKED")} />
            </div>
        </div>
    )
}

/**
 * LogisticsSection — Gestão geográfica e de capacidade.
 *
 * @description Campos de Região, Cidade e Capacidade Máxima do ativo.
 *
 * @param draft - Estado atual do ativo
 * @param initial - Estado original para comparação
 * @param updateField - Callback genérico para atualização de campo
 */
function LogisticsSection({ draft, initial, updateField }: SectionDraftProps) {
    return (
        <BrutalCard
            title={propertyCopy.details.logisticsTitle}
            subtitle={propertyCopy.details.logisticsSubtitle}
            icon={<Globe size={20} strokeWidth={2.5} />}
            iconBgColor={propertyTokens.ui.details.logisticsIconBgColor}
            iconTextColor={propertyTokens.ui.details.logisticsIconTextColor}
            tone="cream"
        >
            <div className="space-y-6">
                <BrutalField
                    label={propertyCopy.details.fieldRegion} value={draft.location as string} savedValue={initial.location as string}
                    onChange={(v) => updateField('location', v as string)} onRevert={() => updateField('location', initial.location as string)}
                />
                <div className="grid grid-cols-2 gap-4">
                    <BrutalField
                        label={propertyCopy.details.fieldCity} value={draft.city as string} savedValue={initial.city as string}
                        onChange={(v) => updateField('city', v as string)} onRevert={() => updateField('city', initial.city as string)}
                    />
                    <BrutalField
                        label={propertyCopy.details.fieldCapacity} type="number" value={draft.maxGuests as number} savedValue={initial.maxGuests as number}
                        onChange={(v) => updateField('maxGuests', Number(v))} onRevert={() => updateField('maxGuests', initial.maxGuests as number)}
                    />
                </div>
            </div>
        </BrutalCard>
    )
}

/**
 * DecommissionZone — Área crítica para remoção de ativos.
 *
 * @description Design "Danger Zone" neo-brutalista para evitar exclusões acidentais.
 * Apresenta aviso visual claro e botão de confirmação com feedback de carregamento.
 *
 * @param isDeleting - Indica se uma operação de exclusão está em curso
 * @param onDelete - Callback para iniciar o processo de exclusão
 */
function DecommissionZone({ isDeleting, onDelete }: { isDeleting: boolean; onDelete: () => void }) {
    return (
        <div className={propertyTokens.ui.details.decommissionBoxClass}>
            <div className={propertyTokens.ui.details.decommissionHeaderClass}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm">
                    <Trash2 size={16} className={cn(isDeleting && "animate-spin")} />
                </div>
                <div className="min-w-0">
                    <h4 className={propertyTokens.ui.details.decommissionZoneTitleClass}>{propertyCopy.details.criticalZone}</h4>
                    <p className={propertyTokens.ui.details.decommissionZoneSubtitleClass}>{propertyCopy.details.deleteProtocolTitle}</p>
                </div>
            </div>

            <div className="p-6">
                <p className={propertyTokens.ui.details.decommissionWarningClass}>
                    <span className="text-rose-600">{propertyCopy.details.deleteWarningPrefix}</span>{" "}
                    {propertyCopy.details.deleteWarningBodyPrefix}{" "}
                    <span className="text-rose-600 underline">{propertyCopy.details.deleteWarningCore}</span>{" "}
                    {propertyCopy.details.deleteWarningBodySuffix}
                </p>
                <button
                    type="button" onClick={onDelete} disabled={isDeleting}
                    className={propertyTokens.ui.details.decommissionButtonClass}
                >
                    {isDeleting ? propertyCopy.details.deleting : propertyCopy.details.authorizeDelete}
                </button>
            </div>
        </div>
    )
}

/**
 * AmenitiesSection — Secção expansível para gestão da matriz de comodidades.
 *
 * @description Painel expansível com animação Framer Motion que integra o
 * componente `AmenitiesField` para seleção interativa de comodidades.
 * Exibe contagem de itens selecionados e suporta reversão ao estado original.
 *
 * @param selectedIds - Array de IDs de comodidades selecionadas
 * @param savedIds - Array de IDs originais para comparação e reversão
 * @param onUpdateIds - Callback para atualizar a lista de IDs
 * @param onRevert - Callback para reverter ao estado original
 */
function AmenitiesSection({
    selectedIds, savedIds, onUpdateIds, onRevert
}: {
    selectedIds: number[]; savedIds: number[]; onUpdateIds: (ids: number[]) => void; onRevert: () => void
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={cn(
            propertyTokens.ui.details.amenitiesBoxClass,
            isOpen ? propertyTokens.ui.details.amenitiesShadowOpenClass : propertyTokens.ui.details.amenitiesShadowClosedClass
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-6 md:px-10 md:py-8"
            >
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-colors",
                        isOpen ? "bg-primary border-primary text-white" : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                        <Sparkles size={24} strokeWidth={2} />
                    </div>
                    <div className="text-left">
                        <span className={propertyTokens.ui.details.amenitiesKickerClass}>{propertyCopy.details.amenitiesKicker}</span>
                        <h3 className={propertyTokens.ui.details.amenitiesTitleClass}>
                            <BoingText text={propertyCopy.details.amenitiesTitle} color="currentColor" activeColor={propertyTokens.ui.preview.boingActiveColor} />
                            <span className="ml-2 opacity-30">({selectedIds.length})</span>
                        </h3>
                    </div>
                </div>
                <div className={cn(
                    propertyTokens.ui.details.amenitiesChevronWrapClass,
                    isOpen ? "rotate-180" : cn("rotate-0", propertyTokens.ui.details.amenitiesChevronShadowClass)
                )}>
                    <ChevronDown size={20} className={propertyTokens.ui.details.amenitiesChevronIconClass} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-10 md:px-10 lg:px-12">
                            <div className={propertyTokens.ui.details.amenitiesDividerClass} />
                            <AmenitiesField
                                selectedIds={selectedIds}
                                savedIds={savedIds}
                                onUpdateIds={onUpdateIds}
                                onRevert={onRevert}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * DetailsSection — Secção de Edição Detalhada do Ativo.
 *
 * @description Orchestrador de campos e secções para gestão completa
 * do ativo, desde identidade visual até protocolos de segurança e comodidades.
 * Layout em grelha de 12 colunas com separação visual entre:
 * - Coluna Esquerda (7 cols): Identidade e Media
 * - Coluna Direita (5 cols): Estado Operacional, Logística e Exclusão
 * - Full Width (12 cols): Comodidades
 *
 * @see IdentitySection — Campos de título, preço e descrição
 * @see MediaSection — Gestão de imagem e destaque
 * @see OperationalStatusSection — Ciclo de vida do ativo
 * @see LogisticsSection — Região, cidade e capacidade
 * @see DecommissionZone — Exclusão definitiva
 * @see AmenitiesSection — Matriz de comodidades expansível
 */
export function DetailsSection({
    draft, initial, updateField, isDeleting, onDelete
}: SectionDraftProps & { isDeleting: boolean; onDelete: () => void }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mx-auto max-w-7xl"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <motion.div variants={itemFadeUp} className="lg:col-span-7 space-y-8">
                    <IdentitySection draft={draft} initial={initial} updateField={updateField} />
                    <MediaSection draft={draft} updateField={updateField} />
                </motion.div>

                <motion.div variants={itemFadeUp} className="lg:col-span-5 space-y-8">
                    <OperationalStatusSection status={draft.status} onUpdate={(s) => updateField("status", s as import("../../model/property-constants").PropertyStatus)} />
                    <LogisticsSection draft={draft} initial={initial} updateField={updateField} />
                    <DecommissionZone isDeleting={isDeleting} onDelete={onDelete} />
                </motion.div>

                <motion.div variants={itemFadeUp} className="lg:col-span-12">
                    <AmenitiesSection
                        selectedIds={draft.amenityIds || []}
                        savedIds={initial.amenityIds || []}
                        onUpdateIds={(ids) => updateField('amenityIds', ids)}
                        onRevert={() => updateField('amenityIds', initial.amenityIds || [])}
                    />
                </motion.div>
            </div>
        </motion.div>
    )
}
