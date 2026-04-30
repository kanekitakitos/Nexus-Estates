"use client";

import React from "react";
import * as Ably from "ably";
import { ChatStrategy } from "../../chat-strategy";
import { ChatHeader, ChatFooter, ChatMessageList, initials } from "@/features/chat/ui";
import { Input } from "@/components/ui/forms/input";
import { BookingService, type BookingResponse } from "@/services/booking.service";
import { SyncService } from "@/services/sync.service";
import { AuthService } from "@/services/auth.service";
import { notify } from "@/lib/notify";
import { chatTokens } from "@/features/chat/tokens";
import { PropertyService } from "@/services/property.service";

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

type PropertyMeta = {
  title: string;
  location: string;
};

function resolvePropertyMeta(p: unknown, fallbackId: number): PropertyMeta {
  const anyP = p as Record<string, unknown>;
  const rawName = anyP["name"];
  const rawTitle = anyP["title"];

  const title =
    (typeof rawName === "string" && rawName.trim()) ||
    (typeof rawTitle === "string" && rawTitle.trim()) ||
    (typeof rawName === "object" && rawName !== null
      ? String((rawName as Record<string, unknown>)["pt"] || (rawName as Record<string, unknown>)["en"] || "")
      : "") ||
    `Property ${fallbackId}`;

  const location =
    (typeof anyP["address"] === "string" && anyP["address"]) ||
    (typeof anyP["location"] === "string" && anyP["location"]) ||
    (typeof anyP["city"] === "string" && anyP["city"]) ||
    "";

  return { title, location };
}

const AblyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// --- 2. Chat List Component (Sidebar) ---

const AblyChatList: React.FC<{ onSelectChat: (chatId: string) => void, selectedChatId?: string }> = ({ onSelectChat, selectedChatId }) => {
  const [query, setQuery] = React.useState("");
  const [bookings, setBookings] = React.useState<BookingResponse[]>([]);
  const [inquiries, setInquiries] = React.useState<Array<{ chatId: string; inquiryId: number; propertyId: number }>>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [propertyMeta, setPropertyMeta] = React.useState<Record<number, PropertyMeta>>({});
  const propertyMetaRef = React.useRef<Record<number, PropertyMeta>>({});

  React.useEffect(() => {
    const load = async () => {
      if (!AuthService.getSession().isAuthenticated) return;

      try {
        setIsLoading(true);
        const [b, c] = await Promise.all([
          BookingService.getMyBookings().catch(() => []),
          SyncService.listMyConversations().catch(() => []),
        ]);
        setBookings(b);
        setInquiries(c.map((x) => ({ chatId: x.chatId, inquiryId: x.inquiryId, propertyId: x.propertyId })));

        const propertyIds = Array.from(
          new Set<number>([
            ...b.map((x) => Number(x.propertyId)).filter((n) => Number.isFinite(n)),
            ...c.map((x) => Number(x.propertyId)).filter((n) => Number.isFinite(n)),
          ]),
        );

        const missing = propertyIds.filter((id) => propertyMetaRef.current[id] == null);
        if (missing.length > 0) {
          const pairs = await Promise.all(
            missing.map(async (id) => {
              try {
                const data = await PropertyService.getPropertyById(id);
                return [id, resolvePropertyMeta(data, id)] as const;
              } catch {
                return [id, { title: `Property ${id}`, location: "" }] as const;
              }
            }),
          );

          setPropertyMeta((prev) => {
            const next = { ...prev };
            for (const [id, meta] of pairs) next[id] = meta;
            propertyMetaRef.current = next;
            return next;
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim();
    if (!q) return { bookings, inquiries };
    return {
      bookings: bookings.filter((b) => String(b.id).includes(q) || String(b.propertyId).includes(q)),
      inquiries: inquiries.filter((i) => String(i.inquiryId).includes(q) || String(i.propertyId).includes(q)),
    };
  }, [bookings, inquiries, query]);

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
      ) : filtered.bookings.length === 0 && filtered.inquiries.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">{chatTokens.copy.ui.list.empty}</div>
      ) : (
        <>
          {filtered.bookings.map((b) => {
            const id = `booking:${b.id}`;
            const meta = propertyMeta[Number(b.propertyId)];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectChat(id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left border-b hover:bg-sidebar-accent transition-colors ${
                  selectedChatId === id ? "bg-sidebar-accent" : ""
                }`}
              >
                <div className="shrink-0">
                  <div className="size-9 rounded-full overflow-hidden bg-secondary grid place-items-center">
                    <span className="text-xs font-medium">{initials(`${chatTokens.copy.ui.list.bookingInitialsPrefix}${b.id}`)}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium flex items-center gap-2">
                      <span className="truncate">{meta?.title ?? `Property ${b.propertyId}`}</span>
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">{b.status}</span>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {meta?.location ? `${meta.location} · ` : ""}
                    {chatTokens.copy.ui.list.bookingPrefix}
                    {b.id}
                  </span>
                </div>
              </button>
            );
          })}

          {filtered.inquiries.map((i) => {
            const id = i.chatId || `inquiry:${i.inquiryId}`;
            const meta = propertyMeta[Number(i.propertyId)];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectChat(id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left border-b hover:bg-sidebar-accent transition-colors ${
                  selectedChatId === id ? "bg-sidebar-accent" : ""
                }`}
              >
                <div className="shrink-0">
                  <div className="size-9 rounded-full overflow-hidden bg-secondary grid place-items-center">
                    <span className="text-xs font-medium">{initials(`I${i.inquiryId}`)}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium flex items-center gap-2">
                      <span className="truncate">{meta?.title ?? `Property ${i.propertyId}`}</span>
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">PROPERTY</span>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {meta?.location ? `${meta.location} · ` : ""}
                    Inquiry #{i.inquiryId}
                  </span>
                </div>
              </button>
            );
          })}
        </>
      )}
    </div>
  );
};

