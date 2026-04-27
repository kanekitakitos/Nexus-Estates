"use client"

import { useReducedMotion } from "framer-motion"
import { TICKER_ITEMS } from "../lib/tokens"

export function Ticker({ fg }: { fg: string }) {
  const reduce = useReducedMotion()

  // Exactly 2 sets — animation goes from 0 to -50% = seamless loop
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="relative overflow-hidden w-full py-2">
      <div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          animation: reduce ? "none" : "ticker 30s linear infinite",
          willChange: reduce ? undefined : "transform",
        }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="text-[10px] font-mono uppercase tracking-[0.28em] shrink-0"
            style={{ color: fg, paddingRight: "2.5rem" }}
          >
            {item}
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                alignItems: "center",
                verticalAlign: "middle",
                lineHeight: 1,
                paddingLeft: "2.5rem",
                fontSize: "0.6em",
                opacity: 0.7,
              }}
            >
              ✦
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
      `}</style>
    </div>
  )
}
