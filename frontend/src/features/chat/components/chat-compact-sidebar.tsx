"use client"

import * as React from "react"
import { useChatStrategy } from "@/features/chat"

export function ChatCompactSidebar() {
  const chatStrategy = useChatStrategy()
  const ChatList = chatStrategy.ChatList
  const ChatWindow = chatStrategy.ChatWindow

  const [selectedChatId, setSelectedChatId] = React.useState<string | undefined>(undefined)

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

