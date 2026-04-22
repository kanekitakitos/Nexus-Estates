import { propertiesAxios, ApiResponse } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { BookingProperty } from "@/features/bookings/components/booking-card";
import { toast } from "sonner";
import type {
    CreatePropertyRequest,
    ExpandedPropertyResponse,
    Page,
    PropertyQuoteRequest,
    PropertyQuoteResponse,
    PropertyRuleDTO,
    SeasonalityRuleDTO,
    UpdatePropertyRequest,
    PropertyListItem,
} from "@/types/property";

export type {
    CreatePropertyRequest,
    ExpandedPropertyResponse,
    Page,
    PropertyQuoteRequest,
    PropertyQuoteResponse,
    PropertyRuleDTO,
    SeasonalityRuleDTO,
    UpdatePropertyRequest,
    PropertyListItem,
} from "@/types/property";

type PropertyTranslation = {
    pt?: string;
    en?: string;
};

type PropertyApiItem = {
    id: string | number;
    name?: string | PropertyTranslation;
    title?: string;
    description?: string | PropertyTranslation;
    city?: string;
    address?: string;
    maxGuests?: number;
    location?: string;
    basePrice?: number;
    base_price?: number;
    pricePerNight?: number;
    price_per_night?: number;
    imageUrl?: string;
    image_url?: string;
    status?: string;
    isActive?: boolean;
    rating?: number;
    featured?: boolean;
    tags?: string[];
};

/**
 * Serviço responsável por encapsular todas as chamadas à API relacionadas com Propriedades.
 * Isto facilita a manutenção, testes e reutilização de código em diferentes componentes.
 *
 * Base path no API Gateway:
 * - /api/properties
 *
 * Instância Axios utilizada:
 * - propertiesAxios (baseURL: {NEXT_PUBLIC_API_URL}/properties)
 */
export class PropertyService {
    /**
     * Cria uma propriedade.
     *
     * Endpoint backend:
     * - POST /api/properties
     *
     * Notas de serialização:
     * - Map/Set não são JSON nativo. Se este endpoint falhar, envia description como Record<string,string>
     *   e amenityIds como number[].
     */
    static async createProperty(property : CreatePropertyRequest):Promise<number>{
        try {
            const response = await propertiesAxios.post<ApiResponse<PropertyApiItem>>("", property)

            return response.status
        }catch (error) {
            this.handleError(error, "criar propriedade");
            throw error;
        }
    }

    static async updateProperty(id: string | number, request: UpdatePropertyRequest & { amenityIds?: number[] }): Promise<number> {
        try {
            const patch: UpdatePropertyRequest = {
                title: request.title,
                description: request.description,
                location: request.location,
                city: request.city,
                address: request.address,
                basePrice: request.basePrice,
                maxGuests: request.maxGuests,
                isActive: request.isActive,
                imageUrl: request.imageUrl
            }

            await this.patchProperty(Number(id), patch)

            if (request.amenityIds) {
                await this.updateAmenities(Number(id), request.amenityIds)
            }

            return 200
        } catch (error) {
            this.handleError(error, "atualizar propriedade");
            throw error;
        }
    }


