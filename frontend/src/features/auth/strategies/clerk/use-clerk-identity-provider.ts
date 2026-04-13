"use client"

import { useAuth, useSignIn } from "@clerk/nextjs"
import type { IdentityProvider, OAuthProvider } from "@/features/auth/strategies/identity-provider"

export function useClerkIdentityProvider(): IdentityProvider {
  const { isLoaded: isSignInLoaded, signIn } = useSignIn()
  const { isLoaded: isAuthLoaded, getToken } = useAuth()

  const isConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  const isLoaded = isSignInLoaded && isAuthLoaded
  const isAvailable = isConfigured && isLoaded && !!signIn

  return {
    key: "clerk",
    isLoaded,
    isAvailable,
    startOAuth: async (provider: OAuthProvider, redirectUrlComplete: string) => {
      if (!signIn) {
        throw new Error("Clerk SignIn não inicializado.")
      }

      const strategy =
        provider === "google" ? "oauth_google" : provider === "github" ? "oauth_github" : "oauth_facebook"

      try {
        console.log(`[ClerkIDP] A iniciar OAuth para ${provider}...`)

        // Resolve a URL absoluta
        const origin = typeof window !== "undefined" ? window.location.origin : ""
        const absoluteRedirectUrl = redirectUrlComplete.startsWith("http") 
          ? redirectUrlComplete 
          : `${origin}${redirectUrlComplete}`

        // Inicia o fluxo de redirecionamento social
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: absoluteRedirectUrl,
          redirectUrlComplete: absoluteRedirectUrl,
        })
      } catch (err: any) {
        console.error(`[ClerkIDP] Erro no authenticateWithRedirect para ${provider}:`, err)
        throw err
      }
    },
    getToken: async () => {
      if (!isAuthLoaded) return null
      return await getToken()
    },
  }
}
