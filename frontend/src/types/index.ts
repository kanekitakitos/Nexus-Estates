/**
 * Barrel file para tipos partilhados do frontend.
 *
 * Uso recomendado:
 * - import type { BookingResponse, PropertyRuleDTO } from "@/types";
 *
 * Nota:
 * - Para evitar cycles, mantém este ficheiro apenas com exports.
 */
export * from "./auth";
export * from "./booking";
export * from "./finance";
export * from "./property";
export * from "./sync";
export * from "./amenity";
export * from "./integrations";