    /**
     * Obtém a lista de todas as propriedades e mapeia-as para o formato esperado pelo frontend.
     * 
     * @returns Uma promessa que resolve para um array de BookingProperty
     */
    static async getAllProperties(): Promise<BookingProperty[]> {
        try {
            const response = await propertiesAxios.get<ApiResponse<PropertyApiItem[]>>("/search");
            
            if (response.data.success) {
                const properties = Array.isArray(response.data.data) ? response.data.data : [];
                return properties.map((p: PropertyApiItem) => {
                    const anyP = p as unknown as Record<string, unknown>;
                    const rawIsActive = (p.isActive ?? (anyP["active"] as unknown) ?? (anyP["is_active"] as unknown)) as unknown;
                    const isActive = rawIsActive === true || rawIsActive === "true";
                    const rawStatus = (p.status ?? (anyP["status"] as unknown)) as unknown;
                    const status = typeof rawStatus === "string" ? rawStatus : "";

                    return {
                        id: String(p.id),
                        title: typeof p.name === 'string' ? p.name : (p.name?.pt || p.name?.en || p.title || "Propriedade sem título"),
                        description: typeof p.description === 'string' ? p.description : (p.description?.pt || p.description?.en || ""),
                        location: p.address || p.location || "Localização não disponível",
                        price: Number(p.basePrice ?? p.base_price ?? p.pricePerNight ?? p.price_per_night ?? 0),
                        imageUrl: p.imageUrl || p.image_url || "",
                        status: (status === "ACTIVE" || status === "AVAILABLE" || isActive)
                          ? "AVAILABLE"
                          : (status === "MAINTENANCE" ? "MAINTENANCE" : "BOOKED"),
                        rating: Number(p.rating ?? 0),
                        featured: Boolean(p.featured ?? false),
                        tags: p.tags || []
                    }
                });
            }
            return [];
        } catch (error) {
            this.handleError(error, "carregar propriedades");
            throw error;
        }
    }

    static async getUploadParams(): Promise<Record<string, unknown>> {
        try {
            const response = await propertiesAxios.get<ApiResponse<Record<string, unknown>>>("/upload-params");
            return response.data.data;
        } catch (error) {
            this.handleError(error, "obter parâmetros de upload");
            throw error;
        }
    }

