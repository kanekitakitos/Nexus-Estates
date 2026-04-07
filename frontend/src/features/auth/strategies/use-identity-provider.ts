"use client"

export type IdentityProviderKey = "clerk" | "none"

export function getIdentityProviderKey(): IdentityProviderKey {
  const idp = (process.env.NEXT_PUBLIC_IDP ?? "clerk").toLowerCase()
  return idp === "clerk" ? "clerk" : "none"
}

export function isClerkConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
}

