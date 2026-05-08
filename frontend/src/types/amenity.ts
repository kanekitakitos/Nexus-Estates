/**
 * @file amenity.ts
 * @author Nexus Estates team
 * @description Tipos do catálogo de comodidades (Amenities).
 *              Usados em todo o frontend para definir e tipar objetos de comodidades de propriedades.
 *
 * Origem backend (API Gateway):
 * - /api/amenities (property-service)
 */
export type Amenity = {
  id: number;
  name: string;
  category: string;
};
