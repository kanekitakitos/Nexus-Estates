"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { PropertyEdit } from "./property-edit"
import { PropertyList } from "./property-list"
import { PropertyForm } from "./property-form"
import { useView } from "@/features/view-context"
import { usePropertyManager } from "./hooks/use-property-manager"
import { OwnProperty } from "@/types"
import { pageVariants } from "./animations"


/**
 * PropertyView Root
 * Acts as the feature controller, orchestrating List, Detail, and Wizard views.
 */
export function PropertyView() {
    const { selectedPropertyId, selectPropertyId } = useView()
    
    // Feature Logic
    const { properties, selectedProperty, isLoading, refresh, deleteProperty } = usePropertyManager(selectedPropertyId)

    // Navigation State
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'wizard'>('list')
    const [wizardInitialData, setWizardInitialData] = useState<OwnProperty | null>(null)

    // Sync viewMode with selection
    useEffect(() => {
        if (selectedPropertyId) setViewMode('detail')
        else if (viewMode === 'detail') setViewMode('list')
    }, [selectedPropertyId])

    // Interaction Handlers
    const handleStartCreate = () => {
        setWizardInitialData(null)
        setViewMode('wizard')
    }

    const handleStartEdit = (prop: OwnProperty) => {
        setWizardInitialData(prop)
        setViewMode('wizard')
    }

    const handleWizardDone = async () => {
        await refresh()
        setViewMode('list')
        selectPropertyId(null)
    }

    return (
        <div className="relative min-h-screen bg-transparent overflow-hidden">
            <RubberBackground />
            
            <AnimatePresence mode="wait">
                <main className="relative z-10 w-full max-w-[95%] lg:max-w-[75%] xl:max-w-[70%] mx-auto">
                    {viewMode === 'wizard' ? (
                        <motion.div key="wizard" {...pageVariants}>
                            <PropertyForm
                                property={wizardInitialData}
                                onClose={() => setViewMode(selectedPropertyId ? 'detail' : 'list')}
                                onSaved={handleWizardDone}
                            />
                        </motion.div>
                    ) : viewMode === 'detail' && selectedProperty ? (
                        <motion.div key="detail" {...pageVariants}>
                            <PropertyEdit
                                property={selectedProperty}
                                onBack={() => selectPropertyId(null)}
                                onEdit={() => handleStartEdit(selectedProperty)}
                            />
                        </motion.div>
                    ) : (
                        <motion.div key="list" {...pageVariants}>
                            <PropertyList
                                propertys={properties}
                                onSelect={(id) => selectPropertyId(id)}
                                onAdd={handleStartCreate}
                                onEdit={handleStartEdit}
                                addNewProperty
                                isLoading={isLoading}
                                onDelete={deleteProperty}
                            />
                        </motion.div>
                    )}
                </main>
            </AnimatePresence>
        </div>
    )
}

function RubberBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Soft Gummy Blobs */}
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

            {/* Sharp Rubber Shards (More Neo-Brutal) */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute top-20 left-10 w-32 h-32 border-[10px] border-foreground rounded-[20%] rotate-12" />
                <div className="absolute bottom-20 left-1/4 w-60 h-8 bg-foreground rounded-full rotate-[15deg]" />
            </div>

            {/* Technical Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay" 
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} 
            />
        </div>
    )
}