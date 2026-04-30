"use client"

import * as React from "react"
import { useChatStrategy } from "@/features/chat"

/**
 * Sidebar compacta do chat.
 *
 * - Quando `initialChatId` existe, abre diretamente a janela da conversa (usado por flows como "Contactar proprietário").
 * - Caso contrário, mostra a lista de conversas.
 */
export function ChatCompactSidebar({ initialChatId }: { initialChatId?: string }) {
  const chatStrategy = useChatStrategy()
  const ChatList = chatStrategy.ChatList
  const ChatWindow = chatStrategy.ChatWindow

  const [selectedChatId, setSelectedChatId] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    if (!initialChatId) return
    setSelectedChatId(initialChatId)
  }, [initialChatId])

  return (
    <div className="flex flex-col h-full">
      {/* Painel: Lista/Janela do Chat */}
      {!selectedChatId ? (
        <div className="h-[calc(100vh-56px)] overflow-y-auto animate-slide-in-left">
          {/* Painel: Lista de Conversas */}
          <ChatList
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId}
          />
        </div>
      ) : (
        <div key={selectedChatId} className="flex-1 h-[calc(100vh-56px)] overflow-hidden animate-slide-in-right">
          {/* Painel: Janela da Conversa */}
          <ChatWindow chatId={selectedChatId} onBack={() => setSelectedChatId(undefined)} />
        </div>
      )}
    </div>
  )
}
