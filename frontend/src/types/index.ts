/**
 * @file index.ts
 * @author Nexus Estates team
 * @description Barrel file para tipos partilhados do frontend. Centraliza os exports da pasta types.
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
export * from "./calendar";