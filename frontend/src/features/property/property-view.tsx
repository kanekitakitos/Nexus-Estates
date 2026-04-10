"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { PropertyEdit } from "./property-edit"
import { PropertyList } from "./property-list"
import { PropertyForm } from "./property-form"
import { useView } from "@/features/view-context"
import { usePropertyManager } from "./hooks"
import { OwnProperty } from "@/types"
import { pageVariants } from "./animations"

// ─── Sub-Componentes de Ambiente ────────────────────────────────────────────

/** Fundo decorativo ultra-fluido (Nexus_Ambience) */
function RubberBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div
                animate={{ x: [0, 40, 0], y: [0, -60, 0], rotate: [0, 90, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -left-20 w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[100px]"
            />
            <motion.div
                animate={{ x: [0, -50, 0], y: [0, 40, 0], rotate: [0, -60, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/2 -right-32 w-[30vw] h-[30vw] rounded-full bg-foreground/[0.03] blur-[120px]"
            />
            <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />
        </div>
    )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * PropertyView - Orchestrator Principal.
 * 
 * Gere a transição de estado entre Listagem, Edição e Wizard, utilizando 
 * um sistema de roteamento baseado em Framer Motion.
 */
export function PropertyView() {
    const { selectedPropertyId, selectPropertyId } = useView()
    const { properties, selectedProperty, isLoading, refresh, deleteProperty } = usePropertyManager(selectedPropertyId)

    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'wizard'>('list')
    const [wizardData, setWizardData] = useState<OwnProperty | null>(null)

    useEffect(() => {
        if (selectedPropertyId) setViewMode('detail')
        else if (viewMode === 'detail') setViewMode('list')
    }, [selectedPropertyId, viewMode])

    const startCreate = () => { setWizardData(null); setViewMode('wizard'); }
    const startEdit = (p: OwnProperty) => { setWizardData(p); setViewMode('wizard'); }
    
    const onSaved = async () => {
        await refresh()
        setViewMode('list'); selectPropertyId(null)
    }

    return (
        <div className="relative min-h-screen bg-transparent overflow-hidden">
            <RubberBackground />

            <AnimatePresence mode="wait">
                <main className="relative z-10 w-full max-w-[95%] lg:max-w-[75%] xl:max-w-[70%] mx-auto">
                    {viewMode === 'wizard' ? (
                        <motion.div key="wizard" {...pageVariants}>
                            <PropertyForm 
                                property={wizardData} onSaved={onSaved} 
                                onClose={() => setViewMode(selectedPropertyId ? 'detail' : 'list')} 
                            />
                        </motion.div>
                    ) : viewMode === 'detail' && selectedProperty ? (
                        <motion.div key="detail" {...pageVariants}>
                            <PropertyEdit 
                                property={selectedProperty} onBack={() => selectPropertyId(null)} 
                                onSave={async () => { await refresh() }} 
                            />
                        </motion.div>
                    ) : (
                        <motion.div key="list" {...pageVariants}>
                            <PropertyList
                                propertys={properties} onSelect={selectPropertyId}
                                onAdd={startCreate} onEdit={startEdit} onDelete={deleteProperty}
                                addNewProperty isLoading={isLoading}
                            />
                        </motion.div>
                    )}
                </main>
            </AnimatePresence>
        </div>
    )
}