import { usersAxios } from "@/lib/axiosAPI"
import type { ApiResponse } from "@/lib/axiosAPI"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import type { UserProfile } from "@/types/user"

export type { UserProfile } from "@/types/user"

export class UserService {
  static async getMe(): Promise<UserProfile> {
    try {
      if (typeof window === "undefined") {
        throw new Error("getMe requer contexto client-side")
      }
      const res = await usersAxios.get<ApiResponse<UserProfile>>(`/me`)
      return res.data.data
    } catch (e) {
      this.handleError(e, "carregar perfil")
      throw e
    }
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return typeof error === "object" && error !== null && "isAxiosError" in error
  }

  private static handleError(error: unknown, action: string): void {
    if (this.isAxiosError(error) && error.response) {
      const status = error.response.status
      if (status === 400) toast.error("Dados inválidos.")
      else if (status === 401) toast.error("Sessão expirada.")
      else toast.error(`Erro ao ${action}.`)
    } else {
      toast.error("Erro de conexão.")
    }
  }
}
