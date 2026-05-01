import {
  PropertyCardDisplayVariant,
  PropertyCardVariant,
  LEGACY_VARIANT_MAP,
} from "../model/property-constants"
import type { OwnProperty } from "@/types"

export function resolvePropertyCardVariant(
  variant: PropertyCardVariant
): PropertyCardDisplayVariant {
  return LEGACY_VARIANT_MAP[variant] ?? (variant as PropertyCardDisplayVariant)
}

export function resolvedSerialId(id: string): string {
  if (!id || typeof id !== "string") return "00"
  const lastPart = id.slice(-2)
  const parsed = parseInt(lastPart, 16)
  return (Number.isNaN(parsed) ? 0 : (parsed % 99) + 1)
    .toString()
    .padStart(2, "0")
}

export function resolvePropertyDescription(
  raw: unknown,
  fallback = "Protótipo habitacional Nexus — eficiência operacional e compliance integrado."
): string {
  if (typeof raw === "string") return raw || fallback
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>
    return (typeof obj["pt"] === "string" ? obj["pt"] : "") ||
      (typeof obj["en"] === "string" ? obj["en"] : "") ||
      fallback
  }
  return fallback
}

export function resolveTranslation(value: unknown): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object") {
    const v = value as Record<string, unknown>
    return (
      (typeof v["pt"] === "string" ? v["pt"] : "") ||
      (typeof v["en"] === "string" ? v["en"] : "") ||
      ""
    )
  }
  return ""
}

export function mapPropertyRecordToOwnProperty(p: Record<string, unknown>): OwnProperty {
  const city = String(p.city ?? "")
  const amenities = Array.isArray(p.amenities) ? p.amenities : []
  const amenityIdsRaw = Array.isArray(p.amenityIds)
    ? p.amenityIds
    : amenities.map((a) => (typeof a === "object" && a !== null ? (a as { id?: unknown }).id : a))

  const amenityIds = amenityIdsRaw
    .map((id) => (typeof id === "number" ? id : Number(id)))
    .filter((id) => Number.isFinite(id))

  const rulesRaw = (p.propertyRule ?? p.rules) as unknown
  const rules =
    rulesRaw && typeof rulesRaw === "object"
      ? {
          checkInTime: String((rulesRaw as any).checkInTime ?? ""),
          checkOutTime: String((rulesRaw as any).checkOutTime ?? ""),
          minNights:
            typeof (rulesRaw as any).minNights === "number"
              ? (rulesRaw as any).minNights
              : Number((rulesRaw as any).minNights ?? undefined),
          maxNights:
            typeof (rulesRaw as any).maxNights === "number"
              ? (rulesRaw as any).maxNights
              : Number((rulesRaw as any).maxNights ?? undefined),
          bookingLeadTimeDays:
            typeof (rulesRaw as any).bookingLeadTimeDays === "number"
              ? (rulesRaw as any).bookingLeadTimeDays
              : Number((rulesRaw as any).bookingLeadTimeDays ?? undefined),
        }
      : undefined

  const seasonalityRaw = (p.seasonalityRules ?? p.seasonality) as unknown
  const seasonalityRules = Array.isArray(seasonalityRaw)
    ? seasonalityRaw
        .map((r) => {
          if (!r || typeof r !== "object") return null
          const rr = r as any
          const id = typeof rr.id === "number" ? rr.id : Number(rr.id)
          const priceModifier =
            typeof rr.priceModifier === "number" ? rr.priceModifier : Number(rr.priceModifier)
          return {
            id: Number.isFinite(id) ? id : Date.now(),
            startDate: String(rr.startDate ?? ""),
            endDate: String(rr.endDate ?? ""),
            priceModifier: Number.isFinite(priceModifier) ? priceModifier : 1,
            dayOfWeek: rr.dayOfWeek ?? null,
            channel: rr.channel ?? null,
          }
        })
        .filter(Boolean) as any[]
    : undefined

  const permissionsRaw = p.permissions as unknown
  const permissions = Array.isArray(permissionsRaw)
    ? permissionsRaw
        .map((perm) => {
          if (!perm || typeof perm !== "object") return null
          const pp = perm as any
          const userId = typeof pp.userId === "number" ? pp.userId : Number(pp.userId)
          const accessLevel = String(pp.accessLevel ?? pp.level ?? "").toUpperCase()
          if (!Number.isFinite(userId) || !accessLevel) return null
          return {
            userId,
            email: typeof pp.email === "string" && pp.email ? pp.email : `user-${userId}`,
            accessLevel: accessLevel === "PRIMARY_OWNER" || accessLevel === "MANAGER" || accessLevel === "STAFF"
              ? accessLevel
              : "STAFF",
          }
        })
        .filter(Boolean)
    : undefined

  return {
    id: String(p.id ?? ""),
    title: String(p.name ?? ""),
    description: resolveTranslation(p.description),
    location: String(p.location ?? city),
    city,
    address: String(p.address ?? ""),
    maxGuests: Number(p.maxGuests ?? 1),
    price: Number(p.basePrice ?? 0),
    imageUrl: String((p as { imageUrl?: unknown; image_url?: unknown }).imageUrl ?? (p as { image_url?: unknown }).image_url ?? ""),
    status: p.isActive === true || p.isActive === "true" ? "AVAILABLE" : "MAINTENANCE",
    rating: 0,
    tags: amenities.map((a) =>
      typeof a === "object" && a !== null
        ? resolveTranslation((a as { name?: unknown }).name)
        : String(a)
    ).filter(Boolean),
    amenityIds,
    propertyRule: rules,
    seasonalityRules,
    permissions,
  }
}
