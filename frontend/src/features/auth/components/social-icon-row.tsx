"use client"

import { Button } from "@/components/ui/forms/button"
import { useClerkIdentityProvider } from "@/features/auth/strategies/clerk/use-clerk-identity-provider"
import { GitBranch, Globe, Loader2, Users } from "lucide-react"
import { type ReactNode, useState } from "react"
import { cn } from "@/lib/utils"
import { notify } from "@/lib/notify"


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
  { provider: "google",   label: "Continuar com Google",   icon: <Globe     className="size-4" /> },
  { provider: "github",   label: "Continuar com GitHub",   icon: <GitBranch className="size-4" /> },
  { provider: "facebook", label: "Continuar com Facebook", icon: <Users     className="size-4" /> },
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
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null)

  const handleSocialAction = async (provider: SocialProvider) => {
    console.log(`[SocialIconRow] Iniciar ação para ${provider}`)
    
    if (!idp.isLoaded) {
      notify.info("A aguardar inicialização do sistema...")
      return
    }

    if (loadingProvider) return
    setLoadingProvider(provider)
    
    try {
      // Usamos a estratégia direta do IDP
      await idp.startOAuth(provider, "/clerk/callback")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falhou ao iniciar sessão"
      console.error(`[SocialIconRow] Erro ao iniciar OAuth para ${provider}:`, err)
      notify.error(`Erro: ${message}`)
      setLoadingProvider(null)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-4">
        {SOCIAL_BUTTONS.map(({ provider, label, icon }) => {
          const isThisLoading = loadingProvider === provider
          const isReady = idp.isLoaded && idp.isAvailable
          
          return (
            <div key={provider} className="relative">
              <Button
                variant="outline"
                type="button"
                size="icon"
                disabled={!!loadingProvider || !idp.isLoaded}
                className={cn(
                  "rounded-full border-2 border-foreground/30 bg-background/60 transition-all duration-300 size-11",
                  isReady && "hover:bg-primary/10 hover:border-primary hover:shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 active:translate-y-0",
                  !isReady && "opacity-50 grayscale"
                )}
                onClick={() => void handleSocialAction(provider)}
                aria-label={label}
              >
                {isThisLoading ? (
                  <Loader2 className="size-5 animate-spin text-primary" />
                ) : (
                  <div className="scale-110">{icon}</div>
                )}
              </Button>
              {!idp.isAvailable && idp.isLoaded && (
                <div className="absolute -bottom-1 -right-1 size-3 rounded-full bg-destructive border-2 border-background" title="Clerk não disponível" />
              )}
            </div>
          )
        })}
      </div>
      {!idp.isLoaded && (
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground animate-pulse">
          A carregar provedores sociais...
        </span>
      )}
    </div>
  )
}

export function DisabledSocialIconRow() {
  return (
    <div className="flex items-center justify-center gap-3 opacity-50 grayscale pointer-events-none">
      {SOCIAL_BUTTONS.map(({ provider, label, icon }) => (
        <Button
          key={provider}
          variant="outline"
          type="button"
          size="icon"
          className="rounded-full border-2 border-foreground/30"
          disabled
          aria-label={label}
        >
          {icon}
        </Button>
      ))}
    </div>
  )
}
