"use client";

import React from "react";
import * as Ably from "ably";
import { SyncService } from "@/services/sync.service";
import { notify } from "@/lib/notify";
import { chatTokens } from "@/features/chat/tokens";
import type { ParsedChatId } from "../ably-chat.types";
import { formatTime, toUiMessage } from "../ably-chat.utils";

export function useAblyRealtimeChat(args: { parsed: ParsedChatId; channelId: string | null; mySenderId: string | null }) {
  const { parsed, channelId, mySenderId } = args;

  const [messages, setMessages] = React.useState<Array<{ id: string | number; text: string; time?: string; from: "me" | "them" }>>([]);
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);

  const ablyRef = React.useRef<Ably.Realtime | null>(null);
  const channelRef = React.useRef<Ably.RealtimeChannel | null>(null);
  const connectAttemptRef = React.useRef(0);

  React.useEffect(() => {
    let cancelled = false;
    const attemptId = ++connectAttemptRef.current;
    const isStale = () => cancelled || attemptId !== connectAttemptRef.current;

    const connect = async () => {
      try {
        if (parsed.kind === "property") {
          if (!isStale()) {
            setMessages([]);
            setIsConnecting(false);
            setIsReady(true);
          }
          return;
        }

        if (!channelId) throw new Error("Missing channelId");

        if (!isStale()) {
          setMessages([]);
          setIsConnecting(true);
          setIsReady(false);
        }

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

        if (isStale()) {
          ablyClient.close();
          return;
        }

        ablyRef.current = ablyClient;
        const channel = ablyClient.channels.get(channelId);
        channelRef.current = channel;

        const waitConnected = () =>
          new Promise<void>((resolve, reject) => {
            if (ablyClient.connection.state === "connected") {
              resolve();
              return;
            }
            const onConnected = () => {
              cleanup();
              resolve();
            };
            const onFailed = () => {
              cleanup();
              if (isStale()) resolve();
              else reject(new Error("Connection failed"));
            };
            const onClosed = () => {
              cleanup();
              if (isStale()) resolve();
              else reject(new Error("Connection closed"));
            };
            const cleanup = () => {
              ablyClient.connection.off("connected", onConnected);
              ablyClient.connection.off("failed", onFailed);
              ablyClient.connection.off("closed", onClosed);
            };
            ablyClient.connection.on("connected", onConnected);
            ablyClient.connection.on("failed", onFailed);
            ablyClient.connection.on("closed", onClosed);
          });

        await waitConnected();
        if (isStale()) return;
        if (ablyClient.connection.state !== "connected") throw new Error("Connection not connected");

        await channel.attach();
        if (isStale()) return;

        const history = parsed.kind === "inquiry"
          ? await SyncService.getInquiryMessages(parsed.id)
          : await SyncService.getBookingMessages(parsed.id);
        if (isStale()) return;

        setMessages(history.map((m) => toUiMessage(m, mySenderId)));

        channel.subscribe("new-message", (msg) => {
          const data = msg.data as { id?: string | number; senderId?: string; content?: string; createdAt?: string };
          const id = data.id ?? `${msg.id ?? Date.now()}`;
          const senderId = data.senderId ?? "unknown";
          const text = data.content ?? "";
          const createdAt = data.createdAt ?? new Date().toISOString();

          setMessages((prev) => {
            if (prev.some((m) => String(m.id) === String(id))) return prev;
            return [
              ...prev,
              {
                id,
                text,
                time: formatTime(createdAt),
                from: mySenderId != null && String(senderId) === String(mySenderId) ? "me" : "them",
              },
            ];
          });
        });

        if (!isStale()) setIsReady(true);
      } catch (e) {
        if (isStale()) return;
        console.error("Erro ao iniciar chat Ably:", e);
        notify.error(chatTokens.copy.errors.startChat);
      } finally {
        if (!isStale()) setIsConnecting(false);
      }
    };

    void connect();

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

  return { messages, setMessages, isConnecting, isReady };
}

