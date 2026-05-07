"use client";

import React from "react";
import { BookingService, type BookingResponse } from "@/services/booking.service";
import { SyncService } from "@/services/sync.service";
import { AuthService } from "@/services/auth.service";
import { PropertyService } from "@/services/property.service";
import type { SyncConversation } from "@/types/sync";
import { resolvePropertyMeta, type PropertyMeta } from "../ably-chat.utils";

export function useChatListData() {
  const [query, setQuery] = React.useState("");
  const [bookings, setBookings] = React.useState<BookingResponse[]>([]);
  const [conversations, setConversations] = React.useState<SyncConversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [propertyMeta, setPropertyMeta] = React.useState<Record<number, PropertyMeta>>({});
  const propertyMetaRef = React.useRef<Record<number, PropertyMeta>>({});

  React.useEffect(() => {
    let cancelled = false;
    const setPropertyMetaSafe = (updater: (prev: Record<number, PropertyMeta>) => Record<number, PropertyMeta>) => {
      if (cancelled) return;
      setPropertyMeta((prev) => {
        const next = updater(prev);
        propertyMetaRef.current = next;
        return next;
      });
    };

    const load = async () => {
      if (!AuthService.getSession().isAuthenticated) return;

      try {
        setIsLoading(true);

        const [b, c] = await Promise.all([
          BookingService.getMyBookings().catch(() => []),
          SyncService.listMyConversations().catch(() => []),
        ]);

        if (cancelled) return;
        setBookings(b);
        setConversations(c);

        const propertyIds = Array.from(
          new Set<number>([
            ...b.map((x) => Number(x.propertyId)).filter((n) => Number.isFinite(n)),
            ...c.map((x) => Number(x.propertyId)).filter((n) => Number.isFinite(n)),
          ]),
        );

        const missing = propertyIds.filter((id) => propertyMetaRef.current[id] == null);
        if (missing.length === 0) return;

        const pairs = await Promise.all(
          missing.map(async (id) => {
            try {
              const data = await PropertyService.getPropertyById(id);
              return [id, resolvePropertyMeta(data, id)] as const;
            } catch {
              return [id, { title: `Property ${id}`, location: "" }] as const;
            }
          }),
        );

        if (cancelled) return;

        setPropertyMetaSafe((prev) => {
          const next = { ...prev };
          for (const [id, meta] of pairs) next[id] = meta;
          return next;
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { bookings, conversations };

    const matches = (text: string | undefined) => (text ?? "").toLowerCase().includes(q);

    return {
      bookings: bookings.filter((b) => {
        const meta = propertyMetaRef.current[Number(b.propertyId)];
        return (
          String(b.id).includes(q) ||
          String(b.propertyId).includes(q) ||
          matches(meta?.title) ||
          matches(meta?.location)
        );
      }),
      conversations: conversations.filter((c) => {
        const meta = propertyMetaRef.current[Number(c.propertyId)];
        return (
          String(c.inquiryId).includes(q) ||
          String(c.propertyId).includes(q) ||
          matches(meta?.title) ||
          matches(meta?.location)
        );
      }),
    };
  }, [bookings, conversations, query]);

  return { query, setQuery, isLoading, propertyMeta, filtered };
}

