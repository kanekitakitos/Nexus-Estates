/**
 * @file user.ts
 * @author Nexus Estates team
 * @description Tipos do módulo de utilizadores.
 *              Inclui o modelo base de UserProfile e o payload para alteração de senha.
 */

export type UserProfile = {
  id: number
  email: string
  phone?: string | null
  role?: string | null
  clerkUserId?: string | null
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}
