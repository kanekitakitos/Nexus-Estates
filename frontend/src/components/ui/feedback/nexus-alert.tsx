"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Alert } from "@/components/ui/alert"

export type NexusNoticeVariant = "success" | "error" | "warning" | "info" | "loading"

type VariantConfig = {
  titleClassName: string
  borderClassName: string
  accentClassName: string
  mascotSrc: string
  mascotAlt: string
}

const DEFAULT_MASCOT_SRC = "/ico/icoC.png"

const VARIANTS: Record<NexusNoticeVariant, VariantConfig> = {
  success: {
    titleClassName: "text-emerald-600",
    borderClassName: "border-emerald-600/40",
    accentClassName: "bg-emerald-500/10 text-emerald-700",
    mascotSrc: DEFAULT_MASCOT_SRC,
    mascotAlt: "Mascote (sucesso)",
  },
  error: {
    titleClassName: "text-rose-600",
    borderClassName: "border-rose-600/40",
    accentClassName: "bg-rose-500/10 text-rose-700",
    mascotSrc: DEFAULT_MASCOT_SRC,
    mascotAlt: "Mascote (erro)",
  },
  warning: {
    titleClassName: "text-amber-600",
    borderClassName: "border-amber-600/40",
    accentClassName: "bg-amber-500/10 text-amber-700",
    mascotSrc: DEFAULT_MASCOT_SRC,
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
  const cfg = VARIANTS[variant]
  const finalMascotSrc = mascotSrc ?? cfg.mascotSrc

  return (
    <Alert
      className={cn(
        "rounded-2xl border-2 bg-background text-foreground shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.22)]",
        cfg.borderClassName,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("relative mt-0.5 size-10 shrink-0 overflow-hidden rounded-xl border-2", cfg.borderClassName, cfg.accentClassName)}>
          <Image src={finalMascotSrc} alt={cfg.mascotAlt} fill sizes="40px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <div className={cn("font-mono text-[10px] font-black uppercase tracking-widest", cfg.titleClassName)}>{title}</div>
          {description ? (
            <div className="mt-1 text-xs text-muted-foreground font-mono leading-relaxed">{description}</div>
          ) : null}
        </div>
      </div>
    </Alert>
  )
}
