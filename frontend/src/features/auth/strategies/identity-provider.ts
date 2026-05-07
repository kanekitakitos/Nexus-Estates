/**
 * @file identity-provider.ts
 * @author Nexus Estates team
 * @description Define a interface comum `IdentityProvider` e os provedores de OAuth suportados.
 *              Isto permite que a aplicação integre diferentes sistemas de identidade (ex: Clerk, Auth0) sem forte acoplamento na UI.
 */

"use client"

export type OAuthProvider = "google" | "github" | "facebook"

export type IdentityProvider = {
  key: string
  isLoaded: boolean
  isAvailable: boolean
  startOAuth: (provider: OAuthProvider, redirectUrlComplete: string) => Promise<void>
  getToken: () => Promise<string | null>
}
