import { authTokens } from "@/features/auth/tokens"
import { bookingsTokens } from "@/features/bookings/tokens"
import { chatTokens } from "@/features/chat/tokens"
import { financeTokens } from "@/features/finance/tokens"
import { landingTokens } from "@/features/landing/tokens"
import { profileTokens } from "@/features/profile/tokens"
import { propertyTokens } from "@/features/property/tokens"

export const featureTokens = {
  auth: authTokens,
  bookings: bookingsTokens,
  chat: chatTokens,
  finance: financeTokens,
  landing: landingTokens,
  profile: profileTokens,
  property: propertyTokens,
} as const
