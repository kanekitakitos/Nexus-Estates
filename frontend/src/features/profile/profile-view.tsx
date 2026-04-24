"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProfileHeader } from "@/features/profile/components/profile-header"
import { IntegrationsPanel } from "@/features/profile/components/integrations-panel"
import { ProfileSidebar, type TabType } from "@/features/profile/components/profile-sidebar"
import { UserService } from "@/services/user.service"
import type { UserProfile } from "@/types/user"
import type { ExternalIntegrationDTO } from "@/types/integrations"
import { IntegrationsService } from "@/services/integrations.service"
import { PixelBlast } from "@/components/ui/PixelBlast"
import { motion, AnimatePresence } from "framer-motion"

import { SidebarProvider } from "@/components/ui/layout/sidebar"
import { notify } from "@/lib/notify"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { AuthService } from "@/services/auth.service"
import { SyncService } from "@/services/sync.service"
import type { WebhookSubscription } from "@/types/sync"

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"))
    checkDark()

    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect()
  }, [])

  return isDark
}

function useProfileData() {
  const [me, setMe] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<"none" | "unauthorized" | "network" | "server">("none")
  const [loadErrorInfo, setLoadErrorInfo] = useState<{ status?: number; message?: string }>({})
  const [integrations, setIntegrations] = useState<ExternalIntegrationDTO[]>([])
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError("none")
    setLoadErrorInfo({})
    try {
      const data = await UserService.getMe()
      setMe(data)

      try {
        const list = await IntegrationsService.list()
        setIntegrations(list)
      } catch {
        setIntegrations([])
      }
      try {
        const list = await SyncService.listWebhooks()
        setWebhooks(list)
      } catch {
        setWebhooks([])
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: unknown } }).response?.status
      const data = (err as { response?: { data?: unknown } }).response?.data as
        | { message?: unknown; error?: { message?: unknown } }
        | undefined
      const message =
        typeof data?.message === "string"
          ? data.message
          : typeof data?.error?.message === "string"
            ? data.error.message
            : undefined
      setLoadErrorInfo({ status, message })

      if (status === 401 || status === 403) {
        setLoadError("unauthorized")
      } else if (typeof status === "number") {
        setLoadError("server")
      } else {
        setLoadError("network")
      }
      setMe(null)
      setIntegrations([])
      setWebhooks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    me,
    loading,
    loadError,
    loadErrorInfo,
    integrations,
    setIntegrations,
    webhooks,
    setWebhooks,
    load,
  }
}

function ProfileMainScreen({
  isDark,
  activeTab,
  onTabChange,
  me,
  integrations,
  setIntegrations,
  webhooks,
  setWebhooks,
  onLoad,
}: {
  isDark: boolean
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  me: UserProfile
  integrations: ExternalIntegrationDTO[]
  setIntegrations: React.Dispatch<React.SetStateAction<ExternalIntegrationDTO[]>>
  webhooks: WebhookSubscription[]
  setWebhooks: React.Dispatch<React.SetStateAction<WebhookSubscription[]>>
  onLoad: () => Promise<void>
}) {
  const CustomStyle = {
    "--bg-color": isDark ? "#0A0D14" : "#F0ECD9",
    "--fg-color": isDark ? "#E6E2D1" : "#0D0D0D",
    "--panel-bg": isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)",
    "--primary-accent": "#e2621cff",
  } as React.CSSProperties

  return (
    <div style={CustomStyle} className="min-h-screen relative overflow-x-hidden transition-colors duration-500 ease-in-out bg-(--bg-color)">
      <ProfileBackground isDark={isDark} />

      <SidebarProvider className="relative z-10 w-full min-h-screen bg-transparent">
        <div className="flex w-full">
          <ProfileSidebar activeTab={activeTab} onTabChange={onTabChange} />

          <main className="flex-1 w-full p-8 lg:p-14 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <ProfileContent
                activeTab={activeTab}
                me={me}
                integrations={integrations}
                setIntegrations={setIntegrations}
                webhooks={webhooks}
                setWebhooks={setWebhooks}
                onLoad={onLoad}
                onTabChange={onTabChange}
              />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}

/**
 * @component ProfileView
 * @description Contentor principal da secção de Perfil. 
 * Encapsula a lógica de gestão de estado (tabs, utilizador, integrações) e o layout base da página.
 * 
 * @reference Clean Code - "Smart Component / Dumb Component":
 * Este é um "Smart Component" (Contentor) que detém a responsabilidade de comunicação com serviços e estado.
 * Os seus "Dumb Components" são os painéis de visualização (`ProfileHeader`, `EditProfileForm`, etc).
 */
