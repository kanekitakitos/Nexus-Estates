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
import { ChatHeader, ChatFooter, ChatMessageList } from "@/features/chat/ui";
import { syncAxios } from "@/lib/axiosAPI";
import { toast } from "sonner";

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
        const clientId =
          localStorage.getItem("userId") ||
          localStorage.getItem("userEmail") ||
          undefined;

        const ablyClient = new Ably.Realtime({
            key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
            clientId,
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

/**
 * Componente que lista os chats disponíveis.
 *
 * Nota: a listagem de conversas deve ser alimentada por dados reais do backend (sync-service)
 * ou por metadata do Ably. Enquanto não existir um endpoint para listar conversas, mostramos
 * um estado vazio (sem dados simulados).
 */
const AblyChatList: React.FC<{ onSelectChat: (chatId: string) => void, selectedChatId?: string }> = ({ onSelectChat: _onSelectChat, selectedChatId: _selectedChatId }) => {
  void _onSelectChat
  void _selectedChatId

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 text-sm text-muted-foreground">
        Sem conversas disponíveis.
      </div>
    </div>
  );
};

// --- 3. Chat Window Component ---

/**
 * Janela de chat de fallback quando o Ably não está configurado ou pronto.
 */
const FallbackChatWindow: React.FC<{ otherName: string; otherAvatar?: string; onBack?: () => void; bookingId: string }> = ({ otherName, otherAvatar, onBack, bookingId }) => {
  const [messages, setMessages] = React.useState<DemoChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        // O ID da reserva deve ser convertido para Long no backend, mas aqui passamos como string
        const response = await syncAxios.get<DemoChatMessageApi[]>(`/messages/${bookingId}`);
        const mapped: DemoChatMessage[] = response.data.map((m) => ({
          id: m.id,
          from: String(m.senderId) === 'me' ? 'me' : 'them',
          text: m.content,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(mapped);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
        toast.error("Não foi possível carregar o histórico do chat.");
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) fetchMessages();
  }, [bookingId]);

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <ChatHeader
        name={otherName}
        avatarUrl={otherAvatar}
        status={isLoading ? "A carregar..." : "Indisponível"}
        onBack={onBack}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ChatMessageList messages={messages} />
      )}

      <ChatFooter disabled placeholder="Chat indisponível" />
    </div>
  );
};

type DemoChatMessage = { id: string | number; text: string; time?: string; from: "me" | "them" };

type DemoChatMessageApi = { id: string | number; senderId: string | number; content: string; createdAt: string };

/**
 * Wrapper para a janela de chat do Ably.
 * Decide se deve mostrar a janela real do Ably ou a versão de fallback (FallbackChatWindow)
 * com base na disponibilidade do cliente Ably.
 */
const AblyChatWindowWrapper: React.FC<{ chatId: string; onBack?: () => void }> = ({ chatId, onBack }) => {
  const isReady = React.useContext(ChatReadyContext);

  const otherName = "Chat";
  const otherAvatar = undefined;
  const bookingId = chatId;

  // Cabeçalho personalizado para ser injetado no componente do Ably
  const Header = <ChatHeader name={otherName} avatarUrl={otherAvatar} status="Online" onBack={onBack} rightSlot={<div className="hidden md:block text-xs text-muted-foreground"><RoomInfo /></div>} />;

  if (!isReady) {
    return <FallbackChatWindow otherName={otherName} otherAvatar={otherAvatar} onBack={onBack} bookingId={bookingId} />;
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
