import { usersAxios, ApiResponse } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { notify } from "@/lib/notify";
import type { ExternalIntegrationDTO, ExternalProviderName } from "@/types/integrations";

export type { ExternalIntegrationDTO, ExternalProviderName } from "@/types/integrations";

/**
 * Serviço para gestão de integrações externas do utilizador autenticado.
 *
 * Base path no API Gateway:
 * - /api/users
 *
 * Instância Axios utilizada:
 * - usersAxios (baseURL: {NEXT_PUBLIC_API_URL}/users)
 */
export class IntegrationsService {
  /**
   * Cria (regista) uma integração externa (API Key é enviada em texto limpo e encriptada no backend).
   *
   * Endpoint backend:
   * - POST /api/users/integrations
   *
   * Auth:
   * - Requer JWT; backend aplica role OWNER ou ADMIN
   */
  static async create(payload: { providerName: ExternalProviderName; apiKey: string; active?: boolean }): Promise<ExternalIntegrationDTO> {
    try {
      const response = await usersAxios.post<ApiResponse<ExternalIntegrationDTO>>("/integrations", payload);
      if (response.status === 200 && response.data.success) {
        notify.success("Integração criada.");
        return response.data.data;
      }
      throw new Error("Falha ao criar integração");
    } catch (error) {
      this.handleError(error, "criar integração externa");
      throw error;
    }
  }

  /**
   * Lista integrações do utilizador autenticado.
   *
   * Endpoint backend:
   * - GET /api/users/integrations
   */
  static async list(): Promise<ExternalIntegrationDTO[]> {
    try {
      const response = await usersAxios.get<ApiResponse<ExternalIntegrationDTO[]>>("/integrations");
      return response.data.data;
    } catch (error) {
      this.handleError(error, "listar integrações externas");
      throw error;
    }
  }

  /**
   * Remove uma integração por ID (apenas se pertencer ao utilizador).
   *
   * Endpoint backend:
   * - DELETE /api/users/integrations/{id}
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const response = await usersAxios.delete<ApiResponse<void>>(`/integrations/${id}`);
      if (response.status === 200) {
        notify.success("Integração removida.");
        return true;
      }
      return false;
    } catch (error) {
      this.handleError(error, "remover integração externa");
      throw error;
    }
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return typeof error === "object" && error !== null && "isAxiosError" in error;
  }

  private static handleError(error: unknown, action: string): void {
    if (this.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 401) {
        notify.error("Sessão expirada. Faça login novamente.");
      } else if (status === 403) {
        notify.error("Sem permissões para esta operação.");
      } else {
        notify.error(`Erro ao ${action}.`);
      }
    } else {
      notify.error("Erro de conexão com o serviço de utilizadores.");
    }
  }
}