export function ProfileView() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const isDark = useIsDarkMode()
  const {
    me,
    loading,
    loadError,
    loadErrorInfo,
    integrations,
    setIntegrations,
    webhooks,
    setWebhooks,
    load,
  } = useProfileData()

  if (loading) {
    return <ProfileLoadingState />
  }

  if (!me) {
    return (
      <ProfileErrorState
        error={loadError}
        info={loadErrorInfo}
        onRetry={load}
        onLogin={() => router.replace("/login?expired=true")}
        onBack={() => router.back()}
      />
    )
  }

  return (
    <ProfileMainScreen
      isDark={isDark}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      me={me}
      integrations={integrations}
      setIntegrations={setIntegrations}
      webhooks={webhooks}
      setWebhooks={setWebhooks}
      onLoad={load}
    />
  )
}

/**
 * Subcomponente de Animação de Background
 */
function ProfileBackground({ isDark }: { isDark: boolean }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <PixelBlast 
        color={isDark ? "#4895ef" : "var(--primary-accent)"}
        pixelSize={3}
        patternDensity={0.5}
        liquid={true}
        liquidStrength={0.25}
        liquidRadius={1.5}
        enableRipples={true}
        rippleSpeed={0.5}
        rippleIntensityScale={2}
        edgeFade={0.8}
      />
    </div>
  )
}

/**
 * Subcomponente de Estado de Loading
 */
function ProfileLoadingState() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-1 w-24 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-(--primary-accent)" 
            animate={{ x: ["-100%", "100%"] }} 
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Nexus ID</span>
      </div>
    </div>
  )
}

/**
 * Subcomponente de Estado de Erro / Sessão Expirada
 */
