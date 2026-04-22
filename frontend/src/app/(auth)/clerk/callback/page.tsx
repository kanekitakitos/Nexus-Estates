"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/services/auth.service"
import { getIdentityProviderKey, isClerkConfigured } from "@/features/auth/strategies/use-identity-provider"
import { useClerkIdentityProvider } from "@/features/auth/strategies/clerk/use-clerk-identity-provider"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/forms/button"

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
  const [status, setStatus] = React.useState<string>("A verificar sessão Clerk...")

  React.useEffect(() => {
    const run = async () => {
      if (!idp.isLoaded) return
      
      try {
        console.log("[ClerkCallback] IDP loaded, checking for token...")
        setStatus("A obter token Clerk...")
        const clerkToken = await idp.getToken()
        
        if (!clerkToken) {
          console.warn("[ClerkCallback] No token found yet. This might be normal during redirect handling.")
          setStatus("A aguardar finalização do Clerk...")
          return
        }
        
        console.log("[ClerkCallback] Token found, exchanging with backend...")
        setStatus("A sincronizar com servidor...")
        await AuthService.clerkExchange(clerkToken)
        
        toast.success("Login social efetuado com sucesso!")
        router.replace("/")
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Falhou autenticação social."
        console.error("[ClerkCallback] Auth exchange failed:", err)
        setError(message)
      }
    }
    void run()
  }, [idp.isLoaded, idp.getToken, router])

  return (
    <div className="rounded-2xl border-2 border-foreground/80 bg-secondary/80 px-4 py-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-3">
        {!error && <Loader2 className="size-4 animate-spin text-primary" />}
        <div className="font-mono text-xs uppercase tracking-[0.18em] opacity-80">{status}</div>
      </div>
      {error ? (
        <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-300">
           <div className="text-sm font-bold text-destructive">Erro de Autenticação</div>
           <div className="text-xs text-muted-foreground mt-1">{error}</div>
           <Button 
             variant="default" 
             size="sm" 
             className="mt-4 w-full"
             onClick={() => router.push("/login")}
           >
             Voltar ao Login
           </Button>
        </div>
      ) : null}
    </div>
  )
}
