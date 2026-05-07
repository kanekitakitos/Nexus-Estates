/**
 * @file index.ts
 * @author Nexus Estates team
 * @description Ponto de entrada do módulo de chat.
 *              Exporta os providers, componentes e estratégias principais.
 */

export { ChatProvider, useChatStrategy } from "./ChatProvider"
export * from "./components/chat-compact-sidebar"
export { chatTokens } from "./tokens"