function ProfileErrorState({
  error,
  info,
  onRetry,
  onLogin,
  onBack,
}: {
  error: "none" | "unauthorized" | "network" | "server"
  info: { status?: number; message?: string }
  onRetry: () => Promise<void>
  onLogin: () => void
  onBack: () => void
}) {
  const title =
    error === "unauthorized"
      ? "Sessão expirada."
      : error === "network"
        ? "Backend indisponível."
        : "Não foi possível carregar o perfil."

  const subtitle =
    error === "unauthorized"
      ? "Faz login novamente para continuar."
      : error === "network"
        ? "Verifica se o API Gateway e o user-service estão ligados."
        : info.status
          ? `HTTP ${info.status}${info.message ? ` · ${info.message}` : ""}`
          : "Tenta novamente."

  return (
    <div className="h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-foreground/10 bg-background/60 p-6">
        <div className="space-y-1">
          <div className="text-sm font-black uppercase tracking-[0.2em]">{title}</div>
          <div className="text-xs font-mono opacity-60">{subtitle}</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {error === "unauthorized" ? (
            <>
              <button
                type="button"
                onClick={onBack}
                className="h-12 flex-1 rounded-2xl border border-foreground/20 bg-foreground/5 font-bold uppercase tracking-widest text-xs"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={onLogin}
                className="h-12 flex-1 rounded-2xl bg-(--primary-accent) text-white font-bold uppercase tracking-widest text-xs border border-white/10"
              >
                Ir para Login
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void onRetry()}
                className="h-12 flex-1 rounded-2xl border border-foreground/20 bg-foreground/5 font-bold uppercase tracking-widest text-xs"
              >
                Tentar Novamente
              </button>
              <button
                type="button"
                onClick={onBack}
                className="h-12 flex-1 rounded-2xl bg-(--primary-accent) text-white font-bold uppercase tracking-widest text-xs border border-white/10"
              >
                Voltar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Subcomponente que Gere a Transição entre Painéis de Perfil
 */
function ProfileContent({
  activeTab,
  me,
  integrations,
  setIntegrations,
  webhooks,
  setWebhooks,
  onLoad,
  onTabChange,
}: {
  activeTab: TabType,
  me: UserProfile,
  integrations: ExternalIntegrationDTO[],
  setIntegrations: React.Dispatch<React.SetStateAction<ExternalIntegrationDTO[]>>,
  webhooks: WebhookSubscription[],
  setWebhooks: React.Dispatch<React.SetStateAction<WebhookSubscription[]>>,
  onLoad: () => Promise<void>,
  onTabChange: (tab: TabType) => void,
}) {
  const email = typeof me.email === "string" ? me.email : ""
  const displayName = email.includes("@") ? email.split("@")[0] : email
  return (
    <AnimatePresence mode="wait">
      {activeTab === 'general' && (
        <motion.div 
          key="general"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-10"
        >
          <ProfileHeader
            name={displayName}
            email={email}
            avatarUrl={null}
            createdAt={null}
            onQuickApis={() => onTabChange("apis")}
          />
          <ProfilePanel
            title="Dados"
            subtitle="Informação carregada do backend"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-(--fg-color)/10 bg-background/30 p-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">Email</div>
                <div className="mt-1 text-sm font-mono text-(--fg-color) break-all">{email || "-"}</div>
              </div>
              <div className="rounded-2xl border border-(--fg-color)/10 bg-background/30 p-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">Role</div>
                <div className="mt-1 text-sm font-mono text-(--fg-color)">{me.role ?? "-"}</div>
              </div>
              <div className="rounded-2xl border border-(--fg-color)/10 bg-background/30 p-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">Telefone</div>
                <div className="mt-1 text-sm font-mono text-(--fg-color)">{me.phone ?? "-"}</div>
              </div>
              <div className="rounded-2xl border border-(--fg-color)/10 bg-background/30 p-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">ID</div>
                <div className="mt-1 text-sm font-mono text-(--fg-color)">{String(me.id)}</div>
              </div>
            </div>
          </ProfilePanel>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div 
          key="security"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-10"
        >
          <ProfilePanel
            title="Recuperação de Password"
            subtitle="Envia um link por email (fluxo real do backend)"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-xs font-mono text-(--fg-color)/70 break-all">
                {email || "-"}
              </div>
              <button
                type="button"
                onClick={() => void AuthService.forgotPassword(email)}
                disabled={!email}
                className="h-12 px-6 rounded-2xl bg-(--primary-accent) text-white font-bold uppercase tracking-widest border border-white/10 disabled:opacity-30"
              >
                Enviar Email
              </button>
            </div>
          </ProfilePanel>
        </motion.div>
      )}

      {activeTab === 'apis' && (
        <motion.div 
          key="apis"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-10"
        >
          <IntegrationsPanel isMock={false} items={integrations} setItems={setIntegrations} />
          <WebhookSubscriptionsPanel
            items={webhooks}
            setItems={setWebhooks}
            onReload={onLoad}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function WebhookSubscriptionsPanel({
  items,
  setItems,
  onReload,
}: {
  items: WebhookSubscription[]
  setItems: React.Dispatch<React.SetStateAction<WebhookSubscription[]>>
  onReload: () => Promise<void>
}) {
  const [targetUrl, setTargetUrl] = useState("")
  const [subscribedEvents, setSubscribedEvents] = useState("booking.created, booking.status.updated")
  const [isBusy, setIsBusy] = useState(false)

  const create = async () => {
    const events = subscribedEvents
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    if (!targetUrl.trim() || events.length === 0) return

    setIsBusy(true)
    try {
      const created = await SyncService.createWebhook({ targetUrl: targetUrl.trim(), subscribedEvents: events })
      await navigator.clipboard.writeText(created.secret)
      notify.success("Secret copiado para o clipboard.")
      setTargetUrl("")
      await onReload()
    } catch {
      notify.error("Falha ao criar webhook.")
    } finally {
      setIsBusy(false)
    }
  }

  const toggle = async (id: number) => {
    setIsBusy(true)
    try {
      await SyncService.toggleWebhook(id)
      setItems((prev) => prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w)))
    } finally {
      setIsBusy(false)
    }
  }

  const remove = async (id: number) => {
    setIsBusy(true)
    try {
      await SyncService.deleteWebhook(id)
      setItems((prev) => prev.filter((w) => w.id !== id))
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <ProfilePanel
      title="Webhooks"
      subtitle="Recebe eventos do sistema no teu endpoint"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">Target URL</div>
            <input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/webhooks/nexus"
              className="h-12 w-full rounded-2xl border border-(--fg-color)/20 bg-background/50 px-4 text-sm font-mono text-(--fg-color) outline-none focus:ring-2 focus:ring-(--primary-accent)"
            />
          </div>
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">Eventos (CSV)</div>
            <input
              value={subscribedEvents}
              onChange={(e) => setSubscribedEvents(e.target.value)}
              className="h-12 w-full rounded-2xl border border-(--fg-color)/20 bg-background/50 px-4 text-sm font-mono text-(--fg-color) outline-none focus:ring-2 focus:ring-(--primary-accent)"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void create()}
            disabled={isBusy || !targetUrl.trim()}
            className="h-12 px-6 rounded-2xl bg-(--primary-accent) text-white font-bold uppercase tracking-widest border border-white/10 disabled:opacity-30"
          >
            Criar
          </button>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-xs font-mono text-(--fg-color)/50">Sem webhooks configurados.</div>
          ) : (
            items.map((w) => (
              <div
                key={w.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-(--fg-color)/10 bg-background/30 p-4"
              >
                <div className="min-w-0">
                  <div className="text-xs font-mono text-(--fg-color) break-all">{w.targetUrl}</div>
                  <div className="mt-1 text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50 break-all">
                    {w.subscribedEvents}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void toggle(w.id)}
                    disabled={isBusy}
                    className="h-10 px-4 rounded-xl border border-(--fg-color)/20 bg-(--fg-color)/5 text-(--fg-color) text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                  >
                    {w.isActive ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(w.id)}
                    disabled={isBusy}
                    className="h-10 px-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ProfilePanel>
  )
}
