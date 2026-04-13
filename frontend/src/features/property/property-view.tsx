"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { PropertyManagementRoot } from "./sections/management/property-management-root"
import { PropertyList } from "./property-list"
import { PropertyCreationWizard } from "./sections/creation/property-creation-wizard"
import { useView } from "@/features/view-context"
import { usePropertyManager } from "./hooks"
import { OwnProperty } from "@/types"
import { pageVariants } from "./animations"

// ─── Tipos e Interfaces ───────────────────────────────────────────────────

/** Estados internos de navegação da funcionalidade de propriedades */
export type PropertyInternalView = "list" | "wizard" | "detail"

// ─── Sub-Componentes Internos ──────────────────────────────────────────────

/**
 * RubberBackground - Fundo decorativo dinâmico (Nexus_Ambience).
 * 
 * Cria uma atmosfera ultra-fluida com orbes orgânicos em movimento e texturas 
 * subtis para reforçar a identidade visual premium.
 * 
 * @description Componente interno de ambiente para a vista de propriedades.
 */
function RubberBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Orb Primário */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -60, 0], rotate: [0, 90, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[100px]"
      />
      {/* Orb Secundário */}
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 40, 0], rotate: [0, -60, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 -right-32 w-[30vw] h-[30vw] rounded-full bg-foreground/[0.03] blur-[120px]"
      />
      {/* Grão/Textura */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />
    </div>
  )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * PropertyView - Orchestrator Principal da Funcionalidade de Propriedades.
 * 
 * Gere a transição de estado entre Listagem, Edição e Wizard (Criação), 
 * utilizando um sistema de roteamento baseado em Framer Motion para transições 
 * fluidas.
 * 
 * @hook useView - Acede ao estado global de seleção de ativos.
 * @hook usePropertyManager - Gere a lógica de negócio e sincronização de dados.
 */
export function PropertyView() {
  const { selectedPropertyId, selectPropertyId } = useView()
  const { properties, selectedProperty, isLoading, refresh, deleteProperty } = usePropertyManager(selectedPropertyId)

  const [internalView, setInternalView] = useState<"list" | "wizard">("list")
  const [wizardData, setWizardData] = useState<OwnProperty | null>(null)

  // Determinação proativa do modo de visualização
  const viewMode = internalView === "wizard" ? "wizard" : selectedPropertyId ? "detail" : "list"

  /**
   * Inicia o fluxo de criação de um novo ativo.
   * @description Reseta o wizardData e muda a vista para 'wizard'.
   */
  const startCreate = () => {
    setWizardData(null)
    setInternalView("wizard")
  }

  /**
   * Inicia o fluxo de edição rápida (via wizard) de um ativo existente.
   * @param {OwnProperty} p - O objeto da propriedade a editar.
   */
  const startEdit = (p: OwnProperty) => {
    setWizardData(p)
    setInternalView("wizard")
  }

  /**
   * Callback disparado após uma operação de gravação bem-sucedida.
   * @description Refresca a lista de ativos e retorna à vista principal.
   */
  const onSaved = async () => {
    await refresh()
    setInternalView("list")
    selectPropertyId(null)
  }

  /**
   * Encerra o wizard de criação/edição e retorna à listagem.
   */
  const closeWizard = () => {
    setInternalView("list")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F0ECD9]/35 dark:bg-zinc-950">
      {/* Camada de Ambiente */}
      <RubberBackground />

      <AnimatePresence mode="wait">
        <main className="relative z-10 w-full max-w-[95%] lg:max-w-[75%] xl:max-w-[70%] mx-auto pb-10">
          {viewMode === "wizard" ? (
            <motion.div key="wizard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PropertyCreationWizard property={wizardData} onSaved={onSaved} onClose={closeWizard} />
            </motion.div>
          ) : viewMode === "detail" && selectedProperty ? (
            <motion.div key="detail" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PropertyManagementRoot
                property={selectedProperty}
                onBack={() => selectPropertyId(null)}
                onSave={async () => {
                  await refresh()
                }}
              />
            </motion.div>
          ) : (
            <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PropertyList
                propertys={properties}
                onSelect={selectPropertyId}
                onAdd={startCreate}
                onEdit={startEdit}
                onDelete={deleteProperty}
                addNewProperty
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </main>
      </AnimatePresence>
    </div>
  )
}