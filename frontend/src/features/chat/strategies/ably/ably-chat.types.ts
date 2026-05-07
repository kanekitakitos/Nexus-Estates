export type ChatKind = "booking" | "inquiry" | "property";

export type ParsedChatId = {
  kind: ChatKind;
  id: string;
};

export type UiChatMessage = {
  id: string | number;
  text: string;
  time?: string;
  from: "me" | "them";
};

