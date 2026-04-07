"use client"

import React, { useState } from "react"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { Button } from "@/components/ui/button"
import { Github, Mail, AlertCircle, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

/**
 * Interface para os dados de uma ligação social
 */
export interface SocialConnection {
  /** O provedor de autenticação (ex: 'google', 'github') */
  provider: 'google' | 'github'
  /** O email ou nome de utilizador associado à conta */
  email?: string
  /** Indica se a conta está vinculada */
  connected: boolean
}

/**
 * Propriedades para o componente SocialConnectionsPanel
 */
interface SocialConnectionsPanelProps {
  /** Lista de conexões sociais atuais */
  connections: SocialConnection[]
  /** Função para iniciar o fluxo de vinculação com um provedor */
  onConnect: (provider: 'google' | 'github') => void | Promise<void>
  /** Função para desvincular um provedor */
  onDisconnect: (provider: 'google' | 'github') => void | Promise<void>
}

/**
 * @component SocialConnectionsPanel
 * @description Apresenta as opções para vincular a conta do utilizador a provedores de autenticação externos (Google, GitHub).
 */
export function SocialConnectionsPanel({
  connections,
  onConnect,
  onDisconnect,
}: SocialConnectionsPanelProps) {
  
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null)

  const handleConnect = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider)
    try {
      await onConnect(provider)
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleDisconnect = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider)
    try {
      await onDisconnect(provider)
    } finally {
      setLoadingProvider(null)
    }
  }

  const getProviderInfo = (provider: 'google' | 'github') => {
    switch (provider) {
      case 'google':
        return {
          name: 'Google',
          icon: <Mail className="w-5 h-5" />,
          color: 'bg-red-500/10 text-red-500 border-red-500/20',
          hoverColor: 'hover:bg-red-500 hover:text-white',
          bgColor: 'bg-white text-black hover:bg-gray-100',
        }
      case 'github':
        return {
          name: 'GitHub',
          icon: <Github className="w-5 h-5" />,
          color: 'bg-slate-800/10 text-slate-800 border-slate-800/20 dark:bg-slate-200/10 dark:text-slate-200 dark:border-slate-200/20',
          hoverColor: 'hover:bg-slate-800 hover:text-white dark:hover:bg-slate-200 dark:hover:text-black',
          bgColor: 'bg-[#24292F] text-white hover:bg-[#24292F]/90 dark:bg-white dark:text-black dark:hover:bg-gray-200',
        }
    }
  }

  return (
    <ProfilePanel
      title="Contas Vinculadas"
      subtitle="Faz login rapidamente utilizando os teus serviços favoritos"
    >
      <div className="space-y-4">
        {/* Aviso de Segurança */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-(--fg-color)/5 border border-(--fg-color)/10">
          <AlertCircle className="w-5 h-5 text-(--primary-accent) shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-(--fg-color)/70 leading-relaxed">
            Vincular uma conta permite que faças login no Nexus Estates sem precisares de inserir a tua password.
            Apenas teremos acesso ao teu email e nome público.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 pt-4">
          {(['google', 'github'] as const).map((provider) => {
            const connection = connections.find(c => c.provider === provider) || { provider, connected: false }
            const info = getProviderInfo(provider)
            const isBusy = loadingProvider === provider
            
            return (
              <motion.div
                key={provider}
                whileHover={{ scale: 1.02 }}
                className="flex flex-col gap-4 p-5 rounded-3xl border border-(--fg-color)/10 bg-background/60 shadow-lg shadow-(--fg-color)/5"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${info.color}`}>
                    {info.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-(--fg-color)">
                      {info.name}
                    </h4>
                    {connection.connected ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-mono text-(--fg-color)/50 truncate max-w-[120px]">
                          {connection.email || 'Vinculado'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-(--fg-color)/40 mt-0.5">
                        Não vinculado
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  {connection.connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDisconnect(provider)}
                      disabled={isBusy || loadingProvider !== null}
                      className="w-full rounded-xl border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      {isBusy ? "A processar..." : "Desvincular"}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => void handleConnect(provider)}
                      disabled={isBusy || loadingProvider !== null}
                      className={`w-full rounded-xl font-bold tracking-wide shadow-none transition-colors ${info.bgColor}`}
                    >
                      {isBusy ? "A processar..." : `Conectar com ${info.name}`}
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </ProfilePanel>
  )
}
