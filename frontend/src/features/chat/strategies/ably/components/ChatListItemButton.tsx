"use client";

import React from "react";

export const ChatListItemButton: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  rightLabel: string;
  selected: boolean;
  onSelect: (chatId: string) => void;
}> = ({ id, title, subtitle, rightLabel, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`flex w-full min-w-0 items-start px-4 py-3 text-left border-b hover:bg-sidebar-accent transition-colors ${
        selected ? "bg-sidebar-accent" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex w-full items-center justify-between">
          <span className="font-medium min-w-0 flex items-center gap-2">
            <span className="block truncate">{title}</span>
          </span>
          <span className="text-xs text-muted-foreground shrink-0">{rightLabel}</span>
        </div>
        <span className="text-xs text-muted-foreground block truncate">{subtitle}</span>
      </div>
    </button>
  );
};
