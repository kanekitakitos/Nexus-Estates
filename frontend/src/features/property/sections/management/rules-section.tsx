"use client"

import { Clock, Calendar, Sun, Plus, Trash2, HelpCircle, Sparkles, ShieldCheck, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty, PropertyRuleDTO, SeasonalityRuleDTO } from "@/types"
import { BrutalField } from "@/components/ui/forms/brutal-field"
import { BrutalCard } from "@/components/ui/data-display/brutal-card"
import { BrutalButton } from "@/components/ui/forms/button"
import { CollaboratorManager } from "../../components/collaborator-manager"
import { proMeta, proPanel, propertyCopy, propertyTokens } from "../../lib/property-tokens"
import { BoingText } from "@/components/effects/BoingText"
import { motion } from "framer-motion"
import { staggerContainer, itemFadeUp } from "../../lib/animations"
import { UserService } from "@/services/user.service"

// ─── Tipos e Props ────────────────────────────────────────────────────────

/**
 * Propriedades do Editor de Regras Operacionais.
 *
 * @description Contrato público da secção de regras que inclui
 * o draft em edição, estado original para comparação e callback
 * genérico de atualização de campos.
 */
export interface RulesSectionProps {
    /** Dados sob edição (draft local) */
    draft: OwnProperty
    /** Dados originais vindos da API para comparação e reversão */
    initial: OwnProperty
    /** Callback genérico para atualização de campos no estado pai */
    updateField: <K extends keyof OwnProperty>(f: K, v: OwnProperty[K]) => void
    /** Confirma (persiste) apenas as regras operacionais */
    onConfirmOperationalRules: () => Promise<void>
    /** Confirma (persiste) apenas a sazonalidade */
    onConfirmSeasonality: () => Promise<void>
    /** Confirma (persiste) apenas permissões/colaboradores */
    onConfirmPermissions: () => Promise<void>
    dirty: {
        operationalRules: boolean
        seasonality: boolean
        permissions: boolean
        details: boolean
        amenities: boolean
    }
    isConfirming: {
        operationalRules: boolean
        seasonality: boolean
        permissions: boolean
    }
}

// ─── Sub-Componentes Utilitários ───────────────────────────────────────────

/**
 * TooltipGuide — Pequeno balão informativo para termos técnicos.
 *
 * @description Exibe um ícone de ajuda que, ao hover, mostra uma tooltip
 * com texto explicativo sobre o campo adjacente. Utiliza posicionamento
 * CSS (absolute) relativo ao container pai.
 *
 * @param text - Texto explicativo a exibir na tooltip
 */
function TooltipGuide({ text }: { text: string }) {
    return (
        <div className="relative group inline-block ml-2 mb-1">
            <HelpCircle size={14} className="text-foreground/30 hover:text-primary transition-colors cursor-help" />
            <div className={propertyTokens.ui.rules.tooltipBoxClass}>
                {text}
                <div className={propertyTokens.ui.rules.tooltipArrowClass} />
            </div>
        </div>
    )
}

// ─── Seções de Interface ──────────────────────────────────────────────────

/**
 * RulesHeaderSection — Cabeçalho de impacto para o módulo de regras.
 *
 * @description Banner decorativo com ícone, título editorial e subtítulo
 * explicativo. Inclui número de secção decorativo ("03") em overlay.
 */
function RulesHeaderSection() {
    return (
        <div className={cn(
            propertyTokens.ui.rules.headerWrapClass,
            propertyTokens.ui.rules.headerBorderClass,
            propertyTokens.ui.rules.headerBgClass,
            propertyTokens.ui.rules.headerShadowClass
        )}>
            <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                <div className={propertyTokens.ui.rules.headerIconWrapClass}>
                    <Sparkles className="h-8 w-8" strokeWidth={2.5} />
                </div>
                <div>
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-2">
                        {propertyCopy.rules.headerKicker}
                    </span>
                    <h3 className={propertyTokens.ui.rules.headerTitleClass}>
                        <BoingText text={propertyCopy.rules.headerTitle} color="currentColor" activeColor={propertyTokens.ui.preview.boingActiveColor} />
                    </h3>
                    <p className={propertyTokens.ui.rules.headerSubtitleClass}>
                        {propertyCopy.rules.headerSubtitle}
                    </p>
                </div>
            </div>
            <div className={propertyTokens.ui.rules.headerIndexClass}>
                {propertyCopy.rules.sectionIndex}
            </div>
        </div>
    )
}

