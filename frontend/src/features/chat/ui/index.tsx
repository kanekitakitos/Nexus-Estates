"use client";

import React from "react";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Avatar as UiAvatar, AvatarImage, AvatarFallback } from "@/components/ui/data-display/avatar";
import { ArrowLeft } from "lucide-react";
import { chatTokens } from "@/features/chat/tokens";

export const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const ChatHeader: React.FC<{
  name: string;
  avatarUrl?: string;
  status?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}> = ({ name, avatarUrl, status, onBack, rightSlot }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b">
    {onBack && (
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onBack}
        aria-label={chatTokens.copy.ui.header.backAriaLabel}
      >
        <ArrowLeft className="size-4" />
      </Button>
    )}
    <UiAvatar>
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </UiAvatar>
    <div className="flex flex-col">
      <span className="text-sm font-medium">{name}</span>
      {status ? <span className="text-xs text-muted-foreground">{status}</span> : null}
    </div>
    <div className="ml-auto">{rightSlot}</div>
  </div>
);

export const ChatMessageBubble: React.FC<{
  text: string;
  time?: string;
  from: "me" | "them";
}> = ({ text, time, from }) => {
  const isMe = from === "me";
  return (
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground border"
        }`}
      >
        <div>{text}</div>
        {time ? (
          <div className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{time}</div>
        ) : null}
      </div>
    </div>
  );
};

export const ChatMessageList: React.FC<{
  messages: Array<{ id: string | number; text: string; time?: string; from: "me" | "them" }>;
}> = ({ messages }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
    {messages.map((m) => (
      <ChatMessageBubble key={m.id} text={m.text} time={m.time} from={m.from} />
    ))}
  </div>
);

export const ChatFooter: React.FC<{
  placeholder?: string;
  disabled?: boolean;
  onSend?: (text: string) => void;
}> = ({ placeholder = chatTokens.copy.ui.composer.messagePlaceholder, disabled, onSend }) => {
  const [text, setText] = React.useState("");

  const send = () => {
    if (!text.trim() || disabled) return;
    onSend?.(text.trim());
    setText("");
  };

  return (
    <div className="border-t p-3 flex gap-2">
      <Input
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") send();
        }}
        disabled={disabled}
        className="flex-1"
      />
      <Button onClick={send} disabled={disabled}>
        {chatTokens.copy.ui.composer.sendButton}
      </Button>
    </div>
  );
};
