"use client";

import React from "react";
import { Input } from "@/components/ui/forms/input";
import { chatTokens } from "@/features/chat/tokens";
import { ChatListItemButton } from "./ChatListItemButton";
import { useChatListData } from "../hooks/useChatListData";

export const AblyChatList: React.FC<{ onSelectChat: (chatId: string) => void; selectedChatId?: string }> = ({
  onSelectChat,
  selectedChatId,
}) => {
  const { query, setQuery, isLoading, propertyMeta, filtered } = useChatListData();

  return (
    <div className="flex flex-col w-full">
      <div className="p-3 border-b">
        <Input
          variant="brutal"
          placeholder={chatTokens.copy.ui.list.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="p-4 text-sm text-muted-foreground">{chatTokens.copy.ui.list.loading}</div>
      ) : filtered.bookings.length === 0 && filtered.conversations.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">{chatTokens.copy.ui.list.empty}</div>
      ) : (
        <>
          {filtered.bookings.map((b) => {
            const id = `booking:${b.id}`;
            const meta = propertyMeta[Number(b.propertyId)];
            const title = meta?.title ?? `Property ${b.propertyId}`;
            const subtitle = `${meta?.location ? `${meta.location} · ` : ""}${chatTokens.copy.ui.list.bookingPrefix}${b.id}`;
            return (
              <ChatListItemButton
                key={id}
                id={id}
                title={title}
                subtitle={subtitle}
                rightLabel={b.status}
                selected={selectedChatId === id}
                onSelect={onSelectChat}
              />
            );
          })}

          {filtered.conversations.map((c) => {
            const id = c.chatId || `inquiry:${c.inquiryId}`;
            const meta = propertyMeta[Number(c.propertyId)];
            const title = meta?.title ?? `Property ${c.propertyId}`;
            const subtitle = `${meta?.location ? `${meta.location} · ` : ""}Inquiry #${c.inquiryId}`;
            return (
              <ChatListItemButton
                key={id}
                id={id}
                title={title}
                subtitle={subtitle}
                rightLabel="PROPERTY"
                selected={selectedChatId === id}
                onSelect={onSelectChat}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

