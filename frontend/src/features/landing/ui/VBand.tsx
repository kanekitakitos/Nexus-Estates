"use client"

import { motion } from "framer-motion"

export function VBand({ fg }: { fg: string }) {
  return (
      <div className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center overflow-hidden border-r"
           style={{ borderColor:`${fg}08` }}>
        <motion.div className="flex flex-col gap-8"
                    animate={{ y:["0%","-50%"] }}
                    transition={{ duration:22, ease:"linear", repeat:Infinity }}>
          {[...Array(20)].map((_,i) => (
              <span key={i} className="font-mono text-[7px] uppercase tracking-[0.5em] -rotate-90 whitespace-nowrap"
                    style={{ color:`${fg}12` }}>Nexus</span>
          ))}
        </motion.div>
      </div>
  )
}
