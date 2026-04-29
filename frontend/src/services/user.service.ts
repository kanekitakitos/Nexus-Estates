import { usersAxios } from "@/lib/axiosAPI"
import type { AxiosError } from "axios"
import { notify } from "@/lib/notify"
import type { UserProfile } from "@/types/user"

export type { UserProfile } from "@/types/user"

export class UserService {
  static async getMe(): Promise<UserProfile> {
    try {
      if (typeof window === "undefined") {
        throw new Error("getMe requer contexto client-side")
      }
      const res = await usersAxios.get(`/me`)
      const raw = res.data as unknown

      if (this.isApiResponse(raw) && raw.success === false) {
        const err = new Error(typeof raw.message === "string" ? raw.message : "Falha ao carregar perfil.") as Error & {
          response?: { status?: number; data?: unknown }
        }
        err.response = { status: res.status, data: raw }
        throw err
      }

      const candidate = this.extractUserProfile(raw)
      if (!candidate) {
        if (typeof raw === "string") {
          const err = new Error("Resposta inválida do backend ao carregar perfil.") as Error & {
            response?: { status?: number; data?: unknown }
          }
          err.response = {
            status: 502,
            data: {
              message: raw.toLowerCase().includes("<html")
                ? "Resposta HTML recebida do backend."
                : "Resposta de texto recebida do backend.",
            },
          }
          throw err
        }
        const err = new Error("Resposta inválida do backend ao carregar perfil.") as Error & {
          response?: { status?: number; data?: unknown }
        }
        err.response = { status: 502, data: { message: "Resposta inválida do backend." } }
        throw err
      }
      return candidate
    } catch (e) {
      this.handleError(e, "carregar perfil")
      throw e
    }
  }


  static async getUserId(id :number) :Promise<UserProfile>{
    try {
      if (typeof window === "undefined") {
        throw new Error("getMe requer contexto client-side")
      }

      const res = await  usersAxios.get(`/${id}`)
      const raw = res.data as unknown

      if (this.isApiResponse(raw) && raw.success === false) {
        const err = new Error(typeof raw.message === "string" ? raw.message : "Falha ao carregar perfil.") as Error & {
          response?: { status?: number; data?: unknown }
        }
        err.response = { status: res.status, data: raw }
        throw err
      }

      const candidate = this.extractUserProfile(raw)

      if (!candidate) {
        if (typeof raw === "string") {
          const err = new Error("Resposta inválida do backend ao carregar perfil.") as Error & {
            response?: { status?: number; data?: unknown }
          }
          err.response = {
            status: 502,
            data: {
              message: raw.toLowerCase().includes("<html")
                  ? "Resposta HTML recebida do backend."
                  : "Resposta de texto recebida do backend.",
            },
          }
          throw err
        }
        const err = new Error("Resposta inválida do backend ao carregar perfil.") as Error & {
          response?: { status?: number; data?: unknown }
        }
        err.response = { status: 502, data: { message: "Resposta inválida do backend." } }
        throw err
      }
      return candidate

    } catch (e) {
      this.handleError(e, "carregar perfil")
      throw e
    }
  }


  private static isAxiosError(error: unknown): error is AxiosError {
    return typeof error === "object" && error !== null && "isAxiosError" in error
  }

  private static isApiResponse(value: unknown): value is { success: boolean; message?: unknown; data?: unknown } {
    if (!value || typeof value !== "object") return false
    return "success" in value && typeof (value as { success?: unknown }).success === "boolean"
  }

  private static extractUserProfile(raw: unknown): UserProfile | null {
    const unwrapData = (value: unknown): unknown => {
      if (!value || typeof value !== "object") return value
      if ("data" in value) return (value as { data?: unknown }).data
      return value
    }

    const candidates: unknown[] = []
    candidates.push(raw)
    candidates.push(unwrapData(raw))
    candidates.push(unwrapData(unwrapData(raw)))

    for (const value of candidates) {
      const normalized = this.normalizeUserProfile(value)
      if (normalized) return normalized

      if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>
        const nestedKeys = ["user", "profile", "me", "result"]
        for (const key of nestedKeys) {
          const nested = obj[key]
          const normalizedNested = this.normalizeUserProfile(nested)
          if (normalizedNested) return normalizedNested
        }
      }
    }

    return null
  }

  private static isUserProfile(value: unknown): value is UserProfile {
    if (!value || typeof value !== "object") return false
    const maybe = value as Partial<UserProfile>
    return typeof maybe.id === "number" && typeof maybe.email === "string"
  }

  private static normalizeUserProfile(value: unknown): UserProfile | null {
    if (!value || typeof value !== "object") return null
    const maybe = value as Partial<UserProfile> & { userId?: unknown }
    const email = typeof maybe.email === "string" ? maybe.email : null
    if (!email) return null

    const rawId = typeof maybe.id !== "undefined" ? maybe.id : maybe.userId
    const id =
      typeof rawId === "number"
        ? rawId
        : typeof rawId === "string" && rawId.trim() && !Number.isNaN(Number(rawId))
          ? Number(rawId)
          : null

    if (typeof id !== "number" || Number.isNaN(id)) return null

    return {
      id,
      email,
      phone: typeof maybe.phone === "string" || maybe.phone === null ? maybe.phone : undefined,
      role: typeof maybe.role === "string" || maybe.role === null ? maybe.role : undefined,
      clerkUserId:
        typeof maybe.clerkUserId === "string" || maybe.clerkUserId === null ? maybe.clerkUserId : undefined,
    }
  }

  private static handleError(error: unknown, action: string): void {
    const response =
      this.isAxiosError(error)
        ? error.response
        : typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { status?: number } }).response
          : undefined

    if (response?.status) {
      const status = response.status
      if (status === 400) notify.error("Dados inválidos.")
      else if (status === 401) notify.error("Sessão expirada.")
      else notify.error(`Erro ao ${action}.`)
    } else {
      notify.error("Erro de conexão.")
    }
  }
}
