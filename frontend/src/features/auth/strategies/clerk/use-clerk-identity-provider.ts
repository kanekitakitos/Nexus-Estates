"use client"

import { useAuth, useSignIn } from "@clerk/nextjs"
import type { IdentityProvider, OAuthProvider } from "@/features/auth/strategies/identity-provider"

export function useClerkIdentityProvider(): IdentityProvider {
  const { isLoaded: isSignInLoaded, signIn } = useSignIn()
  const { isLoaded: isAuthLoaded, getToken } = useAuth()

  const isAvailable = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && isSignInLoaded && isAuthLoaded && signIn
  )

  return {
    key: "clerk",
    isAvailable,
    startOAuth: async (provider: OAuthProvider, redirectUrlComplete: string) => {
      if (!signIn) return
      const strategy =
        provider === "google" ? "oauth_google" : provider === "github" ? "oauth_github" : "oauth_facebook"
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: redirectUrlComplete,
        redirectUrlComplete,
      })
    },
    getToken: async () => {
      if (!isAuthLoaded) return null
      return await getToken()
    },
  }
}
