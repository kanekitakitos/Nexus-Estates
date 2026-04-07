"use client"

import React from "react"
import { Trash2, Plus, Zap, AlertCircle, ChevronDown, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { IntegrationsService } from "@/services/integrations.service"
import type { ExternalIntegrationDTO, ExternalProviderName } from "@/types/integrations"

const PROVIDERS: ExternalProviderName[] = ["AIRBNB", "BOOKING", "VRBO", "EXPEDIA"]

export function IntegrationsPanel({
  isMock,
  items,
  setItems,
}: {
  isMock: boolean
  items: ExternalIntegrationDTO[]
  setItems: React.Dispatch<React.SetStateAction<ExternalIntegrationDTO[]>>
}) {
  const [providerName, setProviderName] = React.useState<ExternalProviderName>("AIRBNB")
  const [apiKey, setApiKey] = React.useState("")
  const [active, setActive] = React.useState(true)
  const [busy, setBusy] = React.useState(false)

  const create = async () => {
    if (!apiKey.trim()) return
    setBusy(true)
    try {
      if (isMock) {
        const id = Math.max(0, ...items.map((i) => i.id)) + 1
        const masked = apiKey.length >= 4 ? `${apiKey.slice(0, 4)}_****${apiKey.slice(-4)}` : "****"
        setItems((prev) => [{ id, providerName, apiKeyMasked: masked, active }, ...prev])
        setApiKey("")
        return
      }

      const created = await IntegrationsService.create({ providerName, apiKey, active })
      setItems((prev) => [created, ...prev])
      setApiKey("")
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: number) => {
    if (isMock) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      return
    }
    await IntegrationsService.delete(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div id="apis" className="scroll-mt-10">
      <ProfilePanel 
        title="Sincronização de Canais" 
        subtitle="Conecta as tuas OTAs para sincronizar preços e reservas"
      >
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg-color)]/60" htmlFor="providerName">
                Canal / Provedor
              </Label>
              <div className="relative">
                <select
                  id="providerName"
                  title="Selecionar Provedor"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value as ExternalProviderName)}
                  className="appearance-none cursor-pointer h-12 w-full rounded-2xl border border-[var(--fg-color)]/20 bg-background/50 px-4 text-sm font-bold text-[var(--fg-color)] outline-none focus:ring-2 focus:ring-[var(--primary-accent)] transition-all hover:bg-background/80"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-[var(--fg-color)]/50" />
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg-color)]/60" htmlFor="apiKey">
                Token da API / Secret
              </Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ex: sk_live_..."
                className="bg-background/50 border-[var(--fg-color)]/20 rounded-2xl h-12 text-[var(--fg-color)] placeholder:text-[var(--fg-color)]/30 focus-visible:ring-[var(--primary-accent)]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-y border-[var(--fg-color)]/10">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="peer h-6 w-6 rounded cursor-pointer appearance-none border border-[var(--fg-color)]/30 transition-all checked:bg-[var(--primary-accent)] checked:border-[var(--primary-accent)]"
                />
                <Zap className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[var(--fg-color)] group-hover:text-[var(--primary-accent)] transition-colors">
                Ativar Imediatamente
              </span>
            </label>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => void create()} 
                disabled={busy || !apiKey.trim()} 
                className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-[var(--primary-accent)] text-white font-bold uppercase tracking-widest shadow-lg shadow-[var(--primary-accent)]/20 hover:shadow-[var(--primary-accent)]/40 transition-all disabled:opacity-30 border border-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Vincular
              </Button>
            </motion.div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--fg-color)]/40">
              Canais Conectados ({items.length})
            </h3>
            
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center p-12 bg-background/30 backdrop-blur-md border border-dashed border-[var(--fg-color)]/20 rounded-[2rem] gap-4"
                  >
                    <div className="h-16 w-16 bg-[var(--fg-color)]/5 rounded-full flex items-center justify-center mb-2 shadow-inner">
                      <AlertCircle className="w-6 h-6 text-[var(--fg-color)]/30" />
                    </div>
                    <p className="text-sm font-bold text-[var(--fg-color)]/60">Ainda não tens conexões estabelecidas.</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--fg-color)]/40 text-center max-w-xs">
                      Vincula o Airbnb ou o Booking para começares a receber atualizações automaticamente.
                    </p>
                  </motion.div>
                ) : (
                  items.map((i, index) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                      key={i.id} 
                      className="group flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-[var(--fg-color)]/10 bg-background/60 hover:bg-background/90 transition-all hover:shadow-xl hover:shadow-[var(--fg-color)]/5"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--fg-color)] to-[var(--fg-color)]/70 text-[var(--bg-color)] font-black text-lg shadow-md shadow-[var(--fg-color)]/10">
                          {i.providerName.charAt(0)}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-sm font-black uppercase tracking-tight text-[var(--fg-color)] flex items-center gap-2">
                            {i.providerName}
                            {i.active && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                          </div>
                          <div className="text-[10px] font-mono text-[var(--fg-color)]/50 truncate max-w-[200px] bg-[var(--fg-color)]/5 px-2 py-0.5 rounded-full">
                            {i.apiKeyMasked}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:pl-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--fg-color)]/5 border border-[var(--fg-color)]/5">
                          <div className={`h-2 w-2 rounded-full ${i.active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"}`} />
                          <span className="text-[10px] font-bold uppercase tracking-tighter text-[var(--fg-color)]/80">
                            {i.active ? "Sincronizado" : "Pausado"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full text-foreground/40 hover:bg-red-500 border border-transparent hover:border-red-600 hover:text-white hover:rotate-12 transition-all"
                          onClick={() => void remove(i.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </ProfilePanel>
    </div>
  )
}

