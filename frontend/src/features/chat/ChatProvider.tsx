/**
 * @file ChatProvider.tsx
 * @author Nexus Estates team
 * @description Injeta a estratégia de chat escolhida (ex: Ably) na aplicação.
 *              É responsável por instanciar a estratégia ativa e expô-la através do Contexto React.
 */

"use client";

import React from "react";
import AblyChatStrategy from "./strategies/ably";
export * from "./ui";
export * from "./chat-strategy";

// Provider/Strategy atual: Ably. Para trocar, importe outra strategy e atualize aqui.
const currentStrategy = AblyChatStrategy;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const Provider = currentStrategy.Provider;
  return <Provider>{children}</Provider>;
}

export function useChatStrategy() {
  return currentStrategy;
}
