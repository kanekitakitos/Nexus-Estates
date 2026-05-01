"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Eye, LayoutDashboard, Settings, Undo2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { BrutalButton } from "@/components/ui/forms/button"
import { PreviewSection } from "./preview-section"
import { RulesSection } from "./rules-section"
import { DetailsSection } from "./details-section"
import { PropertyService } from "@/services/property.service"
import { UserService } from "@/services/user.service"
import { notify } from "@/lib/notify"
import { BoingText } from "@/components/effects/BoingText"
import { pageVariants } from "../../lib/animations"
import { NexusAlertDialog } from "@/components/ui/feedback/nexus-alert-dialog"
import { propertyCopy, propertyTokens } from "../../lib/property-tokens"

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
    initialMode?: EditMode
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
            propertyTokens.ui.managementRoot.headerClass
        )}>
            <div className="flex min-w-0 items-center gap-4 px-2">
                <motion.button
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onBack}
                    className={propertyTokens.ui.managementRoot.backButtonClass}
                >
                    <ArrowLeft size={18} />
                </motion.button>
                <div className="min-w-0">
                    <span className={propertyTokens.ui.managementRoot.eyebrowClass}>
                        {propertyCopy.managementRoot.eyebrow}
                    </span>
                    <h2 className={propertyTokens.ui.managementRoot.titleClass}>
                        <BoingText
                            text={title || propertyCopy.managementRoot.titleFallback}
                            color="currentColor"
                            activeColor={propertyTokens.ui.preview.boingActiveColor}
                            duration={0.3}
                        />
                    </h2>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Switcher de Modos */}
                <div className={propertyTokens.ui.managementRoot.modeSwitcherClass}>
                    {[
                        { id: 'VIEW' as const, label: propertyCopy.managementRoot.modeView, icon: Eye },
                        { id: 'EDIT' as const, label: propertyCopy.managementRoot.modeEdit, icon: LayoutDashboard },
                        { id: 'RULES' as const, label: propertyCopy.managementRoot.modeRules, icon: Settings },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            type="button"
                            onClick={() => onModeChange(btn.id)}
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all",
                                mode === btn.id
                                    ? "bg-primary text-white"
                                    : propertyTokens.ui.managementRoot.modeInactiveClass
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
                                <Undo2 size={14} /> {propertyCopy.managementRoot.discard}
                            </button>
                            <BrutalButton
                                type="button"
                                onClick={onSave}
                                disabled={isSaving}
                                className={propertyTokens.ui.managementRoot.saveButtonClass}
                            >
                                {isSaving ? propertyCopy.managementRoot.saving : propertyCopy.managementRoot.save}{" "}
                                <Save size={14} className="ml-2" />
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
export function PropertyManagementRoot({ property: initialProperty, initialMode, onBack, onSave, onDelete }: PropertyManagementRootProps) {
    // ─── Estados de Contexto e Dados ────────────────────────────────────
    const [mode, setMode] = useState<EditMode>(initialMode ?? 'VIEW')
    const [baseline, setBaseline] = useState<OwnProperty>({ ...initialProperty })
    const [draft, setDraft] = useState<OwnProperty>({ ...initialProperty })
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [dirty, setDirty] = useState({
        details: false,
        amenities: false,
        operationalRules: false,
        seasonality: false,
        permissions: false,
    })
    const [isConfirming, setIsConfirming] = useState({
        operationalRules: false,
        seasonality: false,
        permissions: false,
    })
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    useEffect(() => {
        setBaseline({ ...initialProperty })
        setDraft({ ...initialProperty })
        setDirty({ details: false, amenities: false, operationalRules: false, seasonality: false, permissions: false })
        setMode(initialMode ?? 'VIEW')
    }, [initialMode, initialProperty])

    useEffect(() => {
        let cancelled = false

        const resolveEmails = async () => {
            const perms = draft.permissions || []
            const needs = perms.filter(p => !p.email || p.email.startsWith("user-"))
            if (needs.length === 0) return

            const resolved = await Promise.all(needs.map(async (p) => {
                try {
                    const profile = await UserService.getUserId(Number(p.userId))
                    return { userId: Number(p.userId), email: profile.email }
                } catch {
                    return null
                }
            }))
            const map = new Map(resolved.filter(Boolean).map((r) => [Number((r as any).userId), String((r as any).email)]))
            if (map.size === 0) return

            const next = perms.map(p => {
                const email = map.get(Number(p.userId))
                return email ? { ...p, email } : p
            })

            if (cancelled) return
            const changed = JSON.stringify(next) !== JSON.stringify(perms)
            if (!changed) return

            setDraft(prev => ({ ...prev, permissions: next }))
            setBaseline(prev => {
                const basePerms = prev.permissions || []
                const baseNext = basePerms.map(p => {
                    const email = map.get(Number(p.userId))
                    return email ? { ...p, email } : p
                })
                return { ...prev, permissions: baseNext }
            })
        }

        resolveEmails()
        return () => { cancelled = true }
    }, [draft.permissions])

    useEffect(() => {
        const normalizeIds = (arr: number[]) => [...arr].map(Number).filter(Number.isFinite).sort((a, b) => a - b)
        const compactPermissions = (arr: OwnProperty["permissions"]) =>
            (arr || []).map((p) => ({ userId: Number(p.userId), accessLevel: p.accessLevel })).sort((a, b) => a.userId - b.userId)

        const detailsKeys: Array<keyof OwnProperty> = ["title", "description", "location", "city", "address", "maxGuests", "price", "status", "imageUrl", "tags"]
        const detailsChanged = detailsKeys.some((k) => JSON.stringify(draft[k]) !== JSON.stringify(baseline[k]))

        const amenitiesChanged = JSON.stringify(normalizeIds(draft.amenityIds || [])) !== JSON.stringify(normalizeIds(baseline.amenityIds || []))
        const operationalChanged = JSON.stringify(draft.propertyRule ?? null) !== JSON.stringify(baseline.propertyRule ?? null)
        const seasonalityChanged = JSON.stringify(draft.seasonalityRules ?? null) !== JSON.stringify(baseline.seasonalityRules ?? null)
        const permissionsChanged = JSON.stringify(compactPermissions(draft.permissions)) !== JSON.stringify(compactPermissions(baseline.permissions))

        setDirty({
            details: detailsChanged,
            amenities: amenitiesChanged,
            operationalRules: operationalChanged,
            seasonality: seasonalityChanged,
            permissions: permissionsChanged,
        })
    }, [draft, baseline])

    // ─── Handlers Nucleares ─────────────────────────────────────────────

    /**
     * Atualiza um campo no draft local e marca alterações pendentes.
     * @param field - Chave do campo a atualizar
     * @param value - Novo valor para o campo
     */
    const updateField = <K extends keyof OwnProperty>(field: K, value: OwnProperty[K]) => {
        setDraft(prev => ({ ...prev, [field]: value }))
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
            setBaseline({ ...draft })
            setMode('VIEW')
            notify.success(propertyCopy.managementRoot.saveOk)
        } catch (error) {
            console.error("[PropertyManagementRoot] Save Error:", error)
            notify.error(propertyCopy.managementRoot.saveFail)
        } finally {
            setIsSaving(false)
        }
    }

    const propertyId = typeof draft.id === 'string' ? parseInt(draft.id) : (draft.id as number)

    const confirmOperationalRules = async () => {
        if (!propertyId) {
            notify.error(propertyCopy.managementRoot.invalidAssetId)
            return
        }
        setIsConfirming(prev => ({ ...prev, operationalRules: true }))
        try {
            const current = draft.propertyRule || {}
            const base = baseline.propertyRule || {}

            const normalizeTime = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 5) : "")
            const normalizeInt = (v: unknown) => (typeof v === "number" ? v : Number(v))

            const currentNormalized = {
                checkInTime: normalizeTime(current.checkInTime || base.checkInTime || "15:00"),
                checkOutTime: normalizeTime(current.checkOutTime || base.checkOutTime || "11:00"),
                minNights: Number.isFinite(normalizeInt(current.minNights)) ? normalizeInt(current.minNights) : (Number(base.minNights) || 1),
                maxNights: Number.isFinite(normalizeInt(current.maxNights)) ? normalizeInt(current.maxNights) : (Number(base.maxNights) || 30),
                bookingLeadTimeDays: Number.isFinite(normalizeInt(current.bookingLeadTimeDays)) ? normalizeInt(current.bookingLeadTimeDays) : (Number(base.bookingLeadTimeDays) || 0),
            }

            const baseNormalized = {
                checkInTime: normalizeTime(base.checkInTime || "15:00"),
                checkOutTime: normalizeTime(base.checkOutTime || "11:00"),
                minNights: Number.isFinite(Number(base.minNights)) ? Number(base.minNights) : 1,
                maxNights: Number.isFinite(Number(base.maxNights)) ? Number(base.maxNights) : 30,
                bookingLeadTimeDays: Number.isFinite(Number(base.bookingLeadTimeDays)) ? Number(base.bookingLeadTimeDays) : 0,
            }

            if (!currentNormalized.checkInTime || !currentNormalized.checkOutTime) {
                notify.error("Define check-in e check-out antes de confirmar.")
                return
            }
            if (currentNormalized.maxNights < currentNormalized.minNights) {
                notify.error("O máximo de noites não pode ser inferior ao mínimo.")
                return
            }
            if (currentNormalized.minNights < 1 || currentNormalized.maxNights < 1 || currentNormalized.bookingLeadTimeDays < 0) {
                notify.error("Valores inválidos nas regras operacionais.")
                return
            }

            const patch: Record<string, unknown> = {}
            if (currentNormalized.checkInTime !== baseNormalized.checkInTime) patch["checkInTime"] = currentNormalized.checkInTime
            if (currentNormalized.checkOutTime !== baseNormalized.checkOutTime) patch["checkOutTime"] = currentNormalized.checkOutTime
            if (currentNormalized.minNights !== baseNormalized.minNights) patch["minNights"] = currentNormalized.minNights
            if (currentNormalized.maxNights !== baseNormalized.maxNights) patch["maxNights"] = currentNormalized.maxNights
            if (currentNormalized.bookingLeadTimeDays !== baseNormalized.bookingLeadTimeDays) patch["bookingLeadTimeDays"] = currentNormalized.bookingLeadTimeDays

            if (Object.keys(patch).length === 0) {
                notify.success("Sem alterações nas regras operacionais.")
                return
            }

            const updated = await PropertyService.patchRules(propertyId, patch)
            const nextDraft = { ...draft, propertyRule: updated }
            setDraft(nextDraft)
            setBaseline(prev => ({ ...prev, propertyRule: updated }))
            notify.success("Regras operacionais confirmadas.")
        } catch (error) {
            console.error("[PropertyManagementRoot] Confirm Operational Rules Error:", error)
            notify.error("Não foi possível confirmar as regras operacionais.")
        } finally {
            setIsConfirming(prev => ({ ...prev, operationalRules: false }))
        }
    }

    const confirmSeasonality = async () => {
        if (!propertyId) {
            notify.error(propertyCopy.managementRoot.invalidAssetId)
            return
        }
        setIsConfirming(prev => ({ ...prev, seasonality: true }))
        try {
            const invalid = (draft.seasonalityRules || []).some((r) => {
                if (!r.startDate || !r.endDate) return true
                const start = new Date(r.startDate)
                const end = new Date(r.endDate)
                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true
                if (end.getTime() < start.getTime()) return true
                if (!Number.isFinite(Number(r.priceModifier)) || Number(r.priceModifier) < 0.01) return true
                return false
            })
            if (invalid) {
                notify.error("Existem regras de sazonalidade inválidas ou incompletas.")
                return
            }
            const updated = await PropertyService.updateSeasonalityRules(propertyId, draft.seasonalityRules || [])
            const nextDraft = { ...draft, seasonalityRules: updated }
            setDraft(nextDraft)
            setBaseline(prev => ({ ...prev, seasonalityRules: updated }))
            notify.success("Sazonalidade confirmada.")
        } catch (error) {
            console.error("[PropertyManagementRoot] Confirm Seasonality Error:", error)
            notify.error("Não foi possível confirmar a sazonalidade.")
        } finally {
            setIsConfirming(prev => ({ ...prev, seasonality: false }))
        }
    }

    const confirmPermissions = async () => {
        if (!propertyId) {
            notify.error(propertyCopy.managementRoot.invalidAssetId)
            return
        }
        setIsConfirming(prev => ({ ...prev, permissions: true }))
        try {
            const payload = (draft.permissions || []).map(p => ({ userId: Number(p.userId), accessLevel: p.accessLevel }))
            const primaryOwners = payload.filter(p => p.accessLevel === "PRIMARY_OWNER").length
            if (primaryOwners !== 1) {
                notify.error("A propriedade deve ter exatamente 1 PRIMARY_OWNER.")
                return
            }
            const updated = await PropertyService.updatePermissions(propertyId, payload)
            const updatedPermissions = (draft.permissions || []).map(p => {
                const match = updated.find(u => Number(u.userId) === Number(p.userId))
                return match ? { ...p, userId: Number(match.userId), accessLevel: match.accessLevel } : p
            })
            setDraft(prev => ({ ...prev, permissions: updatedPermissions }))
            setBaseline(prev => ({ ...prev, permissions: updatedPermissions }))
            notify.success("Permissões confirmadas.")
        } catch (error) {
            console.error("[PropertyManagementRoot] Confirm Permissions Error:", error)
            notify.error("Não foi possível confirmar as permissões.")
        } finally {
            setIsConfirming(prev => ({ ...prev, permissions: false }))
        }
    }

    /**
     * Executa o decommissioning (eliminação) do ativo.
     * @description Solicita confirmação e remove o ativo permanentemente
     * dos registos ativos da rede Nexus.
     */
    const handleDelete = () => {
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        setIsDeleting(true)
        try {
            const propertyId = typeof draft.id === 'string' ? parseInt(draft.id) : (draft.id as number)
            if (!propertyId) throw new Error(propertyCopy.managementRoot.invalidAssetId)

            await PropertyService.deleteProperty(propertyId)
            if (onDelete) await onDelete(propertyId)
            onBack()
            notify.success(propertyCopy.managementRoot.deleteOk)
            setIsDeleteDialogOpen(false)
        } catch (error) {
            console.error("[PropertyManagementRoot] Decommission Error:", error)
            notify.error(propertyCopy.managementRoot.deleteFail)
        } finally {
            setIsDeleting(false)
        }
    }

    // ─── Título com fallback ────────────────────────────────────────────
    const displayTitle = typeof draft.title === 'string'
        ? draft.title
        : draft.title?.pt || draft.title?.en || propertyCopy.managementRoot.titleFallback
    const hasChanges = Object.values(dirty).some(Boolean)

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
                onDiscard={() => { setDraft({ ...baseline }); }}
                isSaving={isSaving}
                hasChanges={hasChanges}
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
                                initial={baseline}
                                updateField={updateField}
                                onConfirmOperationalRules={confirmOperationalRules}
                                onConfirmSeasonality={confirmSeasonality}
                                onConfirmPermissions={confirmPermissions}
                                dirty={dirty}
                                isConfirming={isConfirming}
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

            <NexusAlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => { if (!isDeleting) setIsDeleteDialogOpen(open) }}
                variant="warning"
                title={propertyCopy.managementRoot.deactivateTitle}
                description={propertyCopy.managementRoot.deactivateDescription}
                confirmLabel={propertyCopy.managementRoot.deactivateConfirm}
                cancelLabel={propertyCopy.managementRoot.deactivateCancel}
                isConfirming={isDeleting}
                onConfirm={confirmDelete}
            />
        </div>
    )
}

/**
 * Re-export com nome legado para compatibilidade.
 * @deprecated Usar `PropertyManagementRoot` directamente.
 */
export const PropertyEdit = PropertyManagementRoot
