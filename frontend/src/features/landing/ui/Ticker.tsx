"use client"

import { useReducedMotion } from "framer-motion"
import { useMemo } from "react"
import { TICKER_ITEMS } from "../tokens"

export function Ticker({ fg }: { fg: string }) 
{
  const reduce = useReducedMotion()
  const items = useMemo(() => Array.from({ length: 3 }).flatMap(() => TICKER_ITEMS), [])
  return (
    <div className="relative overflow-hidden w-full py-2">
      <div
        style={{
          display: "flex",
          gap: "2rem",
          whiteSpace: "nowrap",
          animation: reduce ? "none" : "ticker 30s linear infinite",
          willChange: reduce ? undefined : "transform",
        }}
      >
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className="text-[10px] font-mono uppercase tracking-[0.28em] shrink-0" style={{ color: fg }}>
            {item} <span aria-hidden className="mx-2 inline-block">✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </div>
  )
}
