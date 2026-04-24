"use client"

import { useCallback, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { PropertyManagementRoot } from "../sections/management/property-management-root"
import { PropertyList } from "./PropertyList"
import { PropertyCreationWizard } from "../sections/creation/property-creation-wizard"
import { useView } from "@/providers/view-context"
import { usePropertyManager } from "../model/hooks"
import { OwnProperty } from "@/types"
import { pageVariants } from "../lib/animations"
import { propertyTokens } from "../lib/property-tokens"

export type PropertyInternalView = "list" | "wizard" | "detail"

function RubberBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
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

export function PropertyView() {
  const { selectedPropertyId, selectPropertyId } = useView()
  const { properties, selectedProperty, isLoading, refresh, deleteProperty } = usePropertyManager(selectedPropertyId)

  const {
    viewMode,
    wizardData,
    startCreate,
    startEdit,
    onSaved,
    closeWizard,
    goBackToList,
    refreshDetail,
  } = usePropertyFlow({
    selectedPropertyId,
    selectPropertyId,
    refresh,
  })

  return (
    <div className={propertyTokens.ui.view.pageBgClass}>
      <RubberBackground />

      <AnimatePresence mode="wait">
        <main className="relative z-10 w-full max-w-[95%] lg:max-w-[75%] xl:max-w-[70%] mx-auto pb-10">
          {viewMode === "wizard" ? (
            <PropertyWizardScreen wizardData={wizardData} onSaved={onSaved} onClose={closeWizard} />
          ) : viewMode === "detail" && selectedProperty ? (
            <PropertyDetailScreen property={selectedProperty} onBack={goBackToList} onSave={refreshDetail} />
          ) : (
            <PropertyListScreen
              properties={properties}
              isLoading={isLoading}
              onSelect={selectPropertyId}
              onAdd={startCreate}
              onEdit={startEdit}
              onDelete={deleteProperty}
            />
          )}
        </main>
      </AnimatePresence>
    </div>
  )
}

function usePropertyFlow({
  selectedPropertyId,
  selectPropertyId,
  refresh,
}: {
  selectedPropertyId: string | null
  selectPropertyId: (id: string | null) => void
  refresh: () => Promise<void>
}) {
  const [internalView, setInternalView] = useState<"list" | "wizard">("list")
  const [wizardData, setWizardData] = useState<OwnProperty | null>(null)

  const viewMode: PropertyInternalView =
    internalView === "wizard" ? "wizard" : selectedPropertyId ? "detail" : "list"

  const startCreate = useCallback(() => {
    setWizardData(null)
    setInternalView("wizard")
  }, [])

  const startEdit = useCallback((p: OwnProperty) => {
    setWizardData(p)
    setInternalView("wizard")
  }, [])

  const onSaved = useCallback(async () => {
    await refresh()
    setInternalView("list")
    selectPropertyId(null)
  }, [refresh, selectPropertyId])

  const closeWizard = useCallback(() => {
    setInternalView("list")
  }, [])

  const goBackToList = useCallback(() => {
    selectPropertyId(null)
  }, [selectPropertyId])

  const refreshDetail = useCallback(async () => {
    await refresh()
  }, [refresh])

  return {
    viewMode,
    wizardData,
    startCreate,
    startEdit,
    onSaved,
    closeWizard,
    goBackToList,
    refreshDetail,
  }
}

function PropertyWizardScreen({
  wizardData,
  onSaved,
  onClose,
}: {
  wizardData: OwnProperty | null
  onSaved: () => Promise<void>
  onClose: () => void
}) {
  return (
    <motion.div key="wizard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PropertyCreationWizard property={wizardData} onSaved={onSaved} onClose={onClose} />
    </motion.div>
  )
}

function PropertyDetailScreen({
  property,
  onBack,
  onSave,
}: {
  property: OwnProperty
  onBack: () => void
  onSave: () => Promise<void>
}) {
  return (
    <motion.div key="detail" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PropertyManagementRoot property={property} onBack={onBack} onSave={onSave} />
    </motion.div>
  )
}

function PropertyListScreen({
  properties,
  isLoading,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: {
  properties: OwnProperty[]
  isLoading: boolean
  onSelect: (id: string | null) => void
  onAdd: () => void
  onEdit: (p: OwnProperty) => void
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PropertyList
        properties={properties}
        onSelect={onSelect}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        addNewProperty
        isLoading={isLoading}
      />
    </motion.div>
  )
}
