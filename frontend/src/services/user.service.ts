import { usersAxios } from "@/lib/axiosAPI"
import type { AxiosError } from "axios"
import { notify } from "@/lib/notify"
import type { UserProfile } from "@/types/user"
import type { AuthResponse } from "@/types/auth"

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

  static async lookupByEmail(email: string): Promise<Pick<UserProfile, "id" | "email">> {
    try {
      if (typeof window === "undefined") {
        throw new Error("lookupByEmail requer contexto client-side")
      }
      const res = await usersAxios.get(`/lookup`, { params: { email } })
      const raw = res.data as unknown

      if (this.isApiResponse(raw) && raw.success === false) {
        const err = new Error(typeof raw.message === "string" ? raw.message : "Falha ao resolver utilizador.") as Error & {
          response?: { status?: number; data?: unknown }
        }
        err.response = { status: res.status, data: raw }
        throw err
      }

      const candidate = this.extractUserProfile(raw)
      if (!candidate) {
        throw new Error("Resposta inválida do backend ao resolver utilizador.")
      }

      return { id: candidate.id, email: candidate.email }
    } catch (e) {
      this.handleError(e, "resolver utilizador")
      throw e
    }
  }

  static async patchMe(payload: { email?: string; phone?: string }): Promise<{ profile: UserProfile; session?: AuthResponse }> {
    try {
      if (typeof window === "undefined") {
        throw new Error("patchMe requer contexto client-side")
      }
      const res = await usersAxios.patch(`/me`, payload)
      const raw = res.data as unknown

      if (this.isApiResponse(raw) && raw.success === false) {
        const err = new Error(typeof raw.message === "string" ? raw.message : "Falha ao atualizar perfil.") as Error & {
          response?: { status?: number; data?: unknown }
        }
        err.response = { status: res.status, data: raw }
        throw err
      }

      const profile = this.extractUserProfile(raw)
      if (!profile) {
        throw new Error("Resposta inválida do backend ao atualizar perfil.")
      }

      const token = this.extractToken(raw)
      const role = this.extractRole(raw)
      const session = token
        ? ({
            token,
            id: profile.id,
            email: profile.email,
            role: role ?? profile.role ?? "",
          } satisfies AuthResponse)
        : undefined

      return { profile, session }
    } catch (e) {
      this.handleError(e, "atualizar perfil")
      throw e
    }
  }

  static async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<AuthResponse | null> {
    try {
      if (typeof window === "undefined") {
        throw new Error("changePassword requer contexto client-side")
      }
      const res = await usersAxios.post(`/me/password`, payload)
      const raw = res.data as unknown

      if (this.isApiResponse(raw) && raw.success === false) {
        const err = new Error(typeof raw.message === "string" ? raw.message : "Falha ao atualizar password.") as Error & {
          response?: { status?: number; data?: unknown }
        }
        err.response = { status: res.status, data: raw }
        throw err
      }

      const data = this.unwrapData(raw)
      if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>
        if (typeof obj.token === "string" && typeof obj.id === "number" && typeof obj.email === "string") {
          return {
            token: obj.token,
            id: obj.id,
            email: obj.email,
            role: typeof obj.role === "string" ? obj.role : "",
          }
        }
      }
      return null
    } catch (e) {
      this.handleError(e, "atualizar password")
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
    const candidates: unknown[] = []
    candidates.push(raw)
    candidates.push(this.unwrapData(raw))
    candidates.push(this.unwrapData(this.unwrapData(raw)))

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

  private static unwrapData(value: unknown): unknown {
    if (!value || typeof value !== "object") return value
    if ("data" in value) return (value as { data?: unknown }).data
    return value
  }

  private static extractToken(raw: unknown): string | null {
    const data = this.unwrapData(raw)
    if (!data || typeof data !== "object") return null
    const token = (data as Record<string, unknown>).token
    return typeof token === "string" && token.trim() ? token : null
  }

  private static extractRole(raw: unknown): string | null {
    const data = this.unwrapData(raw)
    if (!data || typeof data !== "object") return null
    const role = (data as Record<string, unknown>).role
    return typeof role === "string" && role.trim() ? role : null
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
