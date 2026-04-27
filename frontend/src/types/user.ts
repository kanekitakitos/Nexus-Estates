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
