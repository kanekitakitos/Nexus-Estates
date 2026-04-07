"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function ProfilePanel({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative rounded-3xl border border-[var(--fg-color)]/10 bg-[var(--panel-bg)]/80 backdrop-blur-xl p-2",
        "shadow-xl shadow-[var(--fg-color)]/5",
        className,
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[var(--fg-color)]/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-[var(--primary-accent)]" />
            <h2 className="text-2xl font-black italic tracking-tight text-[var(--fg-color)] font-serif uppercase">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--fg-color)]/60 pl-8">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-3 pl-8 md:pl-0">
            {action}
          </div>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.section>
  )
}


