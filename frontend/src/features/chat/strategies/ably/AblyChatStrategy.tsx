"use client";

import React from "react";
import { ChatStrategy } from "../../chat-strategy";
import { AblyChatList } from "./components/AblyChatList";
import { AblyChatWindow } from "./components/AblyChatWindow";

/**
 * AblyChatStrategy
 *
 * Convenções de chatId suportadas:
 * - booking:{bookingId}  → canal Ably booking-chat:{bookingId}
 * - inquiry:{inquiryId}  → canal Ably inquiry-chat:{inquiryId}
 *
 * Nota crítica de consistência:
 * - O frontend não publica diretamente no Ably.
 * - Envia sempre via sync-service (persistência primeiro, publish depois).
 */
// --- 1. Global Provider ---

const AblyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// --- Strategy Implementation ---

const AblyChatStrategy: ChatStrategy = {
  name: "ably",
  Provider: AblyProvider,
  ChatList: AblyChatList,
  ChatWindow: ({ chatId, onBack }) => <AblyChatWindow chatId={chatId} onBack={onBack} />,
};

export default AblyChatStrategy;
