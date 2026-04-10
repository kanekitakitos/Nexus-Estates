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
import { BoingText } from "@/components/BoingText"
import { nexusEntrance, staggerContainer, itemFadeUp, microPop } from "../../animations"

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
                    : "border-[#0D0D0D]/12 bg-white hover:border-[#0D0D0D]/25 dark:border-zinc-700 dark:bg-zinc-900/80"
            )}
        >
            <div className="flex items-center gap-2.5">
                <Icon size={16} className={cn(isActive ? "text-primary" : color)} strokeWidth={2.5} />
                <span className="text-xs font-medium text-[#0D0D0D] dark:text-zinc-200">{label}</span>
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
            title="Identidade & Preço"
            subtitle="Definição base do ativo"
            icon={<Info size={20} strokeWidth={2.5} />}
            iconBgColor="bg-primary/10 border-primary/20"
            iconTextColor="text-primary"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <BrutalField 
                    label="Título do Ativo" 
                    value={draft.title as string} 
                    savedValue={initial.title as string} 
                    onChange={(v) => updateField('title', v as string)} 
                    onRevert={() => updateField('title', initial.title as string)} 
                />
                <BrutalField 
                    label="Preço por Noite (€)" 
                    type="number" 
                    value={draft.price as number} 
                    savedValue={initial.price as number} 
                    onChange={(v) => updateField('price', Number(v))} 
                    onRevert={() => updateField('price', initial.price as number)} 
                />
            </div>
            <BrutalField 
                label="Descrição Técnica" 
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
            title="Imagem Principal"
            subtitle="Representação visual de catálogo"
            icon={<Sparkles size={20} strokeWidth={2.5} />}
            iconBgColor="bg-amber-500/10 border-amber-500/20"
            iconTextColor="text-amber-600"
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
                    <p className="text-xs leading-relaxed text-[#8C7B6B] dark:text-zinc-500 font-medium font-serif italic">
                        Esta imagem será o "face" do ativo em todos os protocolos de listagem e sincronização externa. Recomenda-se formato 16:9.
                    </p>
                    <div className="pt-2">
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-[#0D0D0D]/5 bg-[#FAFAF5]/50 px-4 py-3 transition-colors hover:border-primary/20 dark:border-white/5 dark:bg-zinc-900/40">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded-md border-2 border-primary text-primary focus:ring-primary/20"
                                checked={!!draft.featured}
                                onChange={(e) => updateField("featured", e.target.checked)}
                            />
                            <Star className={cn("h-4 w-4", draft.featured ? "text-primary fill-current" : "text-[#8C7B6B]")} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] dark:text-zinc-300">Destaque de Portfólio</span>
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
        <div className="rounded-3xl border-2 border-[#0D0D0D] bg-white p-6 shadow-[8px_8px_0_0_#0D0D0D] dark:border-zinc-100 dark:bg-zinc-950 dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)]">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#0D0D0D] dark:text-zinc-100">
                    <BoingText text="Estado Operacional" color="currentColor" activeColor="#F97316" />
                </h3>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="grid gap-3">
                <StatusToggle label="Ativo / Disponível" icon={CheckCircle2} color="text-emerald-500" isActive={status === "AVAILABLE"} onClick={() => onUpdate("AVAILABLE")} />
                <StatusToggle label="Protocolo Manutenção" icon={Timer} color="text-amber-500" isActive={status === "MAINTENANCE"} onClick={() => onUpdate("MAINTENANCE")} />
                <StatusToggle label="Ocupação / Bloqueado" icon={AlertCircle} color="text-rose-500" isActive={status === "BOOKED"} onClick={() => onUpdate("BOOKED")} />
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
            title="Localização & Lotação"
            subtitle="Geografia e fluxos"
            icon={<Globe size={20} strokeWidth={2.5} />}
            iconBgColor="bg-indigo-500/10 border-indigo-500/20"
            iconTextColor="text-indigo-500"
            tone="cream"
        >
            <div className="space-y-6">
                <BrutalField 
                    label="Região / Zona" value={draft.location as string} savedValue={initial.location as string} 
                    onChange={(v) => updateField('location', v as string)} onRevert={() => updateField('location', initial.location as string)} 
                />
                <div className="grid grid-cols-2 gap-4">
                    <BrutalField 
                        label="Cidade" value={draft.city as string} savedValue={initial.city as string} 
                        onChange={(v) => updateField('city', v as string)} onRevert={() => updateField('city', initial.city as string)} 
                    />
                    <BrutalField 
                        label="Capacidade Máx." type="number" value={draft.maxGuests as number} savedValue={initial.maxGuests as number} 
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
        <div className="overflow-hidden rounded-3xl border-2 border-[#0D0D0D] bg-white shadow-[8px_8px_0_0_#0D0D0D] dark:border-zinc-100 dark:bg-zinc-950 dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-4 border-b-2 border-[#0D0D0D]/10 bg-[#0D0D0D] px-5 py-3 dark:bg-zinc-900/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm">
                    <Trash2 size={16} className={cn(isDeleting && "animate-spin")} />
                </div>
                <div className="min-w-0">
                    <h4 className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-white">Critical_Zone</h4>
                    <p className="truncate font-serif text-[11px] font-bold italic text-zinc-50/80">Protocolo de Exclusão</p>
                </div>
            </div>

            <div className="p-6">
                <p className="text-[10px] font-bold leading-relaxed text-zinc-900/60 dark:text-zinc-400/60 font-mono">
                    <span className="text-rose-600">AVISO:</span> A remoção deste ativo da rede Nexus é terminal e irreversível. Todos os dados associados no <span className="text-rose-600 underline">Nexus_Core</span> serão apagados.
                </p>
                <button
                    type="button" onClick={onDelete} disabled={isDeleting}
                    className="mt-5 w-full rounded-xl border-2 border-[#0D0D0D] bg-white py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 transition-all hover:bg-rose-600 hover:text-white active:scale-95 shadow-[4px_4px_0_0_#FF5E1A] hover:shadow-none active:translate-x-1 active:translate-y-1"
                >
                    {isDeleting ? "EXPURGANDO DADOS..." : "AUTORIZAR EXCLUSÃO"}
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
            "rounded-3xl border-2 border-[#0D0D0D] bg-white transition-all duration-500 dark:border-white/10 dark:bg-zinc-950",
            isOpen ? "shadow-[12px_12px_0_0_#FF5E1A]" : "shadow-[8px_8px_0_0_#0D0D0D]"
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
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-2">Protocolo_Comfort // Matrix</span>
                        <h3 className="font-serif text-3xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] dark:text-white">
                            <BoingText text="Comodidades do Ativo" color="currentColor" activeColor="#F97316" />
                            <span className="ml-2 opacity-30">({selectedIds.length})</span>
                        </h3>
                    </div>
                </div>
                <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0D0D0D]/10 bg-[#FAFAF5] transition-transform duration-300 dark:bg-zinc-900",
                    isOpen ? "rotate-180" : "rotate-0 shadow-[2px_2px_0_0_#0D0D0D]"
                )}>
                    <ChevronDown size={20} className="text-[#0D0D0D] dark:text-white" />
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
                            <div className="h-px w-full bg-[#0D0D0D]/10 mb-8 dark:bg-white/10" />
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
                    <OperationalStatusSection status={draft.status} onUpdate={(s) => updateField("status", s as import("../../property-constants").PropertyStatus)} />
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
