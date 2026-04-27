"use client"

import * as React from "react"
import { toast } from "sonner"
import { NexusAlert, type NexusNoticeVariant } from "@/components/ui/feedback/nexus-alert"

export type NotifyId = string | number

export type NotifyOptions = {
  id?: NotifyId
  description?: string
  duration?: number
  mascotSrc?: string
}

function show(variant: NexusNoticeVariant, title: string, options?: NotifyOptions): NotifyId {
  const { id, duration, description, mascotSrc } = options ?? {}

  return toast.custom(
    () => React.createElement(NexusAlert, { variant, title, description, mascotSrc }),
    {
      id,
      duration,
    },
  )
}

export const notify = {
  success: (title: string, options?: NotifyOptions) => show("success", title, options),
  error: (title: string, options?: NotifyOptions) => show("error", title, options),
  warning: (title: string, options?: NotifyOptions) => show("warning", title, options),
  info: (title: string, options?: NotifyOptions) => show("info", title, options),
  message: (title: string, options?: NotifyOptions) => show("info", title, options),
  loading: (title: string, options?: NotifyOptions) =>
    show("loading", title, { ...options, duration: options?.duration ?? Number.POSITIVE_INFINITY }),
  dismiss: (id?: NotifyId) => toast.dismiss(id),
}
