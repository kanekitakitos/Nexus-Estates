import type { ParsedChatId, UiChatMessage } from "./ably-chat.types";

export type PropertyMeta = {
  title: string;
  location: string;
};

export function resolvePropertyMeta(p: unknown, fallbackId: number): PropertyMeta {
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

export function parseChatId(chatId: string): ParsedChatId {
  const [kindRaw, raw] = chatId.includes(":") ? chatId.split(":", 2) : ["booking", chatId];
  if (kindRaw === "inquiry") return { kind: "inquiry", id: raw };
  if (kindRaw === "property") return { kind: "property", id: raw };
  return { kind: "booking", id: raw };
}

export function resolveChannelId(parsed: ParsedChatId): string | null {
  if (parsed.kind === "property") return null;
  return parsed.kind === "inquiry" ? `inquiry-chat:${parsed.id}` : `booking-chat:${parsed.id}`;
}

export function formatTime(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function toUiMessage(
  m: { id: string | number; content: string; createdAt: string; senderId: string | number },
  mySenderId: string | null
): UiChatMessage {
  const isMe = mySenderId != null && String(m.senderId) === String(mySenderId);
  return {
    id: m.id,
    text: m.content,
    time: formatTime(m.createdAt),
    from: isMe ? "me" : "them",
  };
}

