"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, KeyRound, Calendar } from "lucide-react"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { BoingText } from "@/components/BoingText"
import { motion } from "framer-motion"
/* Reverted to regular img tag due to Next.js domain config requirements for external API avatars */

/**
 * Propriedades do cabeçalho de perfil.
 */
interface ProfileHeaderProps {
  /** Nome do utilizador */
  name: string
  /** Email do utilizador */
  email: string
  /** URL da imagem de perfil (opcional) */
  avatarUrl?: string | null
  /** Data de criação da conta em formato ISO string */
  createdAt: string
  /** Função a executar ao clicar no botão de acesso rápido às APIs (opcional) */
  onQuickApis?: () => void
}

/**
 * @component ProfileHeader
 * @description Apresenta a informação principal do utilizador (foto, nome, email e data de registo) 
 * e fornece ações de acesso rápido (API Tokens, Painel Geral).
 * 
 * @reference Clean Code - Composição sobre herança (Composition over Inheritance):
 * Este componente constrói-se compondo componentes mais pequenos (`ProfileHeaderActions`, `ProfileAvatar`, `ProfileUserInfo`).
 */
export function ProfileHeader({
  name,
  email,
  avatarUrl,
  createdAt,
  onQuickApis,
}: ProfileHeaderProps) {
  return (
    <ProfilePanel
      title="Conta"
      subtitle="Gestão de identidade e acessos"
      action={<ProfileHeaderActions onQuickApis={onQuickApis} />}
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <ProfileAvatar avatarUrl={avatarUrl} name={name} />
        <ProfileUserInfo name={name} email={email} createdAt={createdAt} />
      </div>
    </ProfilePanel>
  )
}

/**
 * @component ProfileHeaderActions
 * @description Subcomponente para renderizar os botões de ação do cabeçalho de perfil.
 */
function ProfileHeaderActions({ onQuickApis }: { onQuickApis?: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="border-(--fg-color)/20 rounded-full bg-(--fg-color)/5 text-(--fg-color) hover:bg-(--fg-color)/10 hover:text-(--primary-accent)"
        onClick={onQuickApis}
      >
        <KeyRound className="w-4 h-4 mr-1" />
        Tokens de API
      </Button>
      <a href="/dashboard">
        <Button 
          variant="default" 
          size="sm" 
          className="bg-(--fg-color) rounded-full text-(--bg-color) hover:bg-(--primary-accent) hover:text-white transition-colors shadow-none"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Painel Geral
        </Button>
      </a>
    </div>
  )
}

/**
 * @component ProfileAvatar
 * @description Subcomponente responsável por renderizar o avatar do utilizador com animações fluidas.
 */
function ProfileAvatar({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, rotate: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="relative group cursor-pointer"
    >
      <div className="absolute -inset-2 bg-(--primary-accent) rounded-full blur-xl opacity-20 group-hover:opacity-60 transition duration-500"></div>
      <div className="relative h-28 w-28 rounded-full overflow-hidden border border-(--fg-color)/20 bg-(--fg-color)/5 shrink-0 shadow-lg shadow-(--primary-accent)/10">
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={avatarUrl} 
            alt={name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] font-mono text-(--fg-color)/40 uppercase tracking-tighter">
            S/ Foto
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * @component ProfileUserInfo
 * @description Subcomponente que exibe as informações textuais do utilizador (nome, email, data de adesão).
 */
function ProfileUserInfo({ name, email, createdAt }: { name: string; email: string; createdAt: string }) {
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-PT', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="flex-1 text-center md:text-left space-y-2">
      <div className="text-4xl font-black text-(--fg-color) font-serif tracking-tight pr-4">
        <BoingText
          text={name}
          color="var(--fg-color)"
          activeColor="var(--primary-accent)"
          stagger={0.03}
        />
      </div>
      <p className="text-lg font-mono text-(--fg-color)/60 lowercase">
        {email}
      </p>
      <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
        <div className="px-3 py-1 rounded-full border border-(--fg-color)/10 bg-(--fg-color)/5 flex items-center gap-2">
          <Calendar className="w-3 h-3 text-(--primary-accent)" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/70">
            Membro desde {formattedDate}
          </span>
        </div>
      </div>
    </div>
  )
}
