"use client"

import React, { useState, useCallback, useEffect } from "react"
import { ProfileHeader } from "@/features/profile/components/profile-header"
import { EditProfileForm } from "@/features/profile/components/edit-profile-form"
import { ChangePasswordForm } from "@/features/profile/components/change-password-form"
import { IntegrationsPanel } from "@/features/profile/components/integrations-panel"
import { UserService } from "@/services/user.service"
import type { UserProfile } from "@/types/user"
import type { ExternalIntegrationDTO } from "@/types/integrations"
import { IntegrationsService } from "@/services/integrations.service"
import { PixelBlast } from "@/components/ui/PixelBlast"
import { motion, AnimatePresence } from "framer-motion"
import { BoingText } from "@/components/BoingText"
import { User, Shield, Key, ArrowLeft } from "lucide-react"

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/layout/sidebar"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

const MOCK_PROFILE: UserProfile = {
  id: 20,
  name: "Brandon Correia",
  email: "brandon-correia4@hotmail.com",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=brandon-correia4@hotmail.com",
  createdAt: "2026-02-15T10:30:00Z",
}

const MOCK_INTEGRATIONS: ExternalIntegrationDTO[] = [
  { id: 1, providerName: "AIRBNB", apiKeyMasked: "sk_test_****LeZ8", active: true },
  { id: 2, providerName: "BOOKING", apiKeyMasked: "bk_live_****1234", active: false },
]

export default function ProfilePage() {
  const [me, setMe] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [integrations, setIntegrations] = useState<ExternalIntegrationDTO[]>([])
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'apis'>('profile')
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
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-24 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[var(--primary-accent)]" 
              animate={{ x: ["-100%", "100%"] }} 
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Nexus ID</span>
        </div>
      </div>
    )
  }

  if (!me) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 italic">Sessão expirada. Redirecionando...</div>
      </div>
    )
  }
  
  // Custom CSS variables to cascade down to components based on theme
  const CustomStyle = {
    "--bg-color": isDark ? "#0A0D14" : "#F0ECD9",
    "--fg-color": isDark ? "#E6E2D1" : "#0D0D0D",
    "--panel-bg": isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)",
    "--primary-accent": "#e2621cff"
  } as React.CSSProperties

  return (
    <div style={CustomStyle} className="min-h-screen relative overflow-x-hidden transition-colors duration-500 ease-in-out">
      {/* BACKGROUND INTERATIVO COM COR DINÂMICA BASEADA NO TEMA */}
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

      {/* USO DO SIDEBAR DA ESTRUTURA GLOBAL */}
      <SidebarProvider className="relative z-10 w-full min-h-screen bg-transparent">
        <div className="flex w-full">
          <Sidebar className="border-r border-foreground/10 bg-background/80 backdrop-blur-md flex-shrink-0" collapsible="none">
            <SidebarHeader className="pt-12 px-6 pb-6">
              <div className="space-y-1 pl-2">
                <h1 className="text-3xl font-black font-serif tracking-tight text-foreground">
                  <BoingText
                    text="Conta"
                    color="var(--fg-color)"
                    activeColor="var(--primary-accent)"
                    stagger={0.06}
                  />
                </h1>
                <p className="text-sm font-mono opacity-60 text-foreground uppercase tracking-widest text-[10px]">Gerir info & conta.</p>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-4">
              <SidebarGroup>
                <SidebarMenu className="space-y-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === 'profile'} 
                      onClick={() => setActiveTab('profile')}
                      className={`h-12 rounded-xl text-foreground font-semibold px-4 ${activeTab === 'profile' ? 'bg-foreground/5 shadow-sm' : 'hover:bg-foreground/5'}`}
                    >
                      <User className="mr-2 h-5 w-5 opacity-70" />
                      Perfil
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === 'security'} 
                      onClick={() => setActiveTab('security')}
                      className={`h-12 rounded-xl text-foreground font-semibold px-4 ${activeTab === 'security' ? 'bg-foreground/5 shadow-sm' : 'hover:bg-foreground/5'}`}
                    >
                      <Shield className="mr-2 h-5 w-5 opacity-70" />
                      Segurança
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === 'apis'} 
                      onClick={() => setActiveTab('apis')}
                      className={`h-12 rounded-xl text-foreground font-semibold px-4 ${activeTab === 'apis' ? 'bg-foreground/5 shadow-sm' : 'hover:bg-foreground/5'}`}
                    >
                      <Key className="mr-2 h-5 w-5 opacity-70" />
                      Integrações (APIs)
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-6 space-y-4">
              <div className="flex items-center justify-between px-4">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Tema</span>
                <AnimatedThemeToggler className="w-10 h-10 rounded-full border border-foreground/10 bg-background flex items-center justify-center hover:bg-foreground/5 transition-colors text-foreground" />
              </div>
              <a href="/dashboard">
                <SidebarMenuButton className="h-12 w-full rounded-xl text-foreground font-bold hover:bg-foreground/5 px-4 justify-start">
                  <ArrowLeft className="mr-2 h-5 w-5 opacity-70" />
                  Sair para o Painel
                </SidebarMenuButton>
              </a>
            </SidebarFooter>
          </Sidebar>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="flex-1 w-full p-8 lg:p-14 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
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
                      onQuickApis={() => setActiveTab('apis')}
                    />
                    <EditProfileForm
                      defaultName={me.name}
                      onSubmit={async ({ name, file }) => {
                        if (isMock) {
                          setMe((prev) => {
                            if (!prev) return prev
                            return { ...prev, name, avatarUrl: file ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(prev.email)}&v=${Date.now()}` : prev.avatarUrl }
                          })
                          return
                        }
                        if (name && name !== me.name) await UserService.updateName(name)
                        if (file) await UserService.uploadAvatar(file)
                        await load()
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
            </div>
          </main>
        </div>
      </SidebarProvider>

      <style jsx global>{`
        body {
          background-color: var(--bg-color, #F0ECD9) !important;
        }
      `}</style>
    </div>
  )
}

