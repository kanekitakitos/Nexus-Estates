"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Eye, LayoutDashboard, Settings, Undo2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { BrutalButton } from "@/components/ui/forms/button"
import { PreviewSection } from "./preview-section"
import { RulesSection } from "./rules-section"
import { DetailsSection } from "./details-section"
import { PropertyService } from "@/services/property.service"
import { toast } from "sonner"
import { BoingText } from "@/components/BoingText"
import { pageVariants } from "../../animations"

// ─── Tipos e Props ────────────────────────────────────────────────────────

/**
 * Modos de visualização do editor de propriedades.
 *
 * @description Define os três estados de UI do management root:
 * - `VIEW` — Pré-visualização high-fidelity do ativo
 * - `EDIT` — Formulário de edição de dados estruturais
 * - `RULES` — Configuração de protocolos operacionais
 */
export type EditMode = 'VIEW' | 'EDIT' | 'RULES'

/**
 * Propriedades do componente de gestão de ativos.
 *
 * @description Contrato público do orchestrador de edição,
 * incluindo dados iniciais, callbacks de navegação e persistência.
 */
export interface PropertyManagementRootProps {
    /** Objeto da propriedade inicial vindo da API */
    property: OwnProperty
    /** Callback para voltar à lista de propriedades */
    onBack: () => void
    /** Callback para salvar as alterações (recebe o draft atualizado) */
    onSave: (updated: OwnProperty) => Promise<void>
    /** Callback opcional para remoção do ativo (decommission) */
    onDelete?: (id: number) => Promise<void>
}

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/**
 * EditHeader — Barra de navegação e controlo central do editor.
 *
 * @description Componente sticky que providencia:
 * - Botão de retorno à listagem
 * - Título do ativo com label editorial
 * - Switcher de modos (Prévia / Dados / Regras)
 * - Acções de escrita (Descartar / Guardar) — visíveis apenas quando há alterações pendentes
 *
 * @param title - Título do ativo para exibição no cabeçalho
 * @param mode - Modo de visualização ativo (VIEW/EDIT/RULES)
 * @param onModeChange - Callback para alternar entre modos
 * @param onBack - Callback para regressar à listagem
 * @param onSave - Callback para persistir alterações no backend
 * @param onDiscard - Callback para reverter o draft ao estado original
 * @param isSaving - Indica se uma operação de escrita está em curso
 * @param hasChanges - Indica se existem alterações pendentes no draft
 */
