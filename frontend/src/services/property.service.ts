import { propertiesAxios, ApiResponse } from "@/lib/axiosAPI";
import axios from "axios";
import type { AxiosError } from "axios";
import type { BookingProperty } from "@/types/booking";
import { notify } from "@/lib/notify";
import type {
    CreatePropertyRequest,
    ExpandedPropertyResponse,
    Page,
    PropertyAccessLevel,
    PropertyPermissionDTO,
    PropertyPermissionPatchRequest,
    PropertyQuoteRequest,
    PropertyQuoteResponse,
    PropertyRulePatchRequest,
    PropertyRuleDTO,
    SeasonalityRulePatchRequest,
    SeasonalityRuleDTO,
    UpdatePropertyRequest,
    PropertyListItem,
    PropertyImageUploadParams,
    PropertyImageUploadErrorInfo,
} from "@/types/property";

export type {
    CreatePropertyRequest,
    ExpandedPropertyResponse,
    Page,
    PropertyAccessLevel,
    PropertyPermissionDTO,
    PropertyPermissionPatchRequest,
    PropertyQuoteRequest,
    PropertyQuoteResponse,
    PropertyRulePatchRequest,
    PropertyRuleDTO,
    SeasonalityRulePatchRequest,
    SeasonalityRuleDTO,
    UpdatePropertyRequest,
    PropertyListItem,
    PropertyImageUploadParams,
    PropertyImageUploadErrorInfo,
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
    static PropertyImageUploadError = class PropertyImageUploadError extends Error {
        info: PropertyImageUploadErrorInfo

        constructor(info: PropertyImageUploadErrorInfo) {
            super(info.message)
            this.info = info
            this.name = "PropertyImageUploadError"
        }
    }

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

    static async getUploadParams(): Promise<PropertyImageUploadParams> {
        return this.getImageUploadParams()
    }

    static async getImageUploadParams(): Promise<PropertyImageUploadParams> {
        try {
            const response = await propertiesAxios.get<ApiResponse<PropertyImageUploadParams>>("/upload-params")
            return response.data.data
        } catch (error) {
            this.handleError(error, "obter parâmetros de upload")
            throw error
        }
    }

    static async uploadPropertyImages(files: File[]): Promise<string[]> {
        if (!files.length) return []

        let params: PropertyImageUploadParams
        try {
            params = await this.getImageUploadParams()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha ao obter parâmetros de upload."
            throw new this.PropertyImageUploadError({ stage: "params", message })
        }

        if (!params.signature || !params.upload_url || !params.api_key || !params.timestamp) {
            throw new this.PropertyImageUploadError({
                stage: "params",
                message: "Parâmetros de upload inválidos.",
            })
        }

        const uploadedUrls: string[] = []

        for (const file of files) {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("timestamp", String(params.timestamp))
            formData.append("api_key", params.api_key)
            formData.append("signature", params.signature)
            formData.append("folder", params.folder)
            if (params.upload_preset) formData.append("upload_preset", params.upload_preset)

            try {
                const response = await axios.post(params.upload_url, formData)
                const secureUrl = (response.data as any)?.secure_url
                if (typeof secureUrl === "string" && secureUrl.trim()) {
                    uploadedUrls.push(secureUrl)
                } else {
                    throw new this.PropertyImageUploadError({
                        stage: "upload",
                        message: "Upload falhou: resposta inválida do Cloudinary.",
                    })
                }
            } catch (error) {
                if (error instanceof this.PropertyImageUploadError) throw error

                if (axios.isAxiosError(error)) {
                    const status = error.response?.status
                    const data = error.response?.data as any
                    const cloudinaryMsg =
                        typeof data === "object" ? (data?.error?.message as string | undefined) : undefined
                    const rawMsg =
                        (typeof data === "string" ? data : undefined) ||
                        cloudinaryMsg ||
                        error.message ||
                        "Falha no upload."

                    const suffix =
                        status === 401
                            ? " (normalmente credenciais/assinatura inválidas ou upload preset obrigatório)."
                            : ""

                    throw new this.PropertyImageUploadError({
                        stage: "upload",
                        status,
                        message: `HTTP ${status ?? "?"}: ${rawMsg}${suffix}`,
                    })
                }

                const message = error instanceof Error ? error.message : "Falha no upload."
                throw new this.PropertyImageUploadError({ stage: "upload", message })
            }
        }

        return uploadedUrls
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
     * - Requer acesso de gestão ao ativo (PRIMARY_OWNER/MANAGER)
     */
    static async updateRules(id: number, dto: PropertyRuleDTO): Promise<PropertyRuleDTO> {
        try {
            const response = await propertiesAxios.put<ApiResponse<PropertyRuleDTO>>(`/${id}/rules`, dto);
            notify.success("Regras atualizadas.");
            return response.data.data;
        } catch (error) {
            this.handleError(error, "atualizar regras da propriedade");
            throw error;
        }
    }

    /**
     * Atualiza parcialmente regras operacionais.
     *
     * Endpoint backend:
     * - PATCH /api/properties/{id}/rules
     */
    static async patchRules(id: number, patch: PropertyRulePatchRequest): Promise<PropertyRuleDTO> {
        try {
            const response = await propertiesAxios.patch<ApiResponse<PropertyRuleDTO>>(`/${id}/rules`, patch);
            notify.success("Regras atualizadas.");
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
     * Substitui a lista completa de regras de sazonalidade.
     *
     * Endpoint backend:
     * - PUT /api/properties/{id}/rules/seasonality
     */
    static async updateSeasonalityRules(id: number, rules: SeasonalityRuleDTO[]): Promise<SeasonalityRuleDTO[]> {
        try {
            const response = await propertiesAxios.put<ApiResponse<SeasonalityRuleDTO[]>>(`/${id}/rules/seasonality`, rules);
            notify.success("Sazonalidade atualizada.");
            return response.data.data;
        } catch (error) {
            this.handleError(error, "atualizar sazonalidade");
            throw error;
        }
    }

    /**
     * Cria uma regra de sazonalidade individual.
     *
     * Endpoint backend:
     * - POST /api/properties/{id}/rules/seasonality
     */
    static async createSeasonalityRule(id: number, rule: SeasonalityRuleDTO): Promise<SeasonalityRuleDTO> {
        try {
            const response = await propertiesAxios.post<ApiResponse<SeasonalityRuleDTO>>(`/${id}/rules/seasonality`, rule);
            notify.success("Regra de sazonalidade criada.");
            return response.data.data;
        } catch (error) {
            this.handleError(error, "criar regra de sazonalidade");
            throw error;
        }
    }

    /**
     * Atualiza parcialmente uma regra de sazonalidade.
     *
     * Endpoint backend:
     * - PATCH /api/properties/{id}/rules/seasonality/{ruleId}
     */
    static async patchSeasonalityRule(id: number, ruleId: number, patch: SeasonalityRulePatchRequest): Promise<SeasonalityRuleDTO> {
        try {
            const response = await propertiesAxios.patch<ApiResponse<SeasonalityRuleDTO>>(`/${id}/rules/seasonality/${ruleId}`, patch);
            notify.success("Regra de sazonalidade atualizada.");
            return response.data.data;
        } catch (error) {
            this.handleError(error, "atualizar regra de sazonalidade");
            throw error;
        }
    }

    /**
     * Remove uma regra de sazonalidade.
     *
     * Endpoint backend:
     * - DELETE /api/properties/{id}/rules/seasonality/{ruleId}
     */
    static async deleteSeasonalityRule(id: number, ruleId: number): Promise<void> {
        try {
            await propertiesAxios.delete<void>(`/${id}/rules/seasonality/${ruleId}`);
            notify.success("Regra de sazonalidade removida.");
        } catch (error) {
            this.handleError(error, "remover regra de sazonalidade");
            throw error;
        }
    }

    /**
     * Lista permissões (ACL) de uma propriedade.
     *
     * Endpoint backend:
     * - GET /api/properties/{id}/permissions
     */
    static async getPermissions(id: number): Promise<PropertyPermissionDTO[]> {
        try {
            const response = await propertiesAxios.get<ApiResponse<PropertyPermissionDTO[]>>(`/${id}/permissions`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "obter permissões");
            throw error;
        }
    }

    /**
     * Substitui a lista completa de permissões (ACL) de uma propriedade.
     *
     * Endpoint backend:
     * - PUT /api/properties/{id}/permissions
     */
    static async updatePermissions(
        id: number,
        permissions: PropertyPermissionDTO[]
    ): Promise<PropertyPermissionDTO[]> {
        try {
            const response = await propertiesAxios.put<ApiResponse<PropertyPermissionDTO[]>>(`/${id}/permissions`, permissions);
            notify.success("Permissões atualizadas.");
            return response.data.data;
        } catch (error) {
            this.handleError(error, "atualizar permissões");
            throw error;
        }
    }

    /**
     * Atualiza parcialmente a permissão de um utilizador numa propriedade.
     *
     * Endpoint backend:
     * - PATCH /api/properties/{id}/permissions/{userId}
     */
    static async patchPermission(id: number, userId: number, patch: PropertyPermissionPatchRequest): Promise<PropertyPermissionDTO> {
        try {
            const response = await propertiesAxios.patch<ApiResponse<PropertyPermissionDTO>>(`/${id}/permissions/${userId}`, patch);
            notify.success("Permissão atualizada.");
            return response.data.data;
        } catch (error) {
            this.handleError(error, "atualizar permissão");
            throw error;
        }
    }

    /**
     * Remove a permissão de um utilizador numa propriedade.
     *
     * Endpoint backend:
     * - DELETE /api/properties/{id}/permissions/{userId}
     */
    static async deletePermission(id: number, userId: number): Promise<void> {
        try {
            await propertiesAxios.delete<void>(`/${id}/permissions/${userId}`);
            notify.success("Permissão removida.");
        } catch (error) {
            this.handleError(error, "remover permissão");
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
            notify.success("Propriedade atualizada.");
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
            notify.success("Propriedade eliminada.");
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
                notify.error("Propriedade não encontrada.");
            } else {
                notify.error(`Erro ao ${action}. Tente novamente mais tarde.`);
            }
        } else {
            notify.error("Erro de conexão. Verifique a sua internet.");
        }
    }
}