/**
 * OperationalRulesCard — Gestão de tempos de Check-in/Out e restrições de estadia.
 *
 * @description Formulário brutalista para configuração de:
 * - Horários de check-in e check-out (com tooltips explicativos)
 * - Noites mínimas e máximas de permanência
 * - Antecedência mínima de reserva (em dias)
 * - Fuso horário operacional
 *
 * @param rules - Estado atual das regras do ativo (draft)
 * @param initRules - Estado original das regras para comparação
 * @param onRuleChange - Callback para atualização de uma regra específica
 */
function OperationalRulesCard({ 
    rules, initRules, onRuleChange, onConfirm, isDirty, isConfirming
}: { 
    rules: PropertyRuleDTO; 
    initRules: PropertyRuleDTO; 
    onRuleChange: <K extends keyof PropertyRuleDTO>(f: K, v: PropertyRuleDTO[K]) => void;
    onConfirm: () => Promise<void>;
    isDirty: boolean;
    isConfirming: boolean;
}) {
    return (
        <BrutalCard
            id="operational-rules"
            title={<BoingText text={propertyCopy.rules.operationalCardTitle} color="currentColor" activeColor={propertyTokens.ui.preview.boingActiveColor} duration={0.3} />}
            subtitle={propertyCopy.rules.operationalCardSubtitle}
            icon={<Clock size={24} />}
            iconBgColor="bg-orange-500/10 border-orange-500/20"
            iconTextColor="text-orange-500"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="relative">
                    <BrutalField label={propertyCopy.rules.checkInLabel} type="time" value={rules.checkInTime || ""} savedValue={initRules.checkInTime || ""} onChange={(v) => onRuleChange('checkInTime', v as string)} onRevert={() => onRuleChange('checkInTime', initRules.checkInTime)} />
                    <div className="absolute top-0 right-0 -translate-y-6">
                        <TooltipGuide text={propertyCopy.rules.checkInHelp} />
                    </div>
                </div>
                <div className="relative">
                    <BrutalField label={propertyCopy.rules.checkOutLabel} type="time" value={rules.checkOutTime || ""} savedValue={initRules.checkOutTime || ""} onChange={(v) => onRuleChange('checkOutTime', v as string)} onRevert={() => onRuleChange('checkOutTime', initRules.checkOutTime)} />
                    <div className="absolute top-0 right-0 -translate-y-6">
                        <TooltipGuide text={propertyCopy.rules.checkOutHelp} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t-2 border-foreground/5 dark:border-white/5">
                <BrutalField label={propertyCopy.rules.minNightsLabel} type="number" value={rules.minNights || ""} savedValue={initRules.minNights || ""} onChange={(v) => onRuleChange('minNights', Number(v))} onRevert={() => onRuleChange('minNights', initRules.minNights)} />
                <BrutalField label={propertyCopy.rules.maxNightsLabel} type="number" value={rules.maxNights || ""} savedValue={initRules.maxNights || ""} onChange={(v) => onRuleChange('maxNights', Number(v))} onRevert={() => onRuleChange('maxNights', initRules.maxNights)} />
                <BrutalField label={propertyCopy.rules.bookingLeadDaysLabel} type="number" value={rules.bookingLeadTimeDays || ""} savedValue={initRules.bookingLeadTimeDays || ""} onChange={(v) => onRuleChange('bookingLeadTimeDays', Number(v))} onRevert={() => onRuleChange('bookingLeadTimeDays', initRules.bookingLeadTimeDays)} />
            </div>

            <div className="mt-8 flex justify-end">
                <BrutalButton
                    type="button"
                    variant="brutal-wizard-next"
                    onClick={onConfirm}
                    disabled={!isDirty || isConfirming}
                    className="!h-10 !px-4 !text-[10px] !font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Save size={16} strokeWidth={2.5} />
                    {isConfirming ? "A confirmar..." : "Confirmar"}
                </BrutalButton>
            </div>
        </BrutalCard>
    )
}

/**
 * YieldManagementCard — Gestão de janelas sazonais e multiplicadores de preço.
 *
 * @description Permite adicionar, remover e editar períodos sazonais com
 * datas de início/fim e multiplicadores de preço. Inclui validação
 * visual para janelas incompletas.
 *
 * @param seasonRules - Lista de regras sazonais ativas
 * @param onAdd - Callback para adicionar nova janela sazonal
 * @param onRemove - Callback para remover uma janela pelo índice
 * @param onUpdate - Callback para atualizar um campo de uma janela específica
 */
