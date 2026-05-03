"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { PropertyManagementRoot } from "../sections/management/property-management-root"
import { PropertyList } from "./PropertyList"
import { PropertyCreationWizard } from "../sections/creation/property-creation-wizard"
import { useView } from "@/providers/view-context"
import { usePropertyManager } from "../model/hooks"
import { OwnProperty } from "@/types"
import { PropertyService } from "@/services/property.service"
import type { UpdatePropertyRequest } from "@/types/property"
import { pageVariants } from "../lib/animations"
import { propertyTokens } from "../lib/property-tokens"
import type { EditMode } from "../sections/management/property-management-root"

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

  const [isCreating, setIsCreating] = useState(false)
  const [detailInitialMode, setDetailInitialMode] = useState<EditMode>("VIEW")

  useEffect(() => {
    const onManage = () => {
      setIsCreating(false)
      setDetailInitialMode("VIEW")
      selectPropertyId(null)
    }

    window.addEventListener("properties-manage", onManage as EventListener)
    return () => window.removeEventListener("properties-manage", onManage as EventListener)
  }, [selectPropertyId])

  const startCreate = useCallback(() => {
    setIsCreating(true)
    selectPropertyId(null)
  }, [selectPropertyId])

  const closeWizard = useCallback(() => {
    setIsCreating(false)
  }, [])

  const onCreatedSaved = useCallback(async () => {
    await refresh()
    setIsCreating(false)
    selectPropertyId(null)
  }, [refresh, selectPropertyId])

  const goBackToList = useCallback(() => {
    setDetailInitialMode("VIEW")
    selectPropertyId(null)
  }, [selectPropertyId])

  const handleSelect = useCallback((id: string | null) => {
    if (id) setDetailInitialMode("VIEW")
    selectPropertyId(id)
  }, [selectPropertyId])

  const handleEdit = useCallback((p: OwnProperty) => {
    setDetailInitialMode("EDIT")
    selectPropertyId(p.id)
  }, [selectPropertyId])

  const saveDetail = useCallback(async (updated: OwnProperty) => {
    const initial = selectedProperty
    const id = Number(updated.id)
    const title =
      typeof updated.title === "string"
        ? updated.title
        : updated.title?.pt || updated.title?.en || ""

    const description =
      typeof updated.description === "string"
        ? { pt: updated.description }
        : (updated.description as Record<string, string>)

    const isActive = updated.status !== "MAINTENANCE"

    const patch: UpdatePropertyRequest = {}
    if (!initial || String(initial.title) !== String(updated.title)) patch["title"] = title
    if (!initial || JSON.stringify(initial.description) !== JSON.stringify(updated.description)) patch["description"] = description
    if (!initial || initial.location !== updated.location) patch["location"] = updated.location
    if (!initial || initial.city !== updated.city) patch["city"] = updated.city
    if (!initial || initial.address !== updated.address) patch["address"] = updated.address
    if (!initial || Number(initial.price) !== Number(updated.price)) patch["basePrice"] = updated.price
    if (!initial || Number(initial.maxGuests) !== Number(updated.maxGuests)) patch["maxGuests"] = updated.maxGuests
    if (!initial || (initial.status !== "MAINTENANCE") !== isActive) patch["isActive"] = isActive
    if (!initial || String(initial.imageUrl || "") !== String(updated.imageUrl || "")) patch["imageUrl"] = updated.imageUrl || undefined

    const patchKeys = Object.keys(patch)
    if (patchKeys.length > 0) {
      await PropertyService.patchProperty(id, patch)
    }

    const normalizeIds = (arr: number[]) => [...arr].map(Number).filter(Number.isFinite).sort((a, b) => a - b)
    const initialAmenities = initial ? normalizeIds(initial.amenityIds) : null
    const updatedAmenities = normalizeIds(updated.amenityIds)
    const shouldUpdateAmenities = !initialAmenities || JSON.stringify(initialAmenities) !== JSON.stringify(updatedAmenities)

    if (shouldUpdateAmenities) {
      await PropertyService.updateAmenities(id, updatedAmenities)
    }

    if (updated.propertyRule) {
      const initialRule = initial?.propertyRule ?? null
      const shouldUpdateRules = !initialRule || JSON.stringify(initialRule) !== JSON.stringify(updated.propertyRule)
      if (shouldUpdateRules) {
        const patchRules: Record<string, unknown> = {}
        const keys = ["checkInTime", "checkOutTime", "minNights", "maxNights", "bookingLeadTimeDays"] as const
        for (const k of keys) {
          const before = initialRule ? (initialRule as any)[k] : undefined
          const after = (updated.propertyRule as any)[k]
          if (typeof after === "undefined") continue
          if (JSON.stringify(before) !== JSON.stringify(after)) {
            patchRules[k] = after
          }
        }
        if (Object.keys(patchRules).length > 0) {
          await PropertyService.patchRules(id, patchRules)
        }
      }
    }

    if (updated.seasonalityRules) {
      const initialSeasonality = initial?.seasonalityRules ?? null
      const shouldUpdateSeasonality = !initialSeasonality || JSON.stringify(initialSeasonality) !== JSON.stringify(updated.seasonalityRules)
      if (shouldUpdateSeasonality) {
        await PropertyService.updateSeasonalityRules(id, updated.seasonalityRules)
      }
    }

    if (updated.permissions) {
      const compact = (arr: typeof updated.permissions) =>
        (arr || []).map((p) => ({ userId: Number(p.userId), accessLevel: p.accessLevel })).sort((a, b) => a.userId - b.userId)

      const initialPerms = initial?.permissions ? compact(initial.permissions) : null
      const updatedPerms = compact(updated.permissions)
      const shouldUpdatePerms = !initialPerms || JSON.stringify(initialPerms) !== JSON.stringify(updatedPerms)
      if (shouldUpdatePerms) {
        await PropertyService.updatePermissions(id, updatedPerms)
      }
    }

    await refresh()
  }, [refresh, selectedProperty])

  return (
    <div className={propertyTokens.ui.view.pageBgClass}>
      <RubberBackground />

      <AnimatePresence mode="wait">
        <main className="relative z-10 w-full max-w-[95%] lg:max-w-[75%] xl:max-w-[70%] mx-auto pb-10">
          {isCreating ? (
            <PropertyWizardScreen onSaved={onCreatedSaved} onClose={closeWizard} />
          ) : selectedPropertyId && !selectedProperty ? (
            <motion.div key="detail-loading" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <div className="p-6 text-sm text-muted-foreground font-mono">Loading_Property...</div>
            </motion.div>
          ) : selectedPropertyId && selectedProperty ? (
            <PropertyDetailScreen
              property={selectedProperty}
              initialMode={detailInitialMode}
              onBack={goBackToList}
              onSave={saveDetail}
            />
          ) : (
            <PropertyListScreen
              properties={properties}
              isLoading={isLoading}
              onSelect={handleSelect}
              onAdd={startCreate}
              onEdit={handleEdit}
              onDelete={deleteProperty}
            />
          )
          }
        </main>
      </AnimatePresence>
    </div>
  )
}

function PropertyWizardScreen({
  onSaved,
  onClose,
}: {
  onSaved: () => Promise<void>
  onClose: () => void
}) {
  return (
    <motion.div key="wizard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PropertyCreationWizard property={null} onSaved={onSaved} onClose={onClose} />
    </motion.div>
  )
}

function PropertyDetailScreen({
  property,
  initialMode,
  onBack,
  onSave,
}: {
  property: OwnProperty
  initialMode?: EditMode
  onBack: () => void
  onSave: (updated: OwnProperty) => Promise<void>
}) {
  return (
    <motion.div key="detail" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PropertyManagementRoot property={property} initialMode={initialMode} onBack={onBack} onSave={onSave} />
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
