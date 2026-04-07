"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { KeyRound } from "lucide-react"

/**
 * Propriedades do componente IntegrationsCta.
 */
interface IntegrationsCtaProps {
  /** Função de callback invocada ao clicar no botão de configuração (opcional) */
  onQuick?: () => void
}

/**
 * @component IntegrationsCta
 * @description Componente de Call-To-Action (CTA) rápido para configuração de integrações.
 * 
 * @reference Clean Code - "DRY" (Don't Repeat Yourself):
 * Reutiliza o `ProfilePanel` para manter consistência visual com os restantes painéis do perfil,
 * oferecendo apenas uma mensagem sucinta e uma ação direta.
 */
export function IntegrationsCta({ onQuick }: IntegrationsCtaProps) {
  return (
    <ProfilePanel
      title="Integrações API"
      subtitle="Guardar e gerir chaves de canais (Airbnb, Booking, ...)"
      action={
        <Button
          variant="outline"
          size="sm"
          className="border-[var(--fg-color)]/20 bg-[var(--fg-color)]/5 text-[var(--fg-color)] hover:bg-[var(--fg-color)]/10 hover:text-[var(--primary-accent)]"
          onClick={onQuick}
        >
          <KeyRound className="w-4 h-4 mr-2" />
          Configurar
        </Button>
      }
    >
      <div className="text-sm text-[var(--fg-color)]/60">
        Atalho rápido para a secção de APIs no teu perfil.
      </div>
    </ProfilePanel>
  )
}
