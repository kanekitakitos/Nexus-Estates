import { propertiesAxios } from "@/lib/axiosAPI";
import { BookingProperty } from "@/features/bookings/components/booking-card";
import { toast } from "sonner";

/**
 * Serviço responsável por encapsular todas as chamadas à API relacionadas com Propriedades.
 * Isto facilita a manutenção, testes e reutilização de código em diferentes componentes.
 */
export class PropertyService {
    
    /**
     * Obtém a lista de todas as propriedades e mapeia-as para o formato esperado pelo frontend.
     * 
     * @returns Uma promessa que resolve para um array de BookingProperty
     */
    static async getAllProperties(): Promise<BookingProperty[]> {
        try {
            const response = await propertiesAxios.get("/search");
            
            return response.data.map((p: any) => ({
                id: p.id,
                title: typeof p.name === 'string' ? p.name : (p.name?.pt || p.name?.en || p.title || "Propriedade sem título"),
                description: typeof p.description === 'string' ? p.description : (p.description?.pt || p.description?.en || ""),
                location: p.address || p.location || "Localização não disponível",
                price: p.basePrice || p.base_price || p.pricePerNight || p.price_per_night || 0,
                imageUrl: p.imageUrl || p.image_url || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
                status: (p.status === "ACTIVE" || p.isActive) ? "AVAILABLE" : (p.status || "UNAVAILABLE"),
                rating: p.rating || 0,
                featured: p.featured || false,
                tags: p.tags || []
            }));
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
            const response = await propertiesAxios.get(`/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter detalhes da propriedade");
            throw error;
        }
    }

    /**
     * Tratamento centralizado de erros para o serviço de propriedades.
     */
    private static handleError(error: any, action: string): void {
        console.error(`Erro ao ${action}:`, error);
        if (error.response) {
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