function YieldManagementCard({ 
    seasonRules, onAdd, onRemove, onUpdate, onConfirm, isDirty, isConfirming
}: { 
    seasonRules: SeasonalityRuleDTO[]; 
    onAdd: () => void; 
    onRemove: (i: number) => void; 
    onUpdate: <K extends keyof SeasonalityRuleDTO>(i: number, f: K, v: SeasonalityRuleDTO[K]) => void;
    onConfirm: () => Promise<void>;
    isDirty: boolean;
    isConfirming: boolean;
}) {
    const hasUnfinished = seasonRules.some(r => !r.startDate || !r.endDate)

    return (
        <BrutalCard
            id="yield-rules"
            title={<BoingText text={propertyCopy.rules.yieldCardTitle} color="currentColor" activeColor={propertyTokens.ui.preview.boingActiveColor} duration={0.3} />}
            subtitle={propertyCopy.rules.yieldCardSubtitle}
            icon={<Sun size={24} />}
            iconBgColor="bg-yellow-500/10 border-yellow-500/20"
            iconTextColor="text-yellow-500"
            tone="cream"
        >
            <div className="-mt-4 mb-6 flex flex-wrap justify-end gap-3">
                <BrutalButton
                    type="button"
                    variant="brutal-wizard-next"
                    onClick={onAdd}
                    disabled={hasUnfinished}
                    className="!h-10 !px-4 !text-[10px] !font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    {hasUnfinished ? propertyCopy.rules.yieldAddDisabled : propertyCopy.rules.yieldAddEnabled}
                </BrutalButton>

                <BrutalButton
                    type="button"
                    variant="brutal-wizard-next"
                    onClick={onConfirm}
                    disabled={!isDirty || hasUnfinished || isConfirming}
                    className="!h-10 !px-4 !text-[10px] !font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Save size={16} strokeWidth={2.5} />
                    {isConfirming ? "A confirmar..." : "Confirmar"}
                </BrutalButton>
            </div>

            <div className="space-y-4">
                {seasonRules.length === 0 ? (
                    <div className={cn(proPanel, "border-dashed p-10 text-center bg-white/30")}>
                        <Calendar className={propertyTokens.ui.rules.yieldEmptyIconClass} strokeWidth={1.5} />
                        <p className={proMeta}>{propertyCopy.rules.yieldEmptyTitle}</p>
                        <p className={propertyTokens.ui.rules.yieldEmptySubtitleClass}>{propertyCopy.rules.yieldEmptySubtitle}</p>
                    </div>
                ) : (
                    seasonRules.map((sr, idx) => (
                        <div key={sr.id} className={cn(proPanel, "flex flex-col gap-4 p-4 md:flex-row md:items-end bg-white/50 dark:bg-zinc-900/50")}>
                            <div className="min-w-0 flex-1">
                                <BrutalField type="date" label={propertyCopy.rules.seasonStartLabel} value={sr.startDate} savedValue={sr.startDate} onChange={(v) => onUpdate(idx, "startDate", v as string)} onRevert={() => { }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <BrutalField type="date" label={propertyCopy.rules.seasonEndLabel} value={sr.endDate} savedValue={sr.endDate} onChange={(v) => onUpdate(idx, "endDate", v as string)} onRevert={() => { }} />
                            </div>
                            <div className="w-full md:w-36">
                                <BrutalField type="number" label={propertyCopy.rules.seasonMultiplierLabel} value={sr.priceModifier} savedValue={sr.priceModifier} onChange={(v) => onUpdate(idx, "priceModifier", Number(v))} onRevert={() => { }} />
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition-all hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
                                title={propertyCopy.rules.removeActionTitle}
                            >
                                <Trash2 size={18} strokeWidth={2} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </BrutalCard>
    )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * RulesSection — Módulo de Protocolos Operacionais.
 *
 * @description Centraliza a configuração de check-in/out, restrições temporais,
 * gestão de rendimento sazonal e permissões de equipa. Garante que os ativos
 * seguem as políticas operacionais da rede Nexus.
 *
 * Integra três sub-secções especializadas:
 * - `OperationalRulesCard` — Horários e limites de permanência
 * - `YieldManagementCard` — Janelas de preço sazonal
 * - `CollaboratorManager` — Gestão de equipa e ACL
 *
 * @see OperationalRulesCard — Formulário de regras temporais
 * @see YieldManagementCard — Gestão de multiplicadores sazonais
 * @see CollaboratorManager — Gestão de permissões e colaboradores
 */
export function RulesSection({ 
    draft, initial, updateField,
    onConfirmOperationalRules, onConfirmSeasonality, onConfirmPermissions,
    dirty, isConfirming
}: RulesSectionProps) {
    const rules = draft.propertyRule || {}
    const initRules = initial.propertyRule || {}
    const seasonRules = draft.seasonalityRules || []

    // ─── Handlers Operacionais ──────────────────────────────────────────

    /**
     * Atualiza um campo específico nas regras do ativo.
     * @description Merge do campo alterado com o estado existente do `propertyRule`.
     */
    const handleRuleChange = <K extends keyof PropertyRuleDTO>(field: K, value: PropertyRuleDTO[K]) => updateField('propertyRule', { ...rules, [field]: value })

    /**
     * Adiciona uma nova janela sazonal com valores padrão.
     * @description Cria um novo registo com ID timestamp, datas vazias e multiplicador 1.0x.
     */
    const addSeasonality = () => updateField('seasonalityRules', [...seasonRules, { id: Date.now(), startDate: "", endDate: "", priceModifier: 1.0 }])

    /**
     * Remove uma janela sazonal pelo índice na lista.
     */
    const removeSeasonality = (idx: number) => { const n = [...seasonRules]; n.splice(idx, 1); updateField('seasonalityRules', n); }

    /**
     * Atualiza um campo específico de uma janela sazonal existente.
     */
    const updateSeasonality = <K extends keyof SeasonalityRuleDTO>(idx: number, f: K, v: SeasonalityRuleDTO[K]) => {
        const n = [...seasonRules];
        n[idx] = { ...n[idx], [f]: v };
        updateField('seasonalityRules', n);
    }
    
    // ─── Handlers de Colaboração ────────────────────────────────────────

    /**
     * Adiciona um novo colaborador à lista de permissões do ativo.
     */
    const handleAddPermission = async (email: string, accessLevel: NonNullable<OwnProperty["permissions"]>[number]["accessLevel"]) => {
        const current = draft.permissions || []
        const normalizedEmail = email.trim().toLowerCase()
        if (current.some(p => p.email.trim().toLowerCase() === normalizedEmail)) {
            throw new Error(propertyCopy.collaboratorManager.alreadyAdded)
        }

        const user = await UserService.lookupByEmail(normalizedEmail)
        if (current.some(p => Number(p.userId) === Number(user.id))) {
            throw new Error(propertyCopy.collaboratorManager.alreadyAdded)
        }

        updateField('permissions', [...current, { userId: user.id, email: user.email, accessLevel }])
    }

    /**
     * Remove um colaborador da lista de permissões pelo email.
     */
    const removePermission = (userId: number) => {
        const current = draft.permissions || []
        const target = current.find(p => Number(p.userId) === Number(userId))
        if (target?.accessLevel === "PRIMARY_OWNER") return
        const next = current.filter(item => Number(item.userId) !== Number(userId))
        updateField('permissions', next)
    }

    return (
        <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-12 pb-24 relative"
        >
            {/* Cabeçalho Modular */}
            <motion.div variants={itemFadeUp}>
                <RulesHeaderSection />
            </motion.div>

            {/* Configurações Operacionais */}
            <motion.div variants={itemFadeUp}>
                <OperationalRulesCard 
                    rules={rules} 
                    initRules={initRules} 
                    onRuleChange={handleRuleChange}
                    onConfirm={onConfirmOperationalRules}
                    isDirty={dirty.operationalRules}
                    isConfirming={isConfirming.operationalRules}
                />
            </motion.div>
            
            {/* Gestão de Sazonalidade */}
            <motion.div variants={itemFadeUp}>
                <YieldManagementCard 
                    seasonRules={seasonRules} 
                    onAdd={addSeasonality} 
                    onRemove={removeSeasonality} 
                    onUpdate={updateSeasonality}
                    onConfirm={onConfirmSeasonality}
                    isDirty={dirty.seasonality}
                    isConfirming={isConfirming.seasonality}
                />
            </motion.div>
            
            {/* Gestão de Equipa */}
            <motion.div variants={itemFadeUp}>
                <BrutalCard
                    id="collaborator-manager"
                    title={propertyCopy.collaboratorManager.cardTitle}
                    subtitle={propertyCopy.collaboratorManager.cardSubtitle}
                    icon={<ShieldCheck size={22} strokeWidth={2} />}
                    iconBgColor={propertyTokens.ui.collaborator.cardIconBgColor}
                    iconTextColor={propertyTokens.ui.collaborator.cardIconTextColor}
                >
                    <CollaboratorManager
                        isCard={false}
                        permissions={draft.permissions || []}
                        onAdd={handleAddPermission}
                        onRemove={removePermission}
                    />

                    <div className="mt-8 flex justify-end">
                        <BrutalButton
                            type="button"
                            variant="brutal-wizard-next"
                            onClick={onConfirmPermissions}
                            disabled={!dirty.permissions || isConfirming.permissions}
                            className="!h-10 !px-4 !text-[10px] !font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Save size={16} strokeWidth={2.5} />
                            {isConfirming.permissions ? "A confirmar..." : "Confirmar"}
                        </BrutalButton>
                    </div>
                </BrutalCard>
            </motion.div>
        </motion.div>
    )
}
