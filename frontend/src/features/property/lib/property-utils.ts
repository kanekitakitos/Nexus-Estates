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
  }
}
