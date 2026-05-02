"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Alert } from "@/components/ui/alert"

export type NexusNoticeVariant = "success" | "error" | "warning" | "info" | "loading"

export type NexusNoticeVariantConfig = {
  titleClassName: string
  borderClassName: string
  accentClassName: string
  mascotSrc: string
  mascotAlt: string
}

const DEFAULT_MASCOT_SRC = "/ico/icoC.png"
const SUCCESS_MASCOT_SRC = "/notifications/success.png"
const ALERT_MASCOT_SRC = "/notifications/alert.png"




export const NEXUS_NOTICE_VARIANTS: Record<NexusNoticeVariant, NexusNoticeVariantConfig> = {
  success: {
    titleClassName: "text-emerald-600",
    borderClassName: "border-emerald-600/40",
    accentClassName: "bg-emerald-500/10 text-emerald-700",
    mascotSrc: SUCCESS_MASCOT_SRC,
    mascotAlt: "Mascote (sucesso)",
  },
  error: {
    titleClassName: "text-rose-600",
    borderClassName: "border-rose-600/40",
    accentClassName: "bg-rose-500/10 text-rose-700",
    mascotSrc: ALERT_MASCOT_SRC,
    mascotAlt: "Mascote (erro)",
  },
  warning: {
    titleClassName: "text-amber-600",
    borderClassName: "border-amber-600/40",
    accentClassName: "bg-amber-500/10 text-amber-700",
    mascotSrc: ALERT_MASCOT_SRC,
    mascotAlt: "Mascote (aviso)",
  },
  info: {
    titleClassName: "text-sky-600",
    borderClassName: "border-sky-600/40",
    accentClassName: "bg-sky-500/10 text-sky-700",
    mascotSrc: DEFAULT_MASCOT_SRC,
    mascotAlt: "Mascote (info)",
  },
  loading: {
    titleClassName: "text-primary",
    borderClassName: "border-foreground/30",
    accentClassName: "bg-primary/10 text-primary",
    mascotSrc: DEFAULT_MASCOT_SRC,
    mascotAlt: "Mascote (a carregar)",
  },
}

export function getNexusNoticeVariantConfig(variant: NexusNoticeVariant) {
  return NEXUS_NOTICE_VARIANTS[variant]
}

export function NexusAlert({
  variant,
  title,
  description,
  className,
  mascotSrc,
}: {
  variant: NexusNoticeVariant
  title: string
  description?: string
  className?: string
  mascotSrc?: string
}) {
  const cfg = getNexusNoticeVariantConfig(variant)
  const finalMascotSrc = mascotSrc ?? cfg.mascotSrc

  return (
    <Alert
      className={cn(
        "!grid-cols-[auto_1fr] !items-center gap-x-3 rounded-2xl border-2 bg-background text-foreground shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.22)]",
        cfg.borderClassName,
        className,
      )}
    >
      <div
        className={cn(
          "relative mt-0.5 size-17 shrink-0 overflow-hidden rounded-2xl",
          cfg.accentClassName,
        )}
      >
        <Image src={finalMascotSrc} alt={cfg.mascotAlt} fill sizes="76px" className="object-cover" />
      </div>
      <div className="min-w-0 flex flex-col items-center justify-center text-center">
        <div className={cn("font-mono text-[11px] font-black uppercase tracking-widest leading-tight break-words text-center", cfg.titleClassName)}>
          {title}
        </div>
        {description ? (
          <div className="mt-1 text-[11px] text-muted-foreground font-mono leading-snug break-words text-center">
            {description}
          </div>
        ) : null}
      </div>
    </Alert>
  )
}
