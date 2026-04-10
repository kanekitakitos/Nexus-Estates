"use client"

import React, { useState, useCallback, useEffect } from "react"
import { ProfileHeader } from "@/features/profile/components/profile-header"
import { EditProfileForm } from "@/features/profile/components/edit-profile-form"
import { ChangePasswordForm } from "@/features/profile/components/change-password-form"
import { IntegrationsPanel } from "@/features/profile/components/integrations-panel"
import { SocialConnectionsPanel, type SocialConnection } from "@/features/profile/components/social-connections-panel"
import { ProfileSidebar, type TabType } from "@/features/profile/components/profile-sidebar"
import { UserService } from "@/services/user.service"
import type { UserProfile } from "@/types/user"
import type { ExternalIntegrationDTO } from "@/types/integrations"
import { IntegrationsService } from "@/services/integrations.service"
import { PixelBlast } from "@/components/ui/PixelBlast"
import { motion, AnimatePresence } from "framer-motion"

import { SidebarProvider } from "@/components/ui/layout/sidebar"
import { toast } from "sonner"

const MOCK_PROFILE: UserProfile = {
  id: 20,
  name: "Brandon Correia",
  email: "brandon-correia4@hotmail.com",
  avatarUrl: null,
  createdAt: "2026-02-15T10:30:00Z",
}

const MOCK_INTEGRATIONS: ExternalIntegrationDTO[] = [
  { id: 1, providerName: "AIRBNB", apiKeyMasked: "sk_test_****LeZ8", active: true },
  { id: 2, providerName: "BOOKING", apiKeyMasked: "bk_live_****1234", active: false },
]

const MOCK_SOCIALS: SocialConnection[] = [
  { provider: "google", connected: false },
  { provider: "github", connected: true, email: "brandon-dev@github.com" },
]

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
  const [me, setMe] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [integrations, setIntegrations] = useState<ExternalIntegrationDTO[]>([])
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([])
  
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isDark, setIsDark] = useState(false)

  // Observa o Root do documento para verificar se a classe "dark" foi aplicada
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"))
    checkDark()
    
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    
    return () => observer.disconnect()
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await UserService.getMe()
      setMe(data)
      setIsMock(false)
      
      // Quando existir endpoint de conexões sociais reais, faz fetch aqui
      setSocialConnections([{ provider: "google", connected: false }, { provider: "github", connected: false }])

      try {
        const list = await IntegrationsService.list()
        setIntegrations(list)
      } catch {
        setIntegrations([])
      }
    } catch {
      setMe(MOCK_PROFILE)
      setIsMock(true)
      setIntegrations(MOCK_INTEGRATIONS)
      setSocialConnections(MOCK_SOCIALS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleConnectSocial = async (provider: 'google' | 'github') => {
    if (isMock) {
      toast.info(`Redirecionando para login do ${provider}...`)
      await new Promise(r => setTimeout(r, 1000))
      setSocialConnections(prev => prev.map(p => p.provider === provider ? { ...p, connected: true, email: `mock-${provider}@test.com` } : p))
      toast.success(`Conta ${provider} vinculada com sucesso!`)
      return
    }
    
    // Lógica real: redirecionar para endpoint OAuth do backend (Ex: /api/auth/google)
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/${provider}/connect`
  }

  const handleDisconnectSocial = async (provider: 'google' | 'github') => {
    if (isMock) {
      await new Promise(r => setTimeout(r, 600))
      setSocialConnections(prev => prev.map(p => p.provider === provider ? { ...p, connected: false, email: undefined } : p))
      toast.success(`Conta ${provider} desvinculada.`)
      return
    }
    
    // Lógica real de desvincular
    try {
      // await UserService.disconnectSocial(provider)
      toast.success(`Conta ${provider} desvinculada com sucesso!`)
      await load()
    } catch {
      toast.error(`Erro ao desvincular conta do ${provider}.`)
    }
  }

  if (loading) {
    return <ProfileLoadingState />
  }

  if (!me) {
    return <ProfileErrorState />
  }
  
  // Custom CSS variables to cascade down to components based on theme
  const CustomStyle = {
    "--bg-color": isDark ? "#0A0D14" : "#F0ECD9",
    "--fg-color": isDark ? "#E6E2D1" : "#0D0D0D",
    "--panel-bg": isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)",
    "--primary-accent": "#e2621cff"
  } as React.CSSProperties

  return (
    <div style={CustomStyle} className="min-h-screen relative overflow-x-hidden transition-colors duration-500 ease-in-out bg-(--bg-color)">
      <ProfileBackground isDark={isDark} />

      <SidebarProvider className="relative z-10 w-full min-h-screen bg-transparent">
        <div className="flex w-full">
          <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="flex-1 w-full p-8 lg:p-14 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <ProfileContent 
                activeTab={activeTab} 
                me={me} 
                isMock={isMock} 
                integrations={integrations} 
                socialConnections={socialConnections}
                setMe={setMe}
                setIntegrations={setIntegrations}
                onLoad={load}
                onTabChange={setActiveTab}
                onConnectSocial={handleConnectSocial}
                onDisconnectSocial={handleDisconnectSocial}
              />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
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
function ProfileErrorState() {
  return (
    <div className="h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 italic">Sessão expirada. Redirecionando...</div>
    </div>
  )
}

/**
 * Subcomponente que Gere a Transição entre Painéis de Perfil
 */
function ProfileContent({
  activeTab,
  me,
  isMock,
  integrations,
  socialConnections,
  setMe,
  setIntegrations,
  onLoad,
  onTabChange,
  onConnectSocial,
  onDisconnectSocial
}: {
  activeTab: TabType,
  me: UserProfile,
  isMock: boolean,
  integrations: ExternalIntegrationDTO[],
  socialConnections: SocialConnection[],
  setMe: React.Dispatch<React.SetStateAction<UserProfile | null>>,
  setIntegrations: React.Dispatch<React.SetStateAction<ExternalIntegrationDTO[]>>,
  onLoad: () => Promise<void>,
  onTabChange: (tab: TabType) => void,
  onConnectSocial: (provider: 'google' | 'github') => Promise<void>,
  onDisconnectSocial: (provider: 'google' | 'github') => Promise<void>
}) {
  return (
    <AnimatePresence mode="wait">
      {activeTab === 'profile' && (
        <motion.div 
          key="profile"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-10"
        >
          <ProfileHeader
            name={me.name}
            email={me.email}
            avatarUrl={me.avatarUrl}
            createdAt={me.createdAt}
            onQuickApis={() => onTabChange('apis')}
          />
          <EditProfileForm
            defaultName={me.name}
            onSubmit={async ({ name, file }) => {
              if (isMock) {
                setMe((prev) => {
                  if (!prev) return prev
                  return { ...prev, name } 
                })
                return
              }
              if (name && name !== me.name) await UserService.updateName(name)
              if (file) await UserService.uploadAvatar(file)
              await onLoad()
            }}
          />
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div 
          key="security"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <ChangePasswordForm onSubmit={async (payload) => { if (!isMock) await UserService.changePassword(payload) }} />
        </motion.div>
      )}

      {activeTab === 'socials' && (
        <motion.div 
          key="socials"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <SocialConnectionsPanel
            connections={socialConnections}
            onConnect={onConnectSocial}
            onDisconnect={onDisconnectSocial}
          />
        </motion.div>
      )}

      {activeTab === 'apis' && (
        <motion.div 
          key="apis"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <IntegrationsPanel isMock={isMock} items={integrations} setItems={setIntegrations} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
