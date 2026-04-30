"use client";

import React from "react";
import { BookingService } from "@/services/booking.service";
import { PropertyService } from "@/services/property.service";
import { SyncService } from "@/services/sync.service";
import type { ParsedChatId } from "../ably-chat.types";
import { resolvePropertyMeta } from "../ably-chat.utils";

export function useChatHeaderMeta(parsed: ParsedChatId) {
  const [headerMeta, setHeaderMeta] = React.useState<{ title: string; location: string } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const setSafe = (meta: { title: string; location: string } | null) => {
      if (!cancelled) setHeaderMeta(meta);
    };

    const loadMeta = async () => {
      try {
        if (parsed.kind === "booking") {
          const booking = await BookingService.getBookingById(Number(parsed.id));
          const property = await PropertyService.getPropertyById(booking.propertyId);
          setSafe(resolvePropertyMeta(property, booking.propertyId));
          return;
        }

        if (parsed.kind === "property") {
          const propertyId = Number(parsed.id);
          const property = await PropertyService.getPropertyById(propertyId);
          setSafe(resolvePropertyMeta(property, propertyId));
          return;
        }

        const conversations = await SyncService.listMyConversations();
        const inquiryId = Number(parsed.id);
        const convo = conversations.find((c) => Number(c.inquiryId) === inquiryId);
        if (!convo) {
          setSafe({ title: `Inquiry ${parsed.id}`, location: "" });
          return;
        }
        const property = await PropertyService.getPropertyById(convo.propertyId);
        setSafe(resolvePropertyMeta(property, convo.propertyId));
      } catch {
        setSafe({ title: parsed.kind === "booking" ? `Booking ${parsed.id}` : `Inquiry ${parsed.id}`, location: "" });
      }
    };

    void loadMeta();
    return () => {
      cancelled = true;
    };
  }, [parsed.id, parsed.kind]);

  return headerMeta;
}