    /**
     * Substitui o conjunto de comodidades associadas à propriedade.
     *
     * Endpoint backend:
     * - PUT /api/properties/{id}/amenities
     *
     * @param id ID da propriedade
     * @param amenityIds lista de IDs de comodidades a associar
     */
    static async updateAmenities(id: number, amenityIds: number[]): Promise<Record<string, unknown>> {
        try {
            const response = await propertiesAxios.put<ApiResponse<Record<string, unknown>>>(`/${id}/amenities`, amenityIds);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "atualizar comodidades");
            throw error;
        }
    }

    /**
     * Adiciona 1 comodidade sem remover as existentes.
     *
     * Endpoint backend:
     * - POST /api/properties/{id}/amenities/{amenityId}
     */
    static async addAmenity(id: number, amenityId: number): Promise<Record<string, unknown>> {
        try {
            const response = await propertiesAxios.post<ApiResponse<Record<string, unknown>>>(`/${id}/amenities/${amenityId}`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "adicionar comodidade");
            throw error;
        }
    }

    /**
     * Remove 1 comodidade associada.
     *
     * Endpoint backend:
     * - DELETE /api/properties/{id}/amenities/{amenityId}
     */
    static async removeAmenity(id: number, amenityId: number): Promise<Record<string, unknown>> {
        try {
            const response = await propertiesAxios.delete<ApiResponse<Record<string, unknown>>>(`/${id}/amenities/${amenityId}`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "remover comodidade");
            throw error;
        }
    }

    /**
     * Obtém regras operacionais (check-in/out, min/max nights, lead time).
     *
     * Endpoint backend:
     * - GET /api/properties/{id}/rules
     */
    static async getRules(id: number): Promise<PropertyRuleDTO> {
        try {
            const response = await propertiesAxios.get<ApiResponse<PropertyRuleDTO>>(`/${id}/rules`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "obter regras da propriedade");
            throw error;
        }
    }

    /**
     * Atualiza regras operacionais.
     *
     * Endpoint backend:
     * - PUT /api/properties/{id}/rules
     *
     * Auth:
     * - Requer role OWNER no backend
     */
    static async updateRules(id: number, dto: PropertyRuleDTO): Promise<PropertyRuleDTO> {
        try {
            const response = await propertiesAxios.put<ApiResponse<PropertyRuleDTO>>(`/${id}/rules`, dto);
            toast.success("Regras atualizadas.");
            return response.data.data;
        } catch (error) {
            this.handleError(error, "atualizar regras da propriedade");
            throw error;
        }
    }

    /**
     * Lista regras de sazonalidade (precificação dinâmica).
     *
     * Endpoint backend:
     * - GET /api/properties/{id}/rules/seasonality
     */
    static async getSeasonalityRules(id: number): Promise<SeasonalityRuleDTO[]> {
        try {
            const response = await propertiesAxios.get<ApiResponse<SeasonalityRuleDTO[]>>(`/${id}/rules/seasonality`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "obter regras de sazonalidade");
            throw error;
        }
    }

    /**
     * Valida regras e calcula cotação.
     *
     * Endpoint backend:
     * - POST /api/properties/{id}/quote
     */
    static async quote(id: number, request: PropertyQuoteRequest): Promise<PropertyQuoteResponse> {
        try {
            const response = await propertiesAxios.post<ApiResponse<PropertyQuoteResponse>>(`/${id}/quote`, request);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "validar e cotar estadia");
            throw error;
        }
    }

    /**
     * Lista propriedades de um utilizador com paginação/filtros.
     *
     * Endpoint backend:
     * - GET /api/properties/by-user/{userId}?page&size&sort&city&isActive&minPrice&maxPrice
     */
    static async listByUser(params: {
        userId: number;
        page?: number;
        size?: number;
        sort?: string;
        city?: string;
        isActive?: boolean;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<Page<PropertyListItem>> {
        try {
            const response = await propertiesAxios.get<ApiResponse<Page<PropertyListItem>>>(`/by-user/${params.userId}`, {
                params: {
                    page: params.page ?? 0,
                    size: params.size ?? 20,
                    sort: params.sort ?? "name,asc",
                    city: params.city?.trim() ? params.city.trim() : undefined,
                    isActive: params.isActive,
                    minPrice: params.minPrice,
                    maxPrice: params.maxPrice,
                },
            });
            return response.data.data;
        } catch (error) {
            this.handleError(error, "listar propriedades do utilizador");
            throw error;
        }
    }

    static async listMine(params?: {
        page?: number;
        size?: number;
        sort?: string;
        city?: string;
        isActive?: boolean;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<Page<PropertyListItem>> {
        try {
            const response = await propertiesAxios.get<ApiResponse<Page<PropertyListItem>>>(`/me`, {
                params: {
                    page: params?.page ?? 0,
                    size: params?.size ?? 20,
                    sort: params?.sort ?? "name,asc",
                    city: params?.city?.trim() ? params?.city.trim() : undefined,
                    isActive: params?.isActive,
                    minPrice: params?.minPrice,
                    maxPrice: params?.maxPrice,
                },
            });
            return response.data.data;
        } catch (error) {
            this.handleError(error, "listar propriedades do utilizador autenticado");
            throw error;
        }
    }

    /**
     * Obtém uma propriedade com dados expandidos (amenities + regras + sazonalidade).
     *
     * Endpoint backend:
     * - GET /api/properties/{id}/expanded
     */
    static async getExpanded(id: number): Promise<ExpandedPropertyResponse> {
        try {
            const response = await propertiesAxios.get<ApiResponse<ExpandedPropertyResponse>>(`/${id}/expanded`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "obter propriedade expandida");
            throw error;
        }
    }

    /**
     * PATCH parcial de propriedade.
     *
     * Endpoint backend:
     * - PATCH /api/properties/{id}
     *
     * Headers opcionais:
     * - X-Actor-UserId: usado para audit/tracking no backend
     */
    static async patchProperty(id: number, request: UpdatePropertyRequest, actorUserId?: number): Promise<Record<string, unknown>> {
        try {
            const response = await propertiesAxios.patch<ApiResponse<Record<string, unknown>>>(`/${id}`, request, {
                headers: actorUserId ? { "X-Actor-UserId": actorUserId } : undefined,
            });
            toast.success("Propriedade atualizada.");
            return response.data.data;
        } catch (error) {
            this.handleError(error, "atualizar propriedade");
            throw error;
        }
    }

    /**
     * Elimina definitivamente uma propriedade.
     *
     * Endpoint backend:
     * - DELETE /api/properties/{id}
     *
     * Headers opcionais:
     * - X-Actor-UserId
     */
    static async deleteProperty(id: number, actorUserId?: number): Promise<void> {
        try {
            await propertiesAxios.delete<void>(`/${id}`, {
                headers: actorUserId ? { "X-Actor-UserId": String(actorUserId) } : undefined,
            });
            toast.success("Propriedade eliminada.");
        } catch (error) {
            this.handleError(error, "eliminar propriedade");
            throw error;
        }
    }

    /**
     * Obtém histórico (audit) de alterações de uma propriedade.
     *
     * Endpoint backend:
     * - GET /api/properties/{id}/history
     */
    static async history(id: number): Promise<Record<string, unknown>[]> {
        try {
            const response = await propertiesAxios.get<ApiResponse<Record<string, unknown>[]>>(`/${id}/history`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "obter histórico da propriedade");
            throw error;
        }
    }

    /**
     * Obtém parâmetros temporários para upload seguro de documentos da propriedade.
     *
     * Endpoint backend:
     * - GET /api/properties/{id}/documents/upload-params
     */
    static async documentUploadParams(id: number): Promise<Record<string, unknown>> {
        try {
            const response = await propertiesAxios.get<ApiResponse<Record<string, unknown>>>(`/${id}/documents/upload-params`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "obter parâmetros de upload de documentos");
            throw error;
        }
    }

    /**
     * Gera relatório CSV (summary) como Blob.
     *
     * Endpoint backend:
     * - GET /api/properties/reports/summary (produces: text/csv)
     */
    static async reportSummaryCsv(params: { userId: number; city?: string; isActive?: boolean }): Promise<Blob> {
        try {
            const response = await propertiesAxios.get(`/reports/summary`, {
                params,
                responseType: "blob",
            });
            return response.data as Blob;
        } catch (error) {
            this.handleError(error, "gerar relatório CSV");
            throw error;
        }
    }

    /**
     * Lista as propriedades do utilizador autenticado, usando localStorage.userId.
     *
     * Endpoint backend:
     * - GET /api/properties/by-user/{userId}
     */
    static async getAllOwnProperties(): Promise<BookingProperty[]>{

        try {
            if (typeof window === "undefined") return [];
            const page = await this.listMine({ page: 0, size: 100, sort: "name,asc" });
            return page.content.map((p) => ({
                id: String(p.id),
                title: p.name,
                description: "",
                location: p.city,
                price: Number(p.basePrice ?? 0),
                imageUrl: "",
                status: p.isActive ? "AVAILABLE" : "MAINTENANCE",
                rating: 0,
                featured: false,
                tags: [],
            }));
        } catch (error) {
            this.handleError(error, "carregar propriedades do utilizador");
            throw error;
        }
    }


    /**
     * Obtém os detalhes de uma propriedade específica pelo seu ID.
     * 
     * @param id O identificador único da propriedade
     * @returns Uma promessa que resolve para os dados da propriedade
     */
    static async getPropertyById(id: string | number) {
        try {
            const response = await propertiesAxios.get<ApiResponse<PropertyApiItem>>(`/${id}`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "obter detalhes da propriedade");
            throw error;
        }
    }

    private static isAxiosError(error: unknown): error is AxiosError {
        return typeof error === "object" && error !== null && "isAxiosError" in error;
    }

    /**
     * Tratamento centralizado de erros para o serviço de propriedades.
     */
    private static handleError(error: unknown, action: string): void {
        console.error(`Erro ao ${action}:`, error);
        if (this.isAxiosError(error) && error.response) {
            const status = error.response.status;
            if (status === 404) {
                toast.error("Propriedade não encontrada.");
            } else {
                toast.error(`Erro ao ${action}. Tente novamente mais tarde.`);
            }
        } else {
            toast.error("Erro de conexão. Verifique a sua internet.");
        }
    }
}
