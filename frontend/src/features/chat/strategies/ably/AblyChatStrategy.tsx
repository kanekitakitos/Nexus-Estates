"use client";

import React from "react";
import * as Ably from "ably";
import { ChatStrategy } from "../../chat-strategy";
import { ChatHeader, ChatFooter, ChatMessageList, initials } from "@/features/chat/ui";
import { Input } from "@/components/ui/forms/input";
import { BookingService, type BookingResponse } from "@/services/booking.service";
import { SyncService } from "@/services/sync.service";
import { toast } from "sonner";

// --- 1. Global Provider ---

const AblyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// --- 2. Chat List Component (Sidebar) ---

const AblyChatList: React.FC<{ onSelectChat: (chatId: string) => void, selectedChatId?: string }> = ({ onSelectChat, selectedChatId }) => {
  const [query, setQuery] = React.useState("");
  const [bookings, setBookings] = React.useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      if (typeof window === "undefined") return;
      if (!localStorage.getItem("token")) return;

      try {
        setIsLoading(true);
        const data = await BookingService.getMyBookings();
        setBookings(data);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim();
    if (!q) return bookings;
    return bookings.filter((b) => String(b.id).includes(q) || String(b.propertyId).includes(q));
  }, [bookings, query]);

  return (
    <div className="flex flex-col w-full">
      <div className="p-3 border-b">
        <Input
          variant="brutal"
          placeholder="Pesquisar por bookingId ou propertyId…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="p-4 text-sm text-muted-foreground">A carregar conversas…</div>
      ) : filtered.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">Sem conversas disponíveis.</div>
      ) : (
        filtered.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelectChat(String(b.id))}
            className={`flex w-full items-start gap-3 px-4 py-3 text-left border-b hover:bg-sidebar-accent transition-colors ${
              selectedChatId === String(b.id) ? "bg-sidebar-accent" : ""
            }`}
          >
            <div className="shrink-0">
              <div className="size-9 rounded-full overflow-hidden bg-secondary grid place-items-center">
                <span className="text-xs font-medium">{initials(`B ${b.id}`)}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex w-full items-center justify-between">
                <span className="font-medium flex items-center gap-2">
                  <span className="truncate">Booking #{b.id}</span>
                </span>
                <span className="text-xs text-muted-foreground shrink-0">{b.status}</span>
              </div>
              <span className="text-xs text-muted-foreground line-clamp-1">
                Property {b.propertyId} · {b.checkInDate} → {b.checkOutDate}
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  );
};

// --- 3. Chat Window Component ---

const AblyBookingChatWindow: React.FC<{ bookingId: string; onBack?: () => void }> = ({ bookingId, onBack }) => {
  const [messages, setMessages] = React.useState<Array<{ id: string | number; text: string; time?: string; from: "me" | "them" }>>([]);
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);

  const ablyRef = React.useRef<Ably.Realtime | null>(null);
  const channelRef = React.useRef<Ably.RealtimeChannel | null>(null);

  const mySenderId = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userId") || localStorage.getItem("userEmail");
  }, []);

  const channelId = React.useMemo(() => `booking-chat:${bookingId}`, [bookingId]);

  React.useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      try {
        setIsConnecting(true);
        setIsReady(false);

        const ablyClient = new Ably.Realtime({
          authCallback: async (_params, callback) => {
            try {
              const tokenDetails = await SyncService.getRealtimeToken(bookingId);
              callback(null, tokenDetails as unknown as Ably.TokenDetails);
            } catch {
              callback(new Ably.ErrorInfo("Falha ao obter token Ably.", 50000, 500), null);
            }
          },
        });

        if (cancelled) {
          ablyClient.close();
          return;
        }

        ablyRef.current = ablyClient;
        const channel = ablyClient.channels.get(channelId);
        channelRef.current = channel;

        const history = await SyncService.getBookingMessages(bookingId);
        if (!cancelled && history.length > 0) {
          const mapped = history.map((m) => {
            const isMe = mySenderId && String(m.senderId) === String(mySenderId);
            return {
              id: m.id,
              text: m.content,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              from: isMe ? "me" : "them",
            } as const;
          });
          setMessages(mapped);
        }

        channel.subscribe("new-message", (msg) => {
          const data = msg.data as { id?: string | number; senderId?: string; content?: string; createdAt?: string };
          const id = data.id ?? `${msg.id ?? Date.now()}`;
          const senderId = data.senderId ?? "unknown";
          const isMe = mySenderId && String(senderId) === String(mySenderId);
          const text = data.content ?? "";
          const createdAt = data.createdAt ?? new Date().toISOString();

          setMessages((prev) => {
            if (prev.some((m) => String(m.id) === String(id))) return prev;
            return [
              ...prev,
              {
                id,
                text,
                time: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                from: isMe ? "me" : "them",
              },
            ];
          });
        });

        setIsReady(true);
      } catch (e) {
        console.error("Erro ao iniciar chat Ably:", e);
        toast.error("Não foi possível iniciar o chat.");
      } finally {
        setIsConnecting(false);
      }
    };

    connect();

    return () => {
      cancelled = true;
      try {
        channelRef.current?.unsubscribe();
      } catch {}
      channelRef.current = null;
      try {
        ablyRef.current?.close();
      } catch {}
      ablyRef.current = null;
    };
  }, [bookingId, channelId, mySenderId]);

  const onSend = React.useCallback(
    (text: string) => {
      if (!isReady || !channelRef.current || !mySenderId) return;

      const optimisticId =
        typeof globalThis.crypto?.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const optimistic = {
        id: optimisticId,
        senderId: String(mySenderId),
        content: text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        {
          id: optimistic.id,
          text: optimistic.content,
          time: new Date(optimistic.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          from: "me",
        },
      ]);

      channelRef.current
        .publish("new-message", optimistic)
        .catch(() => toast.error("Falha ao enviar mensagem."));
    },
    [isReady, mySenderId]
  );

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <ChatHeader name={`Booking #${bookingId}`} status={isConnecting ? "A ligar..." : "Online"} onBack={onBack} />
      {isConnecting ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ChatMessageList messages={messages} />
      )}
      <ChatFooter disabled={!isReady} placeholder={isReady ? "Mensagem" : "A ligar..."} onSend={onSend} />
    </div>
  );
};

// --- Strategy Implementation ---

const AblyChatStrategy: ChatStrategy = {
  name: "ably",
  Provider: AblyProvider,
  ChatList: AblyChatList,
  ChatWindow: ({ chatId, onBack }) => <AblyBookingChatWindow bookingId={chatId} onBack={onBack} />,
};

export default AblyChatStrategy;
