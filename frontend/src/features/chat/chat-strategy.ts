import React from 'react';

/**
 * Interface que define a estrutura de uma estratégia de chat.
 * Permite trocar a implementação do chat (ex: Ably, Firebase, WebSocket próprio)
 * sem alterar o resto da aplicação.
 */
export interface ChatStrategy {
  /**
   * Nome identificador da estratégia (ex: "ably", "firebase").
   */
  name: string;

  /**
   * Provider global para o serviço de chat.
   * Responsável por inicializar conexões, gerir autenticação e fornecer contexto (ex: temas).
   * Deve envolver a parte da aplicação que utiliza o chat.
   */
  Provider: React.FC<{ children: React.ReactNode }>;
  
  /**
   * Componente que lista os chats ou salas disponíveis.
   * Projetado para caber numa barra lateral (sidebar).
   * 
   * @param onSelectChat - Callback invocado quando o utilizador clica num chat.
   * @param selectedChatId - ID do chat atualmente selecionado (para destacar na lista).
   */
  ChatList: React.FC<{ onSelectChat: (chatId: string) => void, selectedChatId?: string }>;
  
  /**
   * Componente que exibe a conversa ativa.
   * Mostra as mensagens e permite enviar novas.
   * 
   * @param chatId - ID do chat a ser exibido.
   * @param onBack - Callback opcional para voltar à lista (útil em mobile).
   */
  ChatWindow: React.FC<{ chatId: string; onBack?: () => void }>;
}
