import { amenitiesAxios } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type { Amenity } from "@/types/amenity";

export type { Amenity } from "@/types/amenity";

/**
 * Serviço de acesso ao catálogo de comodidades.
 *
 * Base path no API Gateway:
 * - /api/amenities
 *
 * Instância Axios utilizada:
 * - amenitiesAxios (baseURL: {NEXT_PUBLIC_API_URL}/amenities)
 */
export class AmenityService {
  /**
   * Lista todas as comodidades.
   *
   * Endpoint backend:
   * - GET /api/amenities
   */
  static async listAll(): Promise<Amenity[]> {
    try {
      const response = await amenitiesAxios.get<Amenity[]>("");
      return response.data;
    } catch (error) {
      this.handleError(error, "listar comodidades");
      throw error;
    }
  }

  /**
   * Obtém uma comodidade pelo ID.
   *
   * Endpoint backend:
   * - GET /api/amenities/{id}
   */
  static async getById(id: number): Promise<Amenity> {
    try {
      const response = await amenitiesAxios.get<Amenity>(`/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, "obter comodidade");
      throw error;
    }
  }

  /**
   * Cria uma comodidade no catálogo.
   *
   * Endpoint backend:
   * - POST /api/amenities
   */
  static async create(payload: { name: string; category: string }): Promise<Amenity> {
    try {
      const response = await amenitiesAxios.post<Amenity>("", payload);
      toast.success("Comodidade criada.");
      return response.data;
    } catch (error) {
      this.handleError(error, "criar comodidade");
      throw error;
    }
  }

  /**
   * Atualiza uma comodidade existente.
   *
   * Endpoint backend:
   * - PUT /api/amenities/{id}
   */
  static async update(id: number, payload: { name: string; category: string }): Promise<Amenity> {
    try {
      const response = await amenitiesAxios.put<Amenity>(`/${id}`, payload);
      toast.success("Comodidade atualizada.");
      return response.data;
    } catch (error) {
      this.handleError(error, "atualizar comodidade");
      throw error;
    }
  }

  /**
   * Remove uma comodidade do catálogo.
   *
   * Endpoint backend:
   * - DELETE /api/amenities/{id}
   */
  static async delete(id: number): Promise<void> {
    try {
      await amenitiesAxios.delete<void>(`/${id}`);
      toast.success("Comodidade removida.");
    } catch (error) {
      this.handleError(error, "remover comodidade");
      throw error;
    }
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return typeof error === "object" && error !== null && "isAxiosError" in error;
  }

  private static handleError(error: unknown, action: string): void {
    if (this.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 404) {
        toast.error("Comodidade não encontrada.");
      } else if (status === 400) {
        toast.error("Dados inválidos.");
      } else {
        toast.error(`Erro ao ${action}.`);
      }
    } else {
      toast.error("Erro de conexão com o serviço de comodidades.");
    }
  }
}
