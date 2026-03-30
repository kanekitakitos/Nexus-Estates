"use client"

import { motion } from "framer-motion"
import { TICKER_ITEMS } from "../tokens"

export function Ticker({ fg }: { fg: string }) {
  const items = [...TICKER_ITEMS,...TICKER_ITEMS,...TICKER_ITEMS,...TICKER_ITEMS,...TICKER_ITEMS]
  return (
      <div className="relative overflow-hidden w-full py-3 border-t" style={{ borderColor: `${fg}22` }}>
        <div style={{ display:"flex", gap:"2rem", whiteSpace:"nowrap",
          animation:"ticker 30s linear infinite", willChange:"transform" }}>
          {items.map((item, i) => (
              <span key={i} className="text-[10px] font-mono uppercase tracking-[0.28em] shrink-0" style={{ color: fg }}>
            {item}{" "}
                <motion.span
                  className="mx-2 inline-block"
                  animate={{ y: [0, -2, 0], rotate: [0, -8, 8, 0], scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay: (i % 10) * 0.08 }}
                >
                  ✦
                </motion.span>
          </span>
          ))}
        </div>
        <style>{`@keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
      </div>
  )
}
