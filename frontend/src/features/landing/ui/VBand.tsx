"use client"

import { useReducedMotion } from "framer-motion"

export function VBand({ fg }: { fg: string }) 
{
  const reduce = useReducedMotion()
  return (
      <div className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center overflow-hidden border-r"
           style={{ borderColor:`${fg}08` }}>
        <div className="flex flex-col gap-8"
             style={{ animation: reduce ? "none" : "vband 22s linear infinite", willChange: reduce ? undefined : "transform" }}>
          {[...Array(20)].map((_,i) => (
              <span key={i} className="font-mono text-[7px] uppercase tracking-[0.5em] -rotate-90 whitespace-nowrap"
                    style={{ color:`${fg}12` }}>Nexus</span>
          ))}
        </div>
        <style>{`@keyframes vband { from{ transform: translateY(0%) } to{ transform: translateY(-50%) } }`}</style>
      </div>
  )
}
