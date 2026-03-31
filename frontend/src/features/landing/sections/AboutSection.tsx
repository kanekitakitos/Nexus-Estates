"use client"

import { motion } from "framer-motion"
import { B, SECTIONS } from "../tokens"
import { Title } from "../ui/Title"

export function AboutSection({ s }: { s: typeof SECTIONS[0] }) {
  return (
      <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 overflow-hidden">
        <motion.span className="font-mono text-[9px] uppercase tracking-[0.32em] mb-4 block relative z-20"
                     style={{ color:`${B.cream}45` }}
                     initial={{ opacity:0 }} animate={{ opacity:1 }}>
          {s.label} — Sobre
        </motion.span>
        <div className="grid md:grid-cols-2 gap-12 items-center relative z-20">
          <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(2.8rem,6.4vw,6.4rem)" />
          <div className="flex flex-col gap-3">
            {[
              { title:"Missão", body:"Reduzir a fricção operacional no AL. Centralizamos tudo para o anfitrião focar no que importa.", n:"01" },
              { title:"Tecnologia", body:"Stack moderna, sync em tempo real, API robusta. Construído para anfitriões exigentes.", n:"02" },
              { title:"Suporte", body:"Equipa dedicada que entende o mercado português. Sempre ao teu lado.", n:"03" },
            ].map((card, i) => (
                <motion.div key={card.n}
                            initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }}
                            transition={{ delay:0.3 + i * 0.12, duration:0.7, ease:[0.16,1,0.3,1] }}
                            className="p-5 relative overflow-hidden"
                            style={{
                              border:`2px solid rgba(240,236,217,0.55)`,
                              boxShadow:"6px 6px 0 0 rgba(240,236,217,0.18)",
                              background:"rgba(240,236,217,0.03)",
                            }}
                            whileHover={{ rotate: i % 2 === 0 ? -0.35 : 0.35, scale: 1.015 }}
                            whileTap={{ scale: 0.99 }}
                            data-hover>
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <span className="font-mono text-[9px] tracking-widest" style={{ color:B.orange }}>{card.n}</span>
                    <motion.span
                      className="font-mono text-xs"
                      style={{ color:B.cream }}
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      {card.title} →
                    </motion.span>
                  </div>
                  <motion.p
                    className="text-xs leading-relaxed relative z-10"
                    style={{ color:`${B.cream}45` }}
                    animate={{ opacity: [0.92, 1, 0.92] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                  >
                    {card.body}
                  </motion.p>
                </motion.div>
            ))}
          </div>
        </div>
      </div>
  )
}
