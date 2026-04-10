"use client"

import { Clock, Calendar, Sun, Plus, Trash2, HelpCircle, Sparkles, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnProperty, PropertyRuleDTO, SeasonalityRuleDTO } from "@/types"
import { BrutalField } from "@/components/ui/forms/brutal-field"
import { BrutalCard } from "@/components/ui/data-display/brutal-card"
import { BrutalButton } from "@/components/ui/forms/button"
import { CollaboratorManager } from "../../components/collaborator-manager"
import { proMeta, proPanel } from "../../property-tokens"
import { BoingText } from "@/components/BoingText"
import { motion } from "framer-motion"
import { staggerContainer, itemFadeUp, nexusEntrance } from "../../animations"

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
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-foreground text-background dark:bg-white dark:text-black font-mono text-[9px] uppercase tracking-wider leading-relaxed rounded-lg z-50 text-center shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none border border-white/10 backdrop-blur-md">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground dark:border-t-white" />
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
            "relative overflow-hidden p-8 rounded-[2rem] border-[3px] transition-all duration-500 mb-12",
            "border-[#0D0D0D] dark:border-[#FAFAF5]/40",
            "bg-[#FAFAF5]/95 dark:bg-[#FAFAF5]/10 backdrop-blur-xl",
            "shadow-[12px_12px_0_0_#0D0D0D] dark:shadow-[12px_12px_0_0_rgba(250,250,245,0.1)]"
        )}>
            <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#0D0D0D] dark:border-[#FAFAF5] bg-primary text-white shadow-[4px_4px_0_0_#0D0D0D] dark:shadow-[4px_4px_0_0_rgba(250,250,245,0.2)]">
                    <Sparkles className="h-8 w-8" strokeWidth={2.5} />
                </div>
                <div>
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-2">
                        Global_Override // Property_Rules
                    </span>
                    <h3 className="font-serif text-3xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] dark:text-[#FAFAF5]">
                        <BoingText text="Regras operacionais" color="currentColor" activeColor="#F97316" />
                    </h3>
                    <p className="mt-3 max-w-3xl text-[13px] font-medium leading-relaxed text-[#8C7B6B] dark:text-[#FAFAF5]/60">
                        Configure os protocolos de janelas temporais, gestão de rendimentos via sazonalidade e a matriz de autoridade da rede Nexus para este ativo.
                    </p>
                </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 font-serif text-[120px] leading-none pointer-events-none select-none font-bold italic -translate-y-8 translate-x-8 text-[#0D0D0D] dark:text-[#FAFAF5]">
                03
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
    rules, initRules, onRuleChange 
}: { 
    rules: PropertyRuleDTO; 
    initRules: PropertyRuleDTO; 
    onRuleChange: <K extends keyof PropertyRuleDTO>(f: K, v: PropertyRuleDTO[K]) => void 
}) {
    return (
        <BrutalCard
            id="operational-rules"
            title={<BoingText text="Horários e estadia" color="currentColor" activeColor="#F97316" duration={0.3} />}
            subtitle="Check-in, check-out e limites"
            icon={<Clock size={24} />}
            iconBgColor="bg-orange-500/10 border-orange-500/20"
            iconTextColor="text-orange-500"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="relative">
                    <BrutalField label="Check-in" type="time" value={rules.checkInTime || ""} savedValue={initRules.checkInTime || ""} onChange={(v) => onRuleChange('checkInTime', v as string)} onRevert={() => onRuleChange('checkInTime', initRules.checkInTime)} />
                    <div className="absolute top-0 right-0 -translate-y-6">
                        <TooltipGuide text="Bloqueia entradas de hóspedes antes deste horário." />
                    </div>
                </div>
                <div className="relative">
                    <BrutalField label="Check-out" type="time" value={rules.checkOutTime || ""} savedValue={initRules.checkOutTime || ""} onChange={(v) => onRuleChange('checkOutTime', v as string)} onRevert={() => onRuleChange('checkOutTime', initRules.checkOutTime)} />
                    <div className="absolute top-0 right-0 -translate-y-6">
                        <TooltipGuide text="Limite forçado para abandono da propriedade." />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t-2 border-foreground/5 dark:border-white/5">
                <BrutalField label="Noites mínimas" type="number" value={rules.minNights || ""} savedValue={initRules.minNights || ""} onChange={(v) => onRuleChange('minNights', Number(v))} onRevert={() => onRuleChange('minNights', initRules.minNights)} />
                <BrutalField label="Noites máximas" type="number" value={rules.maxNights || ""} savedValue={initRules.maxNights || ""} onChange={(v) => onRuleChange('maxNights', Number(v))} onRevert={() => onRuleChange('maxNights', initRules.maxNights)} />
                <BrutalField label="Antecedência (dias)" type="number" value={rules.bookingLeadTimeDays || ""} savedValue={initRules.bookingLeadTimeDays || ""} onChange={(v) => onRuleChange('bookingLeadTimeDays', Number(v))} onRevert={() => onRuleChange('bookingLeadTimeDays', initRules.bookingLeadTimeDays)} />
                
                <div className="relative">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#8C7B6B] block mb-3">Fuso Horário (UTC)</span>
                    <div className="flex items-center gap-2 rounded-lg border-2 border-foreground bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950 shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-none">
                        <Globe size={14} className="text-primary" />
                        <select 
                            value={rules.timezone || "Europe/Lisbon"} 
                            onChange={(e) => onRuleChange('timezone', e.target.value)}
                            className="w-full bg-transparent text-xs font-bold uppercase outline-none cursor-pointer"
                        >
                            <option value="UTC">UTC (Universal)</option>
                            <option value="Europe/Lisbon">Lisbon / London (WET)</option>
                            <option value="Europe/Madrid">Madrid / Paris (CET)</option>
                            <option value="America/New_York">New York (EST)</option>
                            <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                        </select>
                    </div>
                </div>
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
    seasonRules, onAdd, onRemove, onUpdate 
}: { 
    seasonRules: SeasonalityRuleDTO[]; 
    onAdd: () => void; 
    onRemove: (i: number) => void; 
    onUpdate: <K extends keyof SeasonalityRuleDTO>(i: number, f: K, v: SeasonalityRuleDTO[K]) => void 
}) {
    const hasUnfinished = seasonRules.some(r => !r.startDate || !r.endDate)

    return (
        <BrutalCard
            id="yield-rules"
            title={<BoingText text="Preço sazonal" color="currentColor" activeColor="#F97316" duration={0.3} />}
            subtitle="Janelas e multiplicadores"
            icon={<Sun size={24} />}
            iconBgColor="bg-yellow-500/10 border-yellow-500/20"
            iconTextColor="text-yellow-500"
            tone="cream"
        >
            <div className="-mt-4 mb-6 flex justify-end">
                <BrutalButton 
                    type="button" 
                    variant="brutal-wizard-next" 
                    onClick={onAdd} 
                    disabled={hasUnfinished}
                    className="!h-10 !px-4 !text-[10px] !font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Plus size={16} strokeWidth={2.5} /> 
                    {hasUnfinished ? "Preencher Janelas" : "Nova janela"}
                </BrutalButton>
            </div>

            <div className="space-y-4">
                {seasonRules.length === 0 ? (
                    <div className={cn(proPanel, "border-dashed p-10 text-center bg-white/30")}>
                        <Calendar className="mx-auto mb-3 h-10 w-10 text-[#8C7B6B]" strokeWidth={1.5} />
                        <p className={proMeta}>Sem regras de preço sazonal</p>
                        <p className="mt-2 text-sm text-[#8C7B6B] italic font-serif opacity-60">Adiciona intervalos (ex.: época alta) com multiplicador sobre o preço base.</p>
                    </div>
                ) : (
                    seasonRules.map((sr, idx) => (
                        <div key={sr.id} className={cn(proPanel, "flex flex-col gap-4 p-4 md:flex-row md:items-end bg-white/50 dark:bg-zinc-900/50")}>
                            <div className="min-w-0 flex-1">
                                <BrutalField type="date" label="Início" value={sr.startDate} savedValue={sr.startDate} onChange={(v) => onUpdate(idx, "startDate", v as string)} onRevert={() => { }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <BrutalField type="date" label="Fim" value={sr.endDate} savedValue={sr.endDate} onChange={(v) => onUpdate(idx, "endDate", v as string)} onRevert={() => { }} />
                            </div>
                            <div className="w-full md:w-36">
                                <BrutalField type="number" label="Multiplicador" value={sr.priceModifier} savedValue={sr.priceModifier} onChange={(v) => onUpdate(idx, "priceModifier", Number(v))} onRevert={() => { }} />
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition-all hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
                                title="Remover"
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
export function RulesSection({ draft, initial, updateField }: RulesSectionProps) {
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
    const handleAddPermission = (email: string, role: string) => updateField('permissions', [...(draft.permissions || []), { email, level: role }])

    /**
     * Remove um colaborador da lista de permissões pelo email.
     */
    const removePermission = (email: string) => {
        const p = (draft.permissions || []).filter(item => item.email !== email);
        updateField('permissions', p);
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
                <OperationalRulesCard rules={rules} initRules={initRules} onRuleChange={handleRuleChange} />
            </motion.div>
            
            {/* Gestão de Sazonalidade */}
            <motion.div variants={itemFadeUp}>
                <YieldManagementCard seasonRules={seasonRules} onAdd={addSeasonality} onRemove={removeSeasonality} onUpdate={updateSeasonality} />
            </motion.div>
            
            {/* Gestão de Equipa */}
            <motion.div variants={itemFadeUp}>
                <CollaboratorManager 
                    permissions={draft.permissions || []} 
                    onAdd={handleAddPermission} 
                    onRemove={removePermission} 
                />
            </motion.div>
        </motion.div>
    )
}
