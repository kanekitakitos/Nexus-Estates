"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/services/auth.service"
import { getIdentityProviderKey, isClerkConfigured } from "@/features/auth/strategies/use-identity-provider"
import { useClerkIdentityProvider } from "@/features/auth/strategies/clerk/use-clerk-identity-provider"

export default function ClerkCallbackPage() {
  const idpKey = getIdentityProviderKey()
  const showClerkFlow = idpKey === "clerk" && isClerkConfigured()

  if (!showClerkFlow) {
    return (
      <div className="rounded-2xl border-2 border-foreground/80 bg-secondary/80 px-4 py-6">
        <div className="font-mono text-xs uppercase tracking-[0.18em] opacity-80">
          Clerk não configurado.
        </div>
      </div>
    )
  }

  return <ClerkCallbackInner />
}

function ClerkCallbackInner() {
  const router = useRouter()
  const idp = useClerkIdentityProvider()
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const run = async () => {
      try {
        const clerkToken = await idp.getToken()
        if (!clerkToken) {
          setError("Não foi possível obter token Clerk.")
          return
        }
        await AuthService.clerkExchange(clerkToken)
        router.replace("/")
      } catch {
        setError("Falhou autenticação social.")
      }
    }
    void run()
  }, [idp, router])

  return (
    <div className="rounded-2xl border-2 border-foreground/80 bg-secondary/80 px-4 py-6">
      <div className="font-mono text-xs uppercase tracking-[0.18em] opacity-80">A autenticar…</div>
      {error ? <div className="mt-3 text-sm text-destructive">{error}</div> : null}
    </div>
  )
}
