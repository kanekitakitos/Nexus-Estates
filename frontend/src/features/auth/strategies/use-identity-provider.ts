"use client"

/**
 * Tipos de provedores de identidade suportados pela aplicação.
 * 'clerk': Utiliza o sistema de autenticação Clerk.
 * 'none': Nenhuma estratégia de identidade externa ativa.
 */
export type IdentityProviderKey = "clerk" | "none"

/**
 * Determina qual provedor de identidade será usado com base na variável de ambiente `NEXT_PUBLIC_IDP`.
 * @return identidade a ser utilizada
 */
export function getIdentityProviderKey(): IdentityProviderKey {
  const idp = (process.env.NEXT_PUBLIC_IDP ?? "clerk").toLowerCase()
  return idp === "clerk" ? "clerk" : "none"
}

/**
 * Verifica se as credenciais necessárias para o Clerk estão presentes no ambiente.
 * * @returns `true` se a chave pública do Clerk estiver configurada, `false` caso contrário.
 */
export function isClerkConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
}

