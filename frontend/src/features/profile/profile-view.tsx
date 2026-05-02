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
import { profileTokens } from "@/features/profile/tokens"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { AuthService } from "@/services/auth.service"
import { SyncService } from "@/services/sync.service"
import type { WebhookSubscription } from "@/types/sync"
import { ChangePasswordForm } from "@/features/profile/components/change-password-form"
import { SignedIn, SignedOut, UserProfile as ClerkUserProfile } from "@clerk/nextjs"
import { isClerkConfigured } from "@/features/auth/strategies/use-identity-provider"
import { useClerkIdentityProvider } from "@/features/auth/strategies/clerk/use-clerk-identity-provider"
import { GitBranch, Globe, Users } from "lucide-react"

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

function ProfileContactUpdatePanel({ me, onReload }: { me: UserProfile; onReload: () => Promise<void> }) {
  const [email, setEmail] = useState(me.email ?? "")
  const [phone, setPhone] = useState(me.phone ?? "")
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    setEmail(me.email ?? "")
    setPhone(me.phone ?? "")
  }, [me.email, me.phone])

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  const isValidPhone = (value: string) => /^[+0-9][0-9\s-]{6,20}$/.test(value.trim())

  const canSubmit =
    (email.trim() === (me.email ?? "").trim() && phone.trim() === (me.phone ?? "").trim()) ? false : true

  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = phone.trim()

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      notify.error(profileTokens.copy.view.contactInvalidEmail)
      return
    }
    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      notify.error(profileTokens.copy.view.contactInvalidPhone)
      return
    }

    setIsBusy(true)
    try {
      const res = await UserService.patchMe({
        email: normalizedEmail || undefined,
        phone: normalizedPhone || undefined,
      })
      if (res.session) AuthService.applySession(res.session)
      notify.success(profileTokens.copy.view.contactSaveOk)
      await onReload()
    } catch {
      notify.error(profileTokens.copy.view.contactSaveError)
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <ProfilePanel title={profileTokens.copy.view.panelContactTitle} subtitle={profileTokens.copy.view.panelContactSubtitle}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">{profileTokens.copy.view.contactEmailLabel}</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-2xl border border-(--fg-color)/20 bg-background/50 px-4 text-sm font-mono text-(--fg-color) outline-none focus:ring-2 focus:ring-(--primary-accent)"
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">{profileTokens.copy.view.contactPhoneLabel}</div>
            <input
              value={phone ?? ""}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 w-full rounded-2xl border border-(--fg-color)/20 bg-background/50 px-4 text-sm font-mono text-(--fg-color) outline-none focus:ring-2 focus:ring-(--primary-accent)"
              placeholder="+351 9xx xxx xxx"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={isBusy || !canSubmit}
            className="h-12 px-6 rounded-2xl bg-(--primary-accent) text-white font-bold uppercase tracking-widest border border-white/10 disabled:opacity-30"
          >
            {profileTokens.copy.view.contactSaveBtn}
          </button>
        </div>
      </div>
    </ProfilePanel>
  )
}

