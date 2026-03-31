/**
 * Tipos do catálogo de comodidades (Amenities).
 *
 * Origem backend (API Gateway):
 * - /api/amenities (property-service)
 */
export type Amenity = {
  id: number;
  name: string;
  category: string;
};
