/**
 * Tipos de integrações externas (credential vault).
 *
 * Origem backend (API Gateway):
 * - /api/users/integrations (user-service)
 *
 * Nota:
 * - O backend nunca devolve a API key em claro; só devolve apiKeyMasked.
 */
export type ExternalProviderName = "AIRBNB" | "BOOKING" | "VRBO" | "EXPEDIA" | string;

/**
 * DTO de leitura de integração externa.
 */
export type ExternalIntegrationDTO = {
  id: number;
  providerName: ExternalProviderName;
  apiKeyMasked: string;
  active: boolean;
};
