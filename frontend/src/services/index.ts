/**
 * @file index.ts
 * @author Nexus Estates team
 * @description Ponto de entrada (barrel file) para todos os serviços de integração com APIs do backend.
 *
 * Uso recomendado:
 * - import { PropertyService, BookingService } from "@/services"
 *
 * Nota: manter este ficheiro apenas com exports para reduzir ciclos.
 */
export * from "./auth.service";
export * from "./property.service";
export * from "./booking.service";
export * from "./finance.service";
export * from "./user.service";
export * from "./sync.service";
export * from "./amenity.service";
export * from "./integrations.service";
