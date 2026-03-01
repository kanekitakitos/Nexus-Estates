"use client";

import React from "react";
import * as Ably from "ably";
import { ChatClient } from "@ably/chat";
import { ChatClientProvider, ChatRoomProvider } from "@ably/chat/react";
import {
  ThemeProvider,
  AvatarProvider,
  ChatSettingsProvider,
  ChatWindow,
  RoomInfo,
} from "@ably/chat-react-ui-kit";
import { ChatStrategy } from "../../chat-strategy";
import { ChatHeader, ChatFooter, ChatMessageList, initials } from "@/features/chat/ui";
import { Input } from "@/components/ui/forms/input";

// Estratégia Ably (pluggable). Inclui modo demo quando não há chave configurada.

const ChatReadyContext = React.createContext(false);

// --- 1. Global Provider ---

/**
 * Provider global para a estratégia Ably.
 * Inicializa o cliente Ably e fornece o contexto necessário para os componentes filhos.
 * Se a chave da API não estiver configurada, renderiza os filhos sem o contexto do chat (modo fallback).
 */
const AblyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Usa estado para inicializar o cliente apenas uma vez e apenas no lado do cliente
  const [client, setClient] = React.useState<ChatClient | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ABLY_API_KEY) {
        const ablyClient = new Ably.Realtime({
            key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
            clientId: "user-id-placeholder", // TODO: Substituir pelo ID real do utilizador do contexto de autenticação
        });
        setClient(new ChatClient(ablyClient));
    }
  }, []);

  if (!process.env.NEXT_PUBLIC_ABLY_API_KEY) {
      console.warn("Ably API Key is missing. Chat features will be disabled.");
      return <>{children}</>;
  }

  if (!client) {
      return (
        <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
  }

  return (
    <ThemeProvider>
      <AvatarProvider>
        <ChatSettingsProvider>
          <ChatClientProvider client={client}>
            <ChatReadyContext.Provider value={true}>
              {children}
            </ChatReadyContext.Provider>
          </ChatClientProvider>
        </ChatSettingsProvider>
      </AvatarProvider>
    </ThemeProvider>
  );
};

// --- 2. Chat List Component (Sidebar) ---

// Dados simulados para demonstração da lista de chats
const oneToOneRooms = [
  { id: "room-1", name: "Rui Costa", display: "Rui Costa", avatarUrl: "/avatars/rui.jpg", lastMessage: "Olá! Como posso ajudar?", time: "10:30", unread: true },
  { id: "room-2", name: "Ana Silva", display: "Ana Silva", avatarUrl: "/avatars/ana.jpg", lastMessage: "Enviámos a proposta ontem.", time: "Ontem", unread: false },
];

/**
 * Componente que lista os chats disponíveis usando dados simulados ou reais do Ably.
 * Permite filtrar por nome e selecionar um chat.
 */
const AblyChatList: React.FC<{ onSelectChat: (chatId: string) => void, selectedChatId?: string }> = ({ onSelectChat, selectedChatId }) => {
  const [query, setQuery] = React.useState("");
  
  // Filtra as salas com base na pesquisa do utilizador
  const filtered = React.useMemo(
    () => oneToOneRooms.filter(r => r.display.toLowerCase().includes(query.toLowerCase().trim())),
    [query]
  );

  return (
    <div className="flex flex-col w-full">
      <div className="p-3 border-b">
        <Input
          variant="brutal"
          placeholder="Pesquisar pessoa…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {filtered.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelectChat(room.id)}
          className={`flex w-full items-start gap-3 px-4 py-3 text-left border-b hover:bg-sidebar-accent transition-colors ${selectedChatId === room.id ? "bg-sidebar-accent" : ""}`}
        >
          <div className="shrink-0">
            <div className="size-9 rounded-full overflow-hidden bg-secondary grid place-items-center">
              <span className="text-xs font-medium">
                {initials(room.display)}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex w-full items-center justify-between">
              <span className="font-medium flex items-center gap-2">
                {room.unread && <span className="bg-primary size-2 rounded-full" />}
                <span className="truncate">{room.display}</span>
              </span>
              <span className="text-xs text-muted-foreground shrink-0">{room.time}</span>
            </div>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {room.lastMessage}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

// --- 3. Chat Window Component ---

/**
 * Janela de chat falsa para demonstração quando o Ably não está configurado ou pronto.
 * Utiliza componentes de UI locais em vez do SDK do Ably.
 */
const FakeChatWindow: React.FC<{ otherName: string; otherAvatar?: string; onBack?: () => void }> = ({ otherName, otherAvatar, onBack }) => {
  const messages = [
    { id: 1, from: "them" as const, text: "Olá! Precisa de ajuda com a sua reserva?", time: "10:28" },
    { id: 2, from: "me" as const, text: "Olá! Quero visitar o T2 na Baixa esta semana.", time: "10:29" },
    { id: 3, from: "them" as const, text: "Perfeito. Tenho disponibilidade na quinta às 15h.", time: "10:30" },
    { id: 4, from: "me" as const, text: "Ótimo, marque para quinta às 15h, por favor.", time: "10:31" },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <ChatHeader
        name={otherName}
        avatarUrl={otherAvatar}
        status="Demonstração"
        onBack={onBack}
      />

      <ChatMessageList messages={messages} />

      <ChatFooter disabled placeholder="Chat em demonstração" />
    </div>
  );
};

/**
 * Wrapper para a janela de chat do Ably.
 * Decide se deve mostrar a janela real do Ably ou a versão de demonstração (FakeChatWindow)
 * com base na disponibilidade do cliente Ably.
 */
const AblyChatWindowWrapper: React.FC<{ chatId: string; onBack?: () => void }> = ({ chatId, onBack }) => {
  const isReady = React.useContext(ChatReadyContext);

  const meta = oneToOneRooms.find(r => r.id === chatId);
  const otherName = meta?.display ?? "Chat";
  const otherAvatar = meta?.avatarUrl;

  // Cabeçalho personalizado para ser injetado no componente do Ably
  const Header = <ChatHeader name={otherName} avatarUrl={otherAvatar} status="Online" onBack={onBack} rightSlot={<div className="hidden md:block text-xs text-muted-foreground"><RoomInfo /></div>} />;

  if (!isReady) {
    return <FakeChatWindow otherName={otherName} otherAvatar={otherAvatar} onBack={onBack} />;
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <ChatRoomProvider name={chatId}>
        <ChatWindow roomName={chatId} customHeaderContent={Header} />
      </ChatRoomProvider>
    </div>
  );
};

// --- Strategy Implementation ---

const AblyChatStrategy: ChatStrategy = {
  name: "ably",
  Provider: AblyProvider,
  ChatList: AblyChatList,
  ChatWindow: AblyChatWindowWrapper,
};

export default AblyChatStrategy;
