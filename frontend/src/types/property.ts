/**
 * Tipos do módulo de propriedades (Properties).
 *
 * Origem backend (API Gateway):
 * - /api/properties (property-service)
 *
 * Nota:
 * - Os services expõem endpoints que devolvem ApiResponse<T> (wrapper comum do backend).
 */
export type PropertyRuleDTO = {
  checkInTime?: string;
  checkOutTime?: string;
  minNights?: number;
  maxNights?: number;
  bookingLeadTimeDays?: number;
  timezone?: string;
};

/**
 * Regra de sazonalidade (precificação dinâmica) devolvida pelo property-service.
 *
 * Notas:
 * - startDate/endDate: "YYYY-MM-DD"
 * - priceModifier: multiplicador (ex: 1.20 = +20%)
 */
export type SeasonalityRuleDTO = {
  id: number;
  startDate: string;
  endDate: string;
  priceModifier: number;
  dayOfWeek?: string | null;
  channel?: string | null;
};

/**
 * Pedido de cotação/validação (regras operacionais + sazonalidade).
 */
export type PropertyQuoteRequest = {
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
};

/**
 * Resultado da cotação/validação.
 *
 * Notas:
 * - valid=false pode incluir validationErrors com mensagens para UI.
 */
export type PropertyQuoteResponse = {
  valid: boolean;
  totalPrice?: number | null;
  currency?: string | null;
  validationErrors?: string[];
};

/**
 * Estrutura de paginação (Spring Data Page) usada em listagens com filtros.
 */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type PropertyListItem = {
  id: number;
  name: string;
  description?: Record<string, string> | null;
  location: string;
  city: string;
  address: string;
  basePrice: number;
  maxGuests: number;
  isActive: boolean;
};

export type PropertyStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE"

export interface PropertyPermission {
  email: string
  level: string
}

export interface OwnProperty {
  id: string
  title: string | { en: string; pt: string }
  description: string | { en: string; pt: string }
  location: string
  city: string
  address: string
  maxGuests: number
  price: number
  imageUrl: string
  status: PropertyStatus
  rating: number
  featured?: boolean
  tags: string[]
  amenityIds: number[]
  permissions?: PropertyPermission[]
  propertyRule?: PropertyRuleDTO
  seasonalityRules?: SeasonalityRuleDTO[]
}

export type WizardStep = 'essence' | 'location' | 'amenities' | 'permissions' | 'preview'

export type PropertyListVariant = "CARDS" | "BARS"

export interface Filters {
  queryNome: string
  queryLocal: string
  available: boolean
  booked: boolean
  maintenance: boolean
  minPrice: number | ""
  maxPrice: number | ""
  sortPrice: "sem filtro" | "crescente" | "decrescente"
}

/**
 * Payload de criação de propriedade.
 */
export type CreatePropertyRequest = {
  title: string;
  description: Record<string, string>;
  price: number;
  ownerId?: number;
  location: string;
  city: string;
  address: string;
  maxGuests: number;
  amenityIds: number[];
  imageUrl?: string;
};

/**
 * Payload de atualização parcial de uma propriedade (PATCH).
 */
export type UpdatePropertyRequest = Partial<{
  title: string | { en: string; pt: string };
  description: Record<string, string> | { en: string; pt: string };
  location: string;
  city: string;
  address: string;
  basePrice: number;
  maxGuests: number;
  isActive: boolean;
  imageUrl?: string;
  amenityIds?: number[];
}>;

export type PropertyImageUploadParams = {
  signature: string;
  timestamp: number;
  folder: string;
  api_key: string;
  cloud_name: string;
  upload_url: string;
  upload_preset?: string;
  expires_at?: number;
};

export type PropertyImageUploadErrorStage = "params" | "upload";

export type PropertyImageUploadErrorInfo = {
  stage: PropertyImageUploadErrorStage;
  status?: number;
  message: string;
};

/**
 * Payload “expandido” devolvido pelo backend (agrega sub-recursos).
 *
 * Nota:
 * - Mantido como Record<string, unknown> para não acoplar o frontend a estruturas internas
 *   enquanto o DTO do backend evolui.
 */
export type ExpandedPropertyResponse = Record<string, unknown>;