// --- 3. Chat Window Component ---

const AblyChatWindow: React.FC<{ chatId: string; onBack?: () => void }> = ({ chatId, onBack }) => {
  const [messages, setMessages] = React.useState<Array<{ id: string | number; text: string; time?: string; from: "me" | "them" }>>([]);
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);
  const [headerMeta, setHeaderMeta] = React.useState<{ title: string; location: string } | null>(null);

  const ablyRef = React.useRef<Ably.Realtime | null>(null);
  const channelRef = React.useRef<Ably.RealtimeChannel | null>(null);

  const mySenderId = React.useMemo(() => {
    const session = AuthService.getSession();
    return session.userId || session.email || null;
  }, []);

  const parsed = React.useMemo(() => {
    const [kind, raw] = chatId.includes(":") ? chatId.split(":", 2) : ["booking", chatId];
    if (kind === "inquiry") return { kind: "inquiry" as const, id: raw };
    return { kind: "booking" as const, id: raw };
  }, [chatId]);

  const channelId = React.useMemo(() => {
    return parsed.kind === "inquiry" ? `inquiry-chat:${parsed.id}` : `booking-chat:${parsed.id}`;
  }, [parsed.id, parsed.kind]);

  React.useEffect(() => {
    let cancelled = false;
    const loadMeta = async () => {
      try {
        if (parsed.kind === "booking") {
          const booking = await BookingService.getBookingById(Number(parsed.id));
          const property = await PropertyService.getPropertyById(booking.propertyId);
          const meta = resolvePropertyMeta(property, booking.propertyId);
          if (!cancelled) setHeaderMeta(meta);
          return;
        }

        const conversations = await SyncService.listMyConversations();
        const inquiryId = Number(parsed.id);
        const convo = conversations.find((c) => Number(c.inquiryId) === inquiryId);
        if (!convo) {
          if (!cancelled) setHeaderMeta({ title: `Inquiry ${parsed.id}`, location: "" });
          return;
        }
        const property = await PropertyService.getPropertyById(convo.propertyId);
        const meta = resolvePropertyMeta(property, convo.propertyId);
        if (!cancelled) setHeaderMeta(meta);
      } catch {
        if (!cancelled) setHeaderMeta({ title: parsed.kind === "booking" ? `Booking ${parsed.id}` : `Inquiry ${parsed.id}`, location: "" });
      }
    };

    void loadMeta();
    return () => {
      cancelled = true;
    };
  }, [parsed.id, parsed.kind]);

  React.useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      try {
        setIsConnecting(true);
        setIsReady(false);

        const ablyClient = new Ably.Realtime({
          authCallback: async (_params, callback) => {
            try {
              const tokenDetails = await SyncService.getRealtimeToken(
                parsed.kind === "inquiry"
                  ? { inquiryId: parsed.id }
                  : { bookingId: parsed.id }
              );
              callback(null, tokenDetails as unknown as Ably.TokenDetails);
            } catch {
              callback(new Ably.ErrorInfo(chatTokens.copy.errors.realtimeToken, 50000, 500), null);
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

        const history = parsed.kind === "inquiry"
          ? await SyncService.getInquiryMessages(parsed.id)
          : await SyncService.getBookingMessages(parsed.id);
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
        notify.error(chatTokens.copy.errors.startChat);
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
  }, [channelId, mySenderId, parsed.id, parsed.kind]);

  const onSend = React.useCallback(
    async (text: string) => {
      if (!isReady || !mySenderId) return;
      try {
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
              time: new Date(saved.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              from: "me",
            },
          ];
        });
      } catch {
        notify.error(chatTokens.copy.errors.sendMessage);
      }
    },
    [isReady, mySenderId, parsed.id, parsed.kind]
  );

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <ChatHeader
        name={headerMeta?.title ?? (parsed.kind === "inquiry" ? `Inquiry ${parsed.id}` : `${chatTokens.copy.ui.list.bookingPrefix}${parsed.id}`)}
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

// --- Strategy Implementation ---

const AblyChatStrategy: ChatStrategy = {
  name: "ably",
  Provider: AblyProvider,
  ChatList: AblyChatList,
  ChatWindow: ({ chatId, onBack }) => <AblyChatWindow chatId={chatId} onBack={onBack} />,
};

export default AblyChatStrategy;
