/**
 * Tipos do módulo de sincronização e chat (Sync Service).
 *
 * Origem backend (API Gateway):
 * - /api/sync (sync-service)
 */
export interface SyncMessage {
  id: string | number;
  senderId: string;
  content: string;
  createdAt: string;
}

export type WebhookSubscription = {
  id: number
  targetUrl: string
  isActive: boolean
  subscribedEvents: string
}

export type CreateWebhookSubscriptionRequest = {
  targetUrl: string
  subscribedEvents: string[]
}

export type CreatedWebhookSubscription = {
  id: number
  secret: string
}
