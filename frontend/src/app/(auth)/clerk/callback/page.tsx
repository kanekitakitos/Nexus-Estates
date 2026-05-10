"use client"

/**
 * @file page.tsx
 * @author Nexus Estates team
 * @description Callback do Clerk (rota /clerk/callback). Finaliza autenticação social, troca o token do
 *              Clerk por sessão no backend e redireciona o utilizador para um destino seguro.
 */

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthService } from "@/services/auth.service"
import { getIdentityProviderKey, isClerkConfigured } from "@/features/auth/strategies/use-identity-provider"
import { useClerkIdentityProvider } from "@/features/auth/strategies/clerk/use-clerk-identity-provider"
import { notify } from "@/lib/notify"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/forms/button"

/**
 * Página de Callback do Clerk.
 * Responsável por validar se o Clerk é o provedor de identidade ativo e
 * decidir se deve renderizar o fluxo de finalização de login.
 */
export default function ClerkCallbackPage() {
  // id do sistema de identidade a ser usado
  const idpKey = getIdentityProviderKey()
  const showClerkFlow = idpKey === "clerk" && isClerkConfigured()

  // caso o clerk não esteja a ser usado ou se não tem configuração
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

/**
 * Componente interno que gere a lógica do estilo "Handshake" entre o Clerk e o Backend.
 * Obtém o token JWT do Clerk e troca-o por uma sessão no servidor.
 */
function ClerkCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idp = useClerkIdentityProvider()
  const { isLoaded, getToken } = idp
  const [error, setError] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string>("A verificar sessão Clerk...")

  //
  React.useEffect(() => {
    const run = async () => {
      if (!isLoaded) return
      
      try {
        setStatus("A obter token Clerk...")
        const clerkToken = await getToken()
        
        if (!clerkToken) {
          setStatus("A aguardar finalização do Clerk...")
          return
        }

        // Troca o token do Clerk por uma sessão no nosso backend
        setStatus("A sincronizar com servidor...")
        await AuthService.clerkExchange(clerkToken)

        notify.success("Login social efetuado com sucesso!")

        // Redirecionamento seguro pós-login
        const nextRaw = searchParams.get("next")
        const safeNext =
          nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") && !nextRaw.includes("://")
            ? nextRaw
            : "/"
        router.replace(safeNext)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Falhou autenticação social."
        setError(message)
      }
    }
    void run()
  }, [getToken, isLoaded, router, searchParams])

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
