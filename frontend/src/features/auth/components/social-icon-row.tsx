"use client"

import { Button } from "@/components/ui/forms/button"
import { useClerkIdentityProvider } from "@/features/auth/strategies/clerk/use-clerk-identity-provider"
import { Chrome, Facebook, Github } from "lucide-react"
import type { ReactNode } from "react"


// ─────────────────────────────────────────────────────────────────────────────
//  CONFIGURAÇÃO DOS PROVEDORES
// ─────────────────────────────────────────────────────────────────────────────

type SocialProvider = "google" | "github" | "facebook"

interface SocialButton {
  provider: SocialProvider
  label:    string
  icon:     ReactNode
}

const SOCIAL_BUTTONS: SocialButton[] = [
  { provider: "google",   label: "Continuar com Google",   icon: <Chrome   className="size-4" /> },
  { provider: "github",   label: "Continuar com GitHub",   icon: <Github   className="size-4" /> },
  { provider: "facebook", label: "Continuar com Facebook", icon: <Facebook className="size-4" /> },
]


// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

export function SocialDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-foreground/20" />
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Ou continua com
      </span>
      <div className="h-px flex-1 bg-foreground/20" />
    </div>
  )
}

export function ClerkSocialIconRow() {
  const idp = useClerkIdentityProvider()

  return (
    <div className="flex items-center justify-center gap-3">
      {SOCIAL_BUTTONS.map(({ provider, label, icon }) => (
        <Button
          key={provider}
          variant="outline"
          type="button"
          size="icon"
          className="rounded-full border-foreground/30 bg-background/60 hover:bg-primary/10"
          disabled={!idp.isAvailable}
          onClick={() => void idp.startOAuth(provider, "/clerk/callback")}
          aria-label={label}
        >
          {icon}
        </Button>
      ))}
    </div>
  )
}

export function DisabledSocialIconRow() {
  return (
    <div className="flex items-center justify-center gap-3">
      {SOCIAL_BUTTONS.map(({ provider, label, icon }) => (
        <Button
          key={provider}
          variant="outline"
          type="button"
          size="icon"
          className="rounded-full"
          disabled
          aria-label={label}
        >
          {icon}
        </Button>
      ))}
    </div>
  )
}
