"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getNexusNoticeVariantConfig, type NexusNoticeVariant } from "@/components/ui/feedback/nexus-alert"

export function NexusAlertDialog({
  open,
  onOpenChange,
  variant = "warning",
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isConfirming = false,
  onConfirm,
  mascotSrc,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: NexusNoticeVariant
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isConfirming?: boolean
  onConfirm: () => void
  mascotSrc?: string
}) {
  const cfg = getNexusNoticeVariantConfig(variant)
  const finalMascotSrc = mascotSrc ?? cfg.mascotSrc

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "rounded-2xl border-2 bg-background shadow-[6px_6px_0_0_rgb(0,0,0)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.16)]",
          cfg.borderClassName,
          "p-5",
        )}
        size="sm"
      >
        <AlertDialogHeader className="place-items-start text-left gap-3">
          <div className="flex items-start gap-3">
            <div className={cn("relative size-12 shrink-0 overflow-hidden rounded-2xl border-2 border-foreground/20", cfg.accentClassName)}>
              <Image src={finalMascotSrc} alt="Mascote" fill sizes="48px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <AlertDialogTitle className={cn("font-serif text-lg font-black italic tracking-tight", cfg.titleClassName)}>{title}</AlertDialogTitle>
              {description ? (
                <AlertDialogDescription className="mt-1 font-mono text-[11px] leading-relaxed">{description}</AlertDialogDescription>
              ) : null}
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel
            disabled={isConfirming}
            className="h-9 rounded-xl border-2 border-foreground/30 bg-background font-mono text-[10px] font-black uppercase tracking-widest"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isConfirming}
            className="h-9 rounded-xl border-2 border-foreground bg-primary text-primary-foreground font-mono text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            {isConfirming ? "A processar…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
