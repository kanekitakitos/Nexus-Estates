"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ExternalLink, KeyRound, Calendar } from "lucide-react"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { BoingText } from "@/components/BoingText"
import { motion } from "framer-motion"

export function ProfileHeader({
  name,
  email,
  avatarUrl,
  createdAt,
  onQuickApis,
}: {
  name: string
  email: string
  avatarUrl?: string | null
  createdAt: string
  onQuickApis?: () => void
}) {
  return (
    <ProfilePanel
      title="Conta"
      subtitle="Gestão de identidade e acessos"
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--fg-color)]/20 rounded-full bg-[var(--fg-color)]/5 text-[var(--fg-color)] hover:bg-[var(--fg-color)]/10 hover:text-[var(--primary-accent)]"
            onClick={onQuickApis}
          >
            <KeyRound className="w-4 h-4 mr-1" />
            Tokens de API
          </Button>
          <a href="/dashboard">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-[var(--fg-color)] rounded-full text-[var(--bg-color)] hover:bg-[var(--primary-accent)] hover:text-white transition-colors shadow-none"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Painel Geral
            </Button>
          </a>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="relative group cursor-pointer"
        >
          <div className="absolute -inset-2 bg-[var(--primary-accent)] rounded-full blur-xl opacity-20 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative h-28 w-28 rounded-full overflow-hidden border border-[var(--fg-color)]/20 bg-[var(--fg-color)]/5 flex-shrink-0 shadow-lg shadow-[var(--primary-accent)]/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] font-mono text-[var(--fg-color)]/40 uppercase tracking-tighter">
                S/ Foto
              </div>
            )}
          </div>
        </motion.div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="text-4xl font-black text-[var(--fg-color)] font-serif tracking-tight pr-4">
            <BoingText
              text={name}
              color="var(--fg-color)"
              activeColor="var(--primary-accent)"
              stagger={0.03}
            />
          </div>
          <p className="text-lg font-mono text-[var(--fg-color)]/60 lowercase">
            {email}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            <div className="px-3 py-1 rounded-full border border-[var(--fg-color)]/10 bg-[var(--fg-color)]/5 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-[var(--primary-accent)]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg-color)]/70">
                Membro desde {new Date(createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ProfilePanel>
  )
}

