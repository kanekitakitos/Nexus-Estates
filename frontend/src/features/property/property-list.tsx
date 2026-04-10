"use client"

import { motion } from "framer-motion"
import { Plus, Sparkles, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { BrutalButton } from "@/components/ui/forms/button"
import { BoingText } from "@/components/BoingText"

import { PropertyCardItem } from "./components/property-card-item"
import { PropertyFilterBar } from "./components/property-filter-bar"
import { PropertyStats } from "./components/property-stats"
import { usePropertyFilters } from "./hooks"
import { OwnProperty, PropertyListVariant } from "@/types"
import { staggerContainer, itemFadeUp } from "./animations"
import {
    nexusEyebrowAccentClass,
    nexusEyebrowClass,
    nexusHardBorder,
    nexusShadowMd
} from "./property-tokens"

// ─── Tipos e Interfaces ───────────────────────────────────────────────────

/** Propriedades do componente de listagem principal */
export interface PropertyListProps {
    /** Variante visual: Grelha (CARDS) ou Barra Lateral (BARS) */
    variant?: PropertyListVariant
    /** Se verdadeiro, exibe botão de criação de novas propriedades */
    addNewProperty?: boolean
    /** Lista de ativos brutos vindos da API ou Mock */
    propertys: OwnProperty[]
    /** Callback para seleção de um ativo */
    onSelect?: (id: string) => void
    /** Callback para iniciar criação de novo ativo */
    onAdd?: () => void
    /** Callback para editar um ativo específico */
    onEdit?: (prop: OwnProperty) => void
    /** Callback para apagar um ativo (decommission) */
    onDelete?: (id: string) => void | Promise<void>
    /** Estado de carregamento da listagem */
    isLoading?: boolean
}

// ─── Sub-Componentes Internos ──────────────────────────────────────────────

/**
 * ListHeader - Cabeçalho editorial da listagem.
 * 
 * @description Contém o título "Inventário de Ativos" com estética Nexus e 
 * o botão de ação rápida para criação de novas unidades.
 */
function ListHeader({ onAdd, showAdd }: { onAdd?: () => void; showAdd: boolean }) {
    return (
        <div className="relative flex flex-col items-start justify-between gap-8 overflow-hidden border-b-2 border-[#0D0D0D] pb-10 pr-2 dark:border-zinc-700 md:flex-row md:items-end">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
                <div className="mb-3 flex items-center gap-3">
                    <span className="h-px w-8 bg-foreground/25 dark:bg-white/20" aria-hidden />
                    <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={3} aria-hidden />
                    <span className={nexusEyebrowAccentClass}>Nexus_Inventory // Protocol</span>
                </div>
                <h1 className="max-w-3xl font-serif text-5xl font-bold italic uppercase leading-[0.85] tracking-tighter text-[#0D0D0D] md:text-7xl dark:text-white">
                    <BoingText
                        text="Inventário de"
                        color="currentColor"
                        activeColor="#F97316"
                    />{" "}
                    <span className="text-primary underline decoration-[4px] underline-offset-[8px]">Ativos</span>
                </h1>
                <p className={cn(nexusEyebrowClass, "mt-4 max-w-xl normal-case")}>
                    Gestão editorial do teu alojamento local — mesmo ADN visual da landing Nexus Estates.
                </p>
            </motion.div>

            {showAdd && (
                <BrutalButton type="button" variant="brutal-property-cta" onClick={onAdd}>
                    <Plus className="h-4 w-4" strokeWidth={3} /> Novo ativo
                </BrutalButton>
            )}
        </div>
    )
}

/**
 * EmptyState - Feedback visual para listas vazias.
 * 
 * @description Exibido quando os filtros não retornam resultados (Nexus_Null).
 */
function EmptyState() {
    return (
        <div className={cn(
            "flex flex-col items-center rounded-[2.5rem] border-2 border-dashed border-[#0D0D0D]/10 bg-[#F0ECD9]/10 py-24 text-center dark:border-zinc-800 dark:bg-zinc-900/20",
            nexusShadowMd
        )}>
            <div className="relative mb-6">
                <AlertCircle className="h-14 w-14 text-[#8C7B6B]/40 dark:text-zinc-600" strokeWidth={1.5} />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                />
            </div>
            <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-[#0D0D0D] dark:text-white">
                Nexus_Null // Vazio
            </h3>
            <p className={cn(nexusEyebrowClass, "max-w-xs opacity-60")}>
                O protocolo de busca não retornou ativos para os critérios atuais.
            </p>
        </div>
    )
}

/**
 * SkeletonLoader - Efeito de carregamento brutalista.
 */
function SkeletonLoader() {
    return (
        <div className={cn(
            "h-48 animate-pulse rounded-[1.25rem] bg-[#E8E4D4]/60 dark:bg-zinc-800/50",
            nexusHardBorder
        )} />
    )
}

/**
 * InventoryRailView - Sub-layout para a variante lateral 'BARS'.
 * 
 * @description Vista compacta otimizada para barras laterais ou dashboards 
 * secundários, focada em densidade de informação.
 */
function InventoryRailView({
    items, onAdd, onSelect, onEdit, onDelete, showAdd
}: any) {
    return (
        <div className="h-full flex flex-col pt-4 overflow-hidden">
            {showAdd && (
                <button
                    onClick={onAdd}
                    className="w-full h-10 border-2 border-dashed border-foreground/30 dark:border-zinc-800 rounded-lg font-mono text-[10px] uppercase font-black mb-6 text-foreground/60 dark:text-zinc-400 hover:border-primary transition-colors"
                >
                    [ + ] NOVO_ATIVO
                </button>
            )}
            <div className="flex-1  pt-1 space-y-3 overflow-y-auto pr-1">
                {items.map((prop: OwnProperty) => (
                    <PropertyCardItem
                        key={prop.id} prop={prop}
                        onSelect={onSelect || (() => { })}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        variant="inventoryRail"
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * AssetGrid - Grelha de Ativos com animação de cascata.
 * 
 * @description Orchestrador da disposição de cartões na vista 'CARDS'.
 */
function AssetGrid({
    items, onSelect, onEdit, onDelete
}: {
    items: OwnProperty[];
    onSelect?: (id: string) => void;
    onEdit?: (p: OwnProperty) => void;
    onDelete?: (id: string) => void | Promise<void>
}) {
    if (items.length === 0) return <EmptyState />

    return (
        <motion.div
            initial="initial" animate="animate" variants={staggerContainer}
            className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
            {items.map((prop) => (
                <motion.div key={prop.id} variants={itemFadeUp} className="min-w-0 h-full">
                    <PropertyCardItem prop={prop} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} variant="grid" />
                </motion.div>
            ))}
        </motion.div>
    )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * PropertyList - Módulo de Listagem e Gestão de Ativos.
 * 
 * @description Orchestrador de inventário que gere filtros, estatísticas 
 * e troca inteligente entre vistas (Grelha Editorial vs Barra de Inventário).
 */
export function PropertyList({ variant = "CARDS", propertys, ...props }: PropertyListProps) {
    const { filters, updateFilter, filteredProperties } = usePropertyFilters(propertys)

    if (variant === "BARS") {
        return (
            <div className="h-full flex flex-col gap-6">
                <PropertyFilterBar filters={filters} setFilter={updateFilter} variant="compact" />
                <InventoryRailView
                    items={filteredProperties}
                    onAdd={props.onAdd}
                    onSelect={props.onSelect}
                    onEdit={props.onEdit}
                    onDelete={props.onDelete}
                    showAdd={props.addNewProperty}
                />
            </div>
        )
    }

    return (
        <div className="space-y-10 py-6 md:py-15">
            {/* Secção de Cabeçalho e Stats */}
            <ListHeader onAdd={props.onAdd} showAdd={!!props.addNewProperty} />
            <PropertyStats propertys={propertys} />

            {/* Sistema de Filtros */}
            <PropertyFilterBar filters={filters} setFilter={updateFilter} variant="default" />

            {/* Content Display (Skeleton vs Grid) */}
            <div className="space-y-6">
                {props.isLoading ? (
                    <SkeletonLoader />
                ) : (
                    <AssetGrid items={filteredProperties} onSelect={props.onSelect} onEdit={props.onEdit} onDelete={props.onDelete} />
                )}
            </div>
        </div>
    )
}

/**
 * PropertyListBars - Atalho para a vista lateral (BARS).
 * 
 * @description Componente utilitário que pré-configura a variante 'BARS' 
 * para utilização em painéis secundários.
 */
export function PropertyListBars(props: PropertyListProps) {
    return <PropertyList {...props} variant="BARS" />
}