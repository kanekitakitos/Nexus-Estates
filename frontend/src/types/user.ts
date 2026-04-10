export type UserProfile = {
  id: number
  name: string
  email: string
  avatarUrl?: string | null
  createdAt: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

