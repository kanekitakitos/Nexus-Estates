import { usersAxios } from "@/lib/axiosAPI"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import type { UserProfile, ChangePasswordRequest } from "@/types/user"

export type { UserProfile, ChangePasswordRequest } from "@/types/user"

export class UserService {
  static async getMe(): Promise<UserProfile> {
    try {
      const res = await usersAxios.get<UserProfile>("/me")
      return res.data
    } catch (e) {
      this.handleError(e, "carregar perfil")
      throw e
    }
  }

  static async updateName(name: string): Promise<UserProfile> {
    try {
      const res = await usersAxios.patch<UserProfile>("/me", { name })
      toast.success("Nome atualizado.")
      return res.data
    } catch (e) {
      this.handleError(e, "atualizar nome")
      throw e
    }
  }

  static async uploadAvatar(file: File): Promise<UserProfile> {
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await usersAxios.post<UserProfile>("/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Foto de perfil atualizada.")
      return res.data
    } catch (e) {
      this.handleError(e, "atualizar foto")
      throw e
    }
  }

  static async changePassword(payload: ChangePasswordRequest): Promise<{ ok: true }> {
    try {
      await usersAxios.post("/me/password", payload)
      toast.success("Password alterada.")
      return { ok: true }
    } catch (e) {
      this.handleError(e, "alterar password")
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

