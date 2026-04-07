"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { KeyRound } from "lucide-react"

export function IntegrationsCta({ onQuick }: { onQuick?: () => void }) {
  return (
    <ProfilePanel
      title="Integrações API"
      subtitle="Guardar e gerir chaves de canais (Airbnb, Booking, ...)"
      action={
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          onClick={onQuick}
        >
          <KeyRound />
          Configurar
        </Button>
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Atalho rápido para a secção de APIs no teu perfil.</div>
        </div>
      </div>
    </ProfilePanel>
  )
}
