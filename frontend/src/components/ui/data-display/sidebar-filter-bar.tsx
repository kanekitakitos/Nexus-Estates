"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function SidebarFilterBar({
  query,
  onQueryChange,
  placeholder = "PESQUISAR...",
  icon,
  children,
  className,
}: {
  query: string
  onQueryChange: (value: string) => void
  placeholder?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "sticky top-0 z-20 rounded-[1.15rem] border-2 border-[#0D0D0D] dark:border-zinc-700",
        "bg-white/75 dark:bg-black/70 backdrop-blur-md",
        "shadow-[8px_8px_0_0_rgba(13,13,13,0.9)] dark:shadow-[8px_8px_0_0_rgba(0,0,0,0.6)]",
        "space-y-3 p-3",
        className,
      )}
    >
      {/* Pesquisa */}
      <div className="grid gap-2">
        <div className="relative group w-full">
          <div className="absolute top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-300 left-3">
            {icon ?? <Search className="h-4 w-4" strokeWidth={3} />}
          </div>
          <input
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className={cn(
              "w-full rounded-xl border-2 border-[#0D0D0D] bg-white pr-4 font-mono font-bold uppercase tracking-widest text-[#0D0D0D] transition-all placeholder:font-black placeholder:text-[#8C7B6B]/55 focus:bg-white focus:shadow-[4px_4px_0_0_#0D0D0D] focus:outline-none dark:border-zinc-600 dark:bg-zinc-950 dark:text-white",
              "pl-9 py-2 text-[9px]",
            )}
          />
        </div>
      </div>

      {/* Filtros */}
      {children ? <div className="flex flex-wrap items-center gap-2 justify-start">{children}</div> : null}
    </motion.div>
  )
}

