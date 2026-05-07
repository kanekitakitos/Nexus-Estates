"use client";

import React from "react";
import { ChatHeader, ChatFooter, ChatMessageList } from "@/features/chat/ui";
import { SyncService } from "@/services/sync.service";
import { AuthService } from "@/services/auth.service";
import { notify } from "@/lib/notify";
import { chatTokens } from "@/features/chat/tokens";
import { useAblyRealtimeChat } from "../hooks/useAblyRealtimeChat";
import { useChatHeaderMeta } from "../hooks/useChatHeaderMeta";
import { formatTime, parseChatId, resolveChannelId } from "../ably-chat.utils";

export const AblyChatWindow: React.FC<{ chatId: string; onBack?: () => void }> = ({ chatId, onBack }) => {
  const mySenderId = React.useMemo(() => {
    const session = AuthService.getSession();
    return session.userId || session.email || null;
  }, []);

  const parsed = React.useMemo(() => {
    return parseChatId(chatId);
  }, [chatId]);

  const channelId = React.useMemo(() => {
    return resolveChannelId(parsed);
  }, [parsed]);

  const headerMeta = useChatHeaderMeta(parsed);
  const { messages, setMessages, isConnecting, isReady } = useAblyRealtimeChat({ parsed, channelId, mySenderId });

  const onSend = React.useCallback(
    async (text: string) => {
      if (!isReady || !mySenderId) return;
      try {
        if (parsed.kind === "property") {
          const propertyId = Number(parsed.id);
          const created = await SyncService.sendFirstPropertyMessage(propertyId, { content: text });
          window.dispatchEvent(new CustomEvent("open-chat", { detail: { chatId: created.chatId } }));
          return;
        }

        const saved = parsed.kind === "inquiry"
          ? await SyncService.sendInquiryMessage(parsed.id, { content: text })
          : await SyncService.sendMessage(parsed.id, { content: text });

        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(saved.id))) return prev;
          return [
            ...prev,
            {
              id: saved.id,
              text: saved.content,
              time: formatTime(saved.createdAt),
              from: "me",
            },
          ];
        });
      } catch {
        notify.error(chatTokens.copy.errors.sendMessage);
      }
    },
    [isReady, mySenderId, parsed.id, parsed.kind, setMessages]
  );

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <ChatHeader
        name={
          headerMeta?.title ??
          (parsed.kind === "property"
            ? `Property ${parsed.id}`
            : parsed.kind === "inquiry"
              ? `Inquiry ${parsed.id}`
              : `${chatTokens.copy.ui.list.bookingPrefix}${parsed.id}`)
        }
        subtitle={headerMeta?.location || undefined}
        status={isConnecting ? chatTokens.copy.ui.header.statusConnecting : chatTokens.copy.ui.header.statusOnline}
        onBack={onBack}
      />
      {isConnecting ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ChatMessageList messages={messages} />
      )}
      <ChatFooter
        disabled={!isReady}
        placeholder={isReady ? chatTokens.copy.ui.composer.messagePlaceholder : chatTokens.copy.ui.header.statusConnecting}
        onSend={onSend}
      />
    </div>
  );
};