function EditHeader({
    title, mode, onModeChange, onBack, onSave, onDiscard, isSaving, hasChanges
}: {
    title: string
    mode: EditMode
    onModeChange: (m: EditMode) => void
    onBack: () => void
    onSave: () => void
    onDiscard: () => void
    isSaving: boolean
    hasChanges: boolean
}) {
    return (
        <header className={cn(
            "sticky top-0 z-[60] mb-8 flex flex-col gap-4 p-4 md:p-2",
            "border-2 border-[#000000] dark:border-white/20 rounded-2xl bg-[#FAFAF5]/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-[4px_4px_0_0_#0D0D0D] dark:shadow-none",
            "md:flex-row md:items-center md:justify-between transition-all duration-300"
        )}>
            <div className="flex min-w-0 items-center gap-4 px-2">
                <motion.button
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onBack}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#000000] bg-white transition-all hover:bg-primary hover:text-white shadow-[2px_2px_0_0_#0D0D0D] dark:bg-zinc-900 dark:border-white/20"
                >
                    <ArrowLeft size={18} />
                </motion.button>
                <div className="min-w-0">
                    <span className="mb-0.5 block font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#8C7B6B] opacity-70">
                        Asset_Management // Central
                    </span>
                    <h2 className="truncate font-serif text-lg font-bold italic uppercase tracking-tighter text-[#0D0D0D] dark:text-white md:text-xl">
                        <BoingText text={title || "Asset_Manager"} color="currentColor" activeColor="#F97316" duration={0.3} />
                    </h2>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Switcher de Modos */}
                <div className="flex rounded-xl border-2 border-[#0D0D0D] bg-white dark:bg-zinc-900 dark:border-white/10 p-1 shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-none">
                    {[
                        { id: 'VIEW' as const, label: 'Prévia', icon: Eye },
                        { id: 'EDIT' as const, label: 'Dados', icon: LayoutDashboard },
                        { id: 'RULES' as const, label: 'Regras', icon: Settings },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            type="button"
                            onClick={() => onModeChange(btn.id)}
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all",
                                mode === btn.id
                                    ? "bg-primary text-white"
                                    : "text-[#8C7B6B] hover:bg-[#F0ECD9]/50 dark:hover:bg-zinc-800"
                            )}
                        >
                            <btn.icon size={13} strokeWidth={2.5} /> {btn.label}
                        </button>
                    ))}
                </div>

                {/* Acções de Escrita */}
                <AnimatePresence mode="wait">
                    {hasChanges && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2 pl-2 border-l-2 border-foreground/10"
                        >
                            <button
                                type="button"
                                onClick={onDiscard}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono font-bold text-[9px] uppercase text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                                <Undo2 size={14} /> Descartar
                            </button>
                            <BrutalButton
                                type="button"
                                onClick={onSave}
                                disabled={isSaving}
                                className="!h-10 !px-5 !bg-emerald-600 !border-emerald-700 !text-white !text-[10px] !font-bold !uppercase !tracking-widest shadow-[3px_3px_0_0_#064e3b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                            >
                                {isSaving ? "A guardar…" : "Guardar"} <Save size={14} className="ml-2" />
                            </BrutalButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * PropertyManagementRoot — Orquestrador do fluxo de edição de ativos.
 *
 * @description Providencia uma interface de alto desempenho para gestão de dados
 * estruturais, protocolos operacionais e pré-visualização em tempo real de ativos
 * da rede Nexus Estates. Utiliza um sistema de draft local para prevenir perdas
 * acidentais de dados.
 *
 * Integra três secções especializadas:
 * - `PreviewSection` — Visualização high-fidelity do ativo (VIEW)
 * - `DetailsSection` — Formulário de dados e identidade (EDIT)
 * - `RulesSection` — Protocolos operacionais e sazonalidade (RULES)
 *
 * @see PreviewSection — Visualizador (preview-section.tsx)
 * @see DetailsSection — Editor de dados (details-section.tsx)
 * @see RulesSection — Editor de regras (rules-section.tsx)
 */
export function PropertyManagementRoot({ property: initialProperty, onBack, onSave, onDelete }: PropertyManagementRootProps) {
    // ─── Estados de Contexto e Dados ────────────────────────────────────
    const [mode, setMode] = useState<EditMode>('VIEW')
    const [draft, setDraft] = useState<OwnProperty>({ ...initialProperty })
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [pendingChanges, setPendingChanges] = useState(false)

    // ─── Handlers Nucleares ─────────────────────────────────────────────

    /**
     * Atualiza um campo no draft local e marca alterações pendentes.
     * @param field - Chave do campo a atualizar
     * @param value - Novo valor para o campo
     */
    const updateField = <K extends keyof OwnProperty>(field: K, value: OwnProperty[K]) => {
        setDraft(prev => ({ ...prev, [field]: value }))
        setPendingChanges(true)
    }

    /**
     * Dispara a persistência dos dados no servidor.
     * @description Envia o draft completo ao backend via `onSave`,
     * reseta o estado de alterações e navega para o modo VIEW.
     */
    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave(draft)
            setPendingChanges(false)
            setMode('VIEW')
            toast.success("Nexus Asset // Actualização executada com sucesso")
        } catch (error) {
            console.error("[PropertyManagementRoot] Save Error:", error)
            toast.error("Erro Crítico // Falha na sincronização do ativo")
        } finally {
            setIsSaving(false)
        }
    }

    /**
     * Executa o decommissioning (eliminação) do ativo.
     * @description Solicita confirmação e remove o ativo permanentemente
     * dos registos ativos da rede Nexus.
     */
    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja desativar este ativo? Esta acção é irreversível nos protocolos Nexus.")) return

        setIsDeleting(true)
        try {
            const propertyId = typeof draft.id === 'string' ? parseInt(draft.id) : (draft.id as number)
            if (!propertyId) throw new Error("Asset ID Inválido")

            await PropertyService.deleteProperty(propertyId)
            if (onDelete) await onDelete(propertyId)
            onBack()
            toast.success("Ativo Desativado // Removido dos registos activos")
        } catch (error) {
            console.error("[PropertyManagementRoot] Decommission Error:", error)
            toast.error("Falha no Decommission // Contacte o suporte técnico")
        } finally {
            setIsDeleting(false)
        }
    }

    // ─── Título com fallback ────────────────────────────────────────────
    const displayTitle = typeof draft.title === 'string'
        ? draft.title
        : draft.title?.pt || draft.title?.en || "Asset_Manager"

    // ─── Render ─────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 pt-4 pb-20 max-w-[1600px] mx-auto px-4 md:px-0">
            {/* Header de Gestão Centralizado */}
            <EditHeader
                title={displayTitle}
                mode={mode}
                onModeChange={setMode}
                onBack={onBack}
                onSave={handleSave}
                onDiscard={() => { setDraft({ ...initialProperty }); setPendingChanges(false); }}
                isSaving={isSaving}
                hasChanges={pendingChanges}
            />

            {/* Content Swapper com Animações de Transição */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={mode}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    className="relative"
                >
                    {mode === 'VIEW' ? (
                        <PreviewSection
                            property={draft}
                            onGoToRules={() => setMode('RULES')}
                        />
                    ) : mode === 'RULES' ? (
                        <div className="max-w-5xl mx-auto">
                            <RulesSection
                                draft={draft}
                                initial={initialProperty}
                                updateField={updateField}
                            />
                        </div>
                    ) : (
                        <DetailsSection
                            draft={draft}
                            initial={initialProperty}
                            updateField={updateField}
                            isDeleting={isDeleting}
                            onDelete={handleDelete}
                        />
                    )}
                </motion.main>
            </AnimatePresence>
        </div>
    )
}

/**
 * Re-export com nome legado para compatibilidade.
 * @deprecated Usar `PropertyManagementRoot` directamente.
 */
export const PropertyEdit = PropertyManagementRoot
