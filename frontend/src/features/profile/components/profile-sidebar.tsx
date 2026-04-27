"use client"

import React from "react"
import { BoingText } from "@/components/effects/BoingText"
import { User, Shield, Key, ArrowLeft } from "lucide-react"

import {
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

export type TabType = 'general' | 'security' | 'apis'

interface ProfileSidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function ProfileSidebar({ activeTab, onTabChange }: ProfileSidebarProps) {
  return (
    <Sidebar className="border-r border-foreground/10 bg-background/80 backdrop-blur-md shrink-0" collapsible="none">
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
          <p className="text-sm font-mono opacity-60 text-foreground uppercase tracking-widest text-[10px]">
            Gerir info & conta.
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarMenu className="space-y-2">
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={activeTab === 'general'} 
                onClick={() => onTabChange('general')}
                className={`h-12 rounded-xl text-foreground font-semibold px-4 ${activeTab === 'general' ? 'bg-foreground/5 shadow-sm' : 'hover:bg-foreground/5'}`}
              >
                <User className="mr-2 h-5 w-5 opacity-70" />
                Geral
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={activeTab === 'security'} 
                onClick={() => onTabChange('security')}
                className={`h-12 rounded-xl text-foreground font-semibold px-4 ${activeTab === 'security' ? 'bg-foreground/5 shadow-sm' : 'hover:bg-foreground/5'}`}
              >
                <Shield className="mr-2 h-5 w-5 opacity-70" />
                Segurança
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={activeTab === 'apis'} 
                onClick={() => onTabChange('apis')}
                className={`h-12 rounded-xl text-foreground font-semibold px-4 ${activeTab === 'apis' ? 'bg-foreground/5 shadow-sm' : 'hover:bg-foreground/5'}`}
              >
                <Key className="mr-2 h-5 w-5 opacity-70" />
                API & Webhooks
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
  )
}
