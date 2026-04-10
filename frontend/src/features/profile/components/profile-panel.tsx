"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

/**
 * Propriedades para o componente ProfilePanel.
 */
interface ProfilePanelProps {
  /** O título principal do painel */
  title: string
  /** O subtítulo descritivo (opcional) */
  subtitle?: string
  /** Elementos de ação, tipicamente botões, renderizados no cabeçalho (opcional) */
  action?: React.ReactNode
  /** Classes CSS adicionais para customização (opcional) */
  className?: string
  /** O conteúdo interno do painel */
  children: React.ReactNode
}

/**
 * @component ProfilePanel
 * @description Componente de contentor que padroniza o design dos cartões (painéis) no perfil do utilizador.
 * Utiliza o Framer Motion para micro-interações (animação ao passar o rato).
 * 
 * @reference Clean Code - "Single Responsibility Principle" (SRP): 
 * O painel apenas trata da apresentação do contentor, delegando o conteúdo específico aos seus `children`.
 * 
 * @param {ProfilePanelProps} props - Propriedades do componente.
 * @returns {JSX.Element} O componente renderizado.
 */
export function ProfilePanel({
  title,
  subtitle,
  action,
  className,
  children,
}: ProfilePanelProps) {
  return (
    <motion.section
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative rounded-3xl border border-[var(--fg-color)]/10 bg-[var(--panel-bg)]/80 backdrop-blur-xl p-2",
        "shadow-xl shadow-[var(--fg-color)]/5",
        className,
      )}
    >
      <ProfilePanelHeader title={title} subtitle={subtitle} action={action} />
      <div className="p-6">
        {children}
      </div>
    </motion.section>
  )
}

/**
 * @component ProfilePanelHeader
 * @description Subcomponente que encapsula a lógica de apresentação do cabeçalho do painel.
 * Extraído para melhorar a legibilidade e separar a estrutura do cabeçalho do corpo principal.
 */
function ProfilePanelHeader({
  title,
  subtitle,
  action,
}: Omit<ProfilePanelProps, "children" | "className">) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[var(--fg-color)]/10">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-[var(--primary-accent)]" />
          <h2 className="text-2xl font-black italic tracking-tight text-[var(--fg-color)] font-serif uppercase">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--fg-color)]/60 pl-8">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3 pl-8 md:pl-0">
          {action}
        </div>
      )}
    </div>
  )
}
