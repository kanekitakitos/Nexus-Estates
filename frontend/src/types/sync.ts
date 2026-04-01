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
