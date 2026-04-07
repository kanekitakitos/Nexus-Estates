"use client"

export type OAuthProvider = "google" | "github" | "facebook"

export type IdentityProvider = {
  key: string
  isAvailable: boolean
  startOAuth: (provider: OAuthProvider, redirectUrlComplete: string) => Promise<void>
  getToken: () => Promise<string | null>
}