function ClerkLinkedAccountsPanel() {
  const enabled = isClerkConfigured()
  const idp = useClerkIdentityProvider()
  const canStart = enabled && idp.isAvailable

  if (!enabled) {
    return (
      <ProfilePanel title={profileTokens.copy.clerk.title} subtitle={profileTokens.copy.clerk.subtitle}>
        <div className="text-xs font-mono text-(--fg-color)/70">{profileTokens.copy.clerk.notConfigured}</div>
      </ProfilePanel>
    )
  }

  return (
    <ProfilePanel title={profileTokens.copy.clerk.title} subtitle={profileTokens.copy.clerk.subtitle}>
      <SignedIn>
        <div className="rounded-2xl border border-(--fg-color)/10 bg-background/30 p-2">
          <ClerkUserProfile routing="hash" />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="space-y-4">
          <div className="text-xs font-mono text-(--fg-color)/70">{profileTokens.copy.clerk.signedOutHint}</div>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              disabled={!canStart}
              onClick={() => void idp.startOAuth("google", "/clerk/callback?next=/profile")}
              className="h-12 rounded-2xl border border-(--fg-color)/20 bg-background/50 px-4 text-xs font-bold uppercase tracking-widest text-(--fg-color) disabled:opacity-30"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Globe className="h-4 w-4" />
                Google
              </span>
            </button>
            <button
              type="button"
              disabled={!canStart}
              onClick={() => void idp.startOAuth("github", "/clerk/callback?next=/profile")}
              className="h-12 rounded-2xl border border-(--fg-color)/20 bg-background/50 px-4 text-xs font-bold uppercase tracking-widest text-(--fg-color) disabled:opacity-30"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <GitBranch className="h-4 w-4" />
                GitHub
              </span>
            </button>
            <button
              type="button"
              disabled={!canStart}
              onClick={() => void idp.startOAuth("facebook", "/clerk/callback?next=/profile")}
              className="h-12 rounded-2xl border border-(--fg-color)/20 bg-background/50 px-4 text-xs font-bold uppercase tracking-widest text-(--fg-color) disabled:opacity-30"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Facebook
              </span>
            </button>
          </div>
        </div>
      </SignedOut>
    </ProfilePanel>
  )
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
    "--bg-color": isDark ? profileTokens.ui.theme.bgDark : profileTokens.ui.theme.bgLight,
    "--fg-color": isDark ? profileTokens.ui.theme.fgDark : profileTokens.ui.theme.fgLight,
    "--panel-bg": isDark ? profileTokens.ui.theme.panelBgDark : profileTokens.ui.theme.panelBgLight,
    "--primary-accent": profileTokens.ui.theme.primaryAccent,
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
        color={isDark ? profileTokens.ui.theme.pixelBlastDarkColor : "var(--primary-accent)"}
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
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">{profileTokens.copy.view.loadingBrand}</span>
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
      ? profileTokens.copy.view.errorSessionExpiredTitle
      : error === "network"
        ? profileTokens.copy.view.errorNetworkTitle
        : profileTokens.copy.view.errorGenericTitle

  const subtitle =
    error === "unauthorized"
      ? profileTokens.copy.view.errorSessionExpiredSubtitle
      : error === "network"
        ? profileTokens.copy.view.errorNetworkSubtitle
        : info.status
          ? `${profileTokens.copy.view.errorHttpPrefix}${info.status}${info.message ? `${profileTokens.copy.view.errorJoiner}${info.message}` : ""}`
          : profileTokens.copy.view.errorGenericSubtitle

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
                {profileTokens.copy.view.btnBack}
              </button>
              <button
                type="button"
                onClick={onLogin}
                className="h-12 flex-1 rounded-2xl bg-(--primary-accent) text-white font-bold uppercase tracking-widest text-xs border border-white/10"
              >
                {profileTokens.copy.view.btnGoToLogin}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void onRetry()}
                className="h-12 flex-1 rounded-2xl border border-foreground/20 bg-foreground/5 font-bold uppercase tracking-widest text-xs"
              >
                {profileTokens.copy.view.btnRetry}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="h-12 flex-1 rounded-2xl bg-(--primary-accent) text-white font-bold uppercase tracking-widest text-xs border border-white/10"
              >
                {profileTokens.copy.view.btnBack}
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
            title={profileTokens.copy.view.panelDataTitle}
            subtitle={profileTokens.copy.view.panelDataSubtitle}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-(--fg-color)/10 bg-background/30 p-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">{profileTokens.copy.view.fieldEmail}</div>
                <div className="mt-1 text-sm font-mono text-(--fg-color) break-all">{email || profileTokens.copy.view.dash}</div>
              </div>
              <div className="rounded-2xl border border-(--fg-color)/10 bg-background/30 p-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">{profileTokens.copy.view.fieldRole}</div>
                <div className="mt-1 text-sm font-mono text-(--fg-color)">{me.role ?? profileTokens.copy.view.dash}</div>
              </div>
              <div className="rounded-2xl border border-(--fg-color)/10 bg-background/30 p-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">{profileTokens.copy.view.fieldPhone}</div>
                <div className="mt-1 text-sm font-mono text-(--fg-color)">{me.phone ?? profileTokens.copy.view.dash}</div>
              </div>
              <div className="rounded-2xl border border-(--fg-color)/10 bg-background/30 p-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">{profileTokens.copy.view.fieldId}</div>
                <div className="mt-1 text-sm font-mono text-(--fg-color)">{String(me.id)}</div>
              </div>
            </div>
          </ProfilePanel>

          <ProfileContactUpdatePanel me={me} onReload={onLoad} />
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
            title={profileTokens.copy.view.panelRecoveryTitle}
            subtitle={profileTokens.copy.view.panelRecoverySubtitle}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-xs font-mono text-(--fg-color)/70 break-all">
                {email || profileTokens.copy.view.dash}
              </div>
              <button
                type="button"
                onClick={() => void AuthService.forgotPassword(email)}
                disabled={!email}
                className="h-12 px-6 rounded-2xl bg-(--primary-accent) text-white font-bold uppercase tracking-widest border border-white/10 disabled:opacity-30"
              >
                {profileTokens.copy.view.btnSendEmail}
              </button>
            </div>
          </ProfilePanel>

          <ChangePasswordForm
            onSubmit={async (payload) => {
              const session = await UserService.changePassword(payload)
              if (session) AuthService.applySession(session)
              await onLoad()
            }}
          />

          <ClerkLinkedAccountsPanel />
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
  const [subscribedEvents, setSubscribedEvents] = useState<string>(profileTokens.copy.webhooksPanel.defaultEvents)
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
      notify.success(profileTokens.copy.webhooks.secretCopied)
      setTargetUrl("")
      await onReload()
    } catch {
      notify.error(profileTokens.copy.webhooks.createFailed)
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
      title={profileTokens.copy.webhooksPanel.title}
      subtitle={profileTokens.copy.webhooksPanel.subtitle}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">{profileTokens.copy.webhooksPanel.targetUrlLabel}</div>
            <input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder={profileTokens.copy.webhooksPanel.targetUrlPlaceholder}
              className="h-12 w-full rounded-2xl border border-(--fg-color)/20 bg-background/50 px-4 text-sm font-mono text-(--fg-color) outline-none focus:ring-2 focus:ring-(--primary-accent)"
            />
          </div>
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/50">{profileTokens.copy.webhooksPanel.eventsLabel}</div>
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
            {profileTokens.copy.webhooksPanel.btnCreate}
          </button>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-xs font-mono text-(--fg-color)/50">{profileTokens.copy.webhooksPanel.emptyState}</div>
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
                    {w.isActive ? profileTokens.copy.webhooksPanel.btnDisable : profileTokens.copy.webhooksPanel.btnEnable}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(w.id)}
                    disabled={isBusy}
                    className="h-10 px-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                  >
                    {profileTokens.copy.webhooksPanel.btnRemove}
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
