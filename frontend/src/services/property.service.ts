import { propertiesAxios, ApiResponse } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { BookingProperty } from "@/features/bookings/components/booking-card";
import { toast } from "sonner";

type PropertyTranslation = {
    pt?: string;
    en?: string;
};

type PropertyApiItem = {
    id: string | number;
    name?: string | PropertyTranslation;
    title?: string;
    description?: string | PropertyTranslation;
    address?: string;
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
 */
export class PropertyService {
    static async creatPropertie(property : PropertyApiItem):Promise<number>{
        try {
            const response = await propertiesAxios.post<ApiResponse<PropertyApiItem>>("", property)

            return response.status
        }catch (error) {
            this.handleError(error, "criar propriedade");
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
                return properties.map((p: PropertyApiItem) => ({
                    id: String(p.id),
                    title: typeof p.name === 'string' ? p.name : (p.name?.pt || p.name?.en || p.title || "Propriedade sem título"),
                    description: typeof p.description === 'string' ? p.description : (p.description?.pt || p.description?.en || ""),
                    location: p.address || p.location || "Localização não disponível",
                    price: p.basePrice || p.base_price || p.pricePerNight || p.price_per_night || 0,
                    imageUrl: p.imageUrl || p.image_url || "",
                    status: (p.status === "ACTIVE" || p.isActive === true || p.status === "AVAILABLE")
                      ? "AVAILABLE"
                      : (p.status === "MAINTENANCE" ? "MAINTENANCE" : "BOOKED"),
                    rating: p.rating || 0,
                    featured: p.featured || false,
                    tags: p.tags || []
                }));
            }
            return [];
        } catch (error) {
            this.handleError(error, "carregar propriedades");
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
