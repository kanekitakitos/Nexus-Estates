"use client"

import React from "react"
import { Trash2, Plus, Zap, AlertCircle, ChevronDown, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { IntegrationsService } from "@/services/integrations.service"
import type { ExternalIntegrationDTO, ExternalProviderName } from "@/types/integrations"

const PROVIDERS: ExternalProviderName[] = ["AIRBNB", "BOOKING", "VRBO", "EXPEDIA"]

/**
 * Propriedades para o painel de integrações.
 */
interface IntegrationsPanelProps {
  /** Flag que indica se o sistema está a utilizar dados mockados (ambiente de teste/desenvolvimento) */
  isMock: boolean
  /** Lista atual de integrações estabelecidas */
  items: ExternalIntegrationDTO[]
  /** Função de atualização do estado da lista de integrações */
  setItems: React.Dispatch<React.SetStateAction<ExternalIntegrationDTO[]>>
}

/**
 * @component IntegrationsPanel
 * @description Painel central para a gestão de integrações externas (OTAs como Airbnb, Booking, etc.).
 * 
 * @reference Clean Code - "Separation of Concerns" (SoC):
 * A lógica de UI está separada da gestão de itens. O painel foi dividido em subcomponentes 
 * (`IntegrationForm`, `IntegrationList`) para que o componente principal não cresça de forma descontrolada.
 */
export function IntegrationsPanel({
  isMock,
  items = [],
  setItems,
}: IntegrationsPanelProps) {
  return (
    <div id="apis" className="scroll-mt-10">
      <ProfilePanel 
        title="Sincronização de Canais" 
        subtitle="Conecta as tuas OTAs para sincronizar preços e reservas"
      >
        <div className="space-y-8">
          <IntegrationForm isMock={isMock} items={items} setItems={setItems} />
          <IntegrationList isMock={isMock} items={items} setItems={setItems} />
        </div>
      </ProfilePanel>
    </div>
  )
}

/**
 * @component IntegrationForm
 * @description Subcomponente que representa o formulário de criação/vinculação de uma nova integração.
 */
function IntegrationForm({
  isMock,
  items = [],
  setItems,
}: IntegrationsPanelProps) {
  const [providerName, setProviderName] = React.useState<ExternalProviderName>("AIRBNB")
  const [apiKey, setApiKey] = React.useState("")
  const [active, setActive] = React.useState(true)
  const [isBusy, setIsBusy] = React.useState(false)

  /**
   * Função responsável pela submissão e criação da integração.
   */
  const handleCreateIntegration = async () => {
    if (!apiKey.trim()) return
    setIsBusy(true)
    try {
      if (isMock) {
        const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1
        const masked = apiKey.length >= 4 ? `${apiKey.slice(0, 4)}_****${apiKey.slice(-4)}` : "****"
        setItems((prev) => [{ id: nextId, providerName, apiKeyMasked: masked, active }, ...prev])
        setApiKey("")
        return
      }

      const created = await IntegrationsService.create({ providerName, apiKey, active })
      setItems((prev) => [created, ...prev])
      setApiKey("")
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Seleção do Provedor */}
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/60" htmlFor="providerName">
            Canal / Provedor
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                id="providerName"
                type="button"
                className="cursor-pointer h-12 w-full rounded-2xl border border-(--fg-color)/20 bg-background/50 px-4 text-sm font-bold text-(--fg-color) outline-none focus:ring-2 focus:ring-(--primary-accent) transition-all hover:bg-background/80 flex items-center justify-between"
              >
                <span className="truncate">{providerName}</span>
                <ChevronDown className="w-4 h-4 text-(--fg-color)/50 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl border border-(--fg-color)/20 bg-background/95 backdrop-blur-md p-2">
              <DropdownMenuRadioGroup value={providerName} onValueChange={(v) => setProviderName(v as ExternalProviderName)}>
                {PROVIDERS.map((provider) => (
                  <DropdownMenuRadioItem key={provider} value={provider} className="rounded-xl py-2 pr-3 pl-8 text-xs font-bold uppercase tracking-wider">
                    {provider}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Input da Chave API */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/60" htmlFor="apiKey">
            Token da API / Secret
          </Label>
          <Input
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Ex: sk_live_..."
            className="bg-background/50 border-(--fg-color)/20 rounded-2xl h-12 text-(--fg-color) placeholder:text-(--fg-color)/30 focus-visible:ring-(--primary-accent)"
          />
        </div>
      </div>

      {/* Ações do Formulário */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-y border-(--fg-color)/10">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="peer h-6 w-6 rounded cursor-pointer appearance-none border border-(--fg-color)/30 transition-all checked:bg-(--primary-accent) checked:border-(--primary-accent)"
            />
            <Zap className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-(--fg-color) group-hover:text-(--primary-accent) transition-colors">
            Ativar Imediatamente
          </span>
        </label>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={() => void handleCreateIntegration()} 
            disabled={isBusy || !apiKey.trim()} 
            className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-(--primary-accent) text-white font-bold uppercase tracking-widest shadow-lg shadow-(--primary-accent)/20 hover:shadow-(--primary-accent)/40 transition-all disabled:opacity-30 border border-white/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Vincular
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * @component IntegrationList
 * @description Subcomponente que exibe e gere a lista de integrações ativas/conectadas.
 */
function IntegrationList({
  isMock,
  items = [],
  setItems,
}: IntegrationsPanelProps) {

  /**
   * Função para remover uma integração específica.
   */
  const handleRemoveIntegration = async (id: number) => {
    if (isMock) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      return
    }
    await IntegrationsService.delete(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="grid gap-4">
      <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-(--fg-color)/40">
        Canais Conectados ({items.length})
      </h3>
      
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <IntegrationEmptyState />
          ) : (
            items.map((integration, index) => (
              <IntegrationItem 
                key={integration.id} 
                integration={integration} 
                index={index} 
                onRemove={() => void handleRemoveIntegration(integration.id)} 
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * @component IntegrationEmptyState
 * @description Representa o estado vazio (sem dados) da lista de integrações.
 */
function IntegrationEmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center p-12 bg-background/30 backdrop-blur-md border border-dashed border-(--fg-color)/20 rounded-[2rem] gap-4"
    >
      <div className="h-16 w-16 bg-(--fg-color)/5 rounded-full flex items-center justify-center mb-2 shadow-inner">
        <AlertCircle className="w-6 h-6 text-(--fg-color)/30" />
      </div>
      <p className="text-sm font-bold text-(--fg-color)/60">
        Ainda não tens conexões estabelecidas.
      </p>
      <p className="text-[10px] font-mono uppercase tracking-widest text-(--fg-color)/40 text-center max-w-xs">
        Vincula o Airbnb ou o Booking para começares a receber atualizações automaticamente.
      </p>
    </motion.div>
  )
}

/**
 * @component IntegrationItem
 * @description Subcomponente que renderiza um único item de integração na lista.
 */
function IntegrationItem({
  integration,
  index,
  onRemove,
}: {
  integration: ExternalIntegrationDTO
  index: number
  onRemove: () => void
}) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
      className="group flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-(--fg-color)/10 bg-background/60 hover:bg-background/90 transition-all hover:shadow-xl hover:shadow-(--fg-color)/5"
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-(--fg-color) to-(--fg-color)/70 text-(--bg-color) font-black text-lg shadow-md shadow-(--fg-color)/10">
          {integration.providerName.charAt(0)}
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="text-sm font-black uppercase tracking-tight text-(--fg-color) flex items-center gap-2">
            {integration.providerName}
            {integration.active && <CheckCircle2 className="w-3 h-3 text-green-500" />}
          </div>
          <div className="text-[10px] font-mono text-(--fg-color)/50 truncate max-w-[200px] bg-(--fg-color)/5 px-2 py-0.5 rounded-full">
            {integration.apiKeyMasked}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:pl-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--fg-color)/5 border border-(--fg-color)/5">
          <div className={`h-2 w-2 rounded-full ${integration.active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-(--fg-color)/80">
            {integration.active ? "Sincronizado" : "Pausado"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-foreground/40 hover:bg-red-500 border border-transparent hover:border-red-600 hover:text-white hover:rotate-12 transition-all"
          onClick={onRemove}
          title="Remover Integração"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}
