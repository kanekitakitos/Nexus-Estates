"use client";

import React from "react";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Avatar as UiAvatar, AvatarImage, AvatarFallback } from "@/components/ui/data-display/avatar";
import { ArrowLeft } from "lucide-react";

/**
 * Função auxiliar para gerar as iniciais de um nome.
 * Pega a primeira letra de cada palavra, junta-as e retorna os primeiros 2 caracteres em maiúsculas.
 * Exemplo: "Rui Costa" -> "RC"
 */
export const initials = (name: string) =>
  name
    .split(" ") // Divide o nome em palavras
    .map((s) => s[0]) // Pega a primeira letra de cada palavra
    .join("") // Junta as letras
    .slice(0, 2) // Limita a 2 caracteres
    .toUpperCase(); // Converte para maiúsculas

/**
 * Componente de cabeçalho para a janela de chat.
 * Exibe o avatar do utilizador, nome, estado e um botão de voltar opcional.
 * 
 * @param name - O nome da pessoa com quem se está a conversar.
 * @param avatarUrl - URL para a imagem do avatar.
 * @param status - Texto de estado (ex: "Online", "A escrever...").
 * @param onBack - Função de callback para o botão de voltar (útil para visualizações móveis).
 * @param rightSlot - Componente opcional para renderizar no lado direito (ex: ícone de definições).
 */
export const ChatHeader: React.FC<{
  name: string;
  avatarUrl?: string;
  status?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}> = ({ name, avatarUrl, status, onBack, rightSlot }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b">
    {/* Renderiza o botão de voltar apenas se a função onBack for fornecida */}
    {onBack && (
      <Button variant="outline" size="icon-sm" onClick={onBack} aria-label="Voltar">
        <ArrowLeft className="size-4" />
      </Button>
    )}
    <UiAvatar>
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </UiAvatar>
    <div className="flex flex-col">
      <span className="text-sm font-medium">{name}</span>
      {/* Renderiza o estado apenas se estiver definido */}
      {status ? <span className="text-xs text-muted-foreground">{status}</span> : null}
    </div>
    <div className="ml-auto">{rightSlot}</div>
  </div>
);

/**
 * Componente que representa um único balão de mensagem de chat.
 * Alinha à direita para mensagens "me" (minhas) e à esquerda para "them" (deles).
 * 
 * @param text - O conteúdo da mensagem.
 * @param time - O carimbo de data/hora da mensagem.
 * @param from - Indica quem enviou a mensagem ("me" ou "them").
 */
export const ChatMessageBubble: React.FC<{
  text: string;
  time?: string;
  from: "me" | "them";
}> = ({ text, time, from }) => {
  const isMe = from === "me";
  return (
    // Alinha o balão à direita se for "me", senão à esquerda
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          // Estilos diferentes para mensagens enviadas vs recebidas
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

/**
 * Componente para renderizar uma lista de mensagens de chat.
 * Lida com a iteração sobre o array de mensagens.
 * 
 * @param messages - Array de objetos de mensagem contendo id, texto, hora e informação do remetente.
 */
export const ChatMessageList: React.FC<{
  messages: Array<{ id: string | number; text: string; time?: string; from: "me" | "them" }>;
}> = ({ messages }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
    {messages.map((m) => (
      <ChatMessageBubble key={m.id} text={m.text} time={m.time} from={m.from} />
    ))}
  </div>
);

/**
 * Componente de rodapé para a janela de chat contendo o campo de entrada e botão de enviar.
 * Gere o estado local para o texto de entrada e aciona o callback onSend.
 * 
 * @param placeholder - Texto de placeholder para o campo de entrada.
 * @param disabled - Se o campo e o botão devem estar desativados.
 * @param onSend - Função de callback acionada quando o utilizador envia uma mensagem.
 */
export const ChatFooter: React.FC<{
  placeholder?: string;
  disabled?: boolean;
  onSend?: (text: string) => void;
}> = ({ placeholder = "Mensagem", disabled, onSend }) => {
  const [text, setText] = React.useState("");
  
  const send = () => {
    // Evita envio de mensagens vazias ou se estiver desativado
    if (!text.trim() || disabled) return;
    onSend?.(text.trim());
    setText(""); // Limpa o campo após envio
  };

  return (
    <div className="border-t p-3 flex gap-2">
      <Input
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          // Permite enviar com a tecla Enter
          if (e.key === "Enter") send();
        }}
        disabled={disabled}
        className="flex-1"
      />
      <Button onClick={send} disabled={disabled}>
        Enviar
      </Button>
    </div>
  );
};
