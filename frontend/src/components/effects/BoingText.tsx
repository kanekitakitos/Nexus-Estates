"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

/**
 * Efeito de texto que anima letra a letra com squash + boing e um flash curto de cor.
 *
 * Objetivos:
 * - Leve (sem libs externas de animação).
 * - Funciona dentro de qualquer elemento pai (button/link/span).
 * - Permite repetir sem sair do elemento (pointer move volta a disparar após o ciclo acabar).
 * - Respeita prefers-reduced-motion.
 */
/** Timings partilhados (Nav, perfil, etc.) — combinar com `color` / `activeColor` explícitos. */
export const BOING_TEXT_DEFAULT_TIMING = {
  stagger: 0.04,
  duration: 0.4,
  squashScaleY: 0.35,
  boingScaleY: 1.5,
} as const

type BoingTextProps = {
  /**
   * Texto completo a renderizar. É dividido em caracteres (inclui espaços).
   */
  text: string
  /**
   * Cor base do texto e cor final após cada ciclo da animação.
   */
  color: string
  /**
   * Cor de destaque usada brevemente na fase de impacto (squash).
   */
  activeColor: string
  /**
   * Atraso entre o início de cada letra (segundos).
   */
  stagger?: number
  /**
   * Duração do ciclo por letra (segundos).
   */
  duration?: number
  /**
   * Valor mínimo do squash no eixo Y durante o impacto.
   */
  squashScaleY?: number
  /**
   * Valor máximo do boing no eixo Y logo após o squash.
   */
  boingScaleY?: number
}

export function BoingText({
  text,
  color,
  activeColor,
  stagger = 0.04,
  duration = 0.4,
  squashScaleY = 0.35,
  boingScaleY = 1.5,
}: BoingTextProps) {
  const shouldReduceMotion = useReducedMotion()
  const endTimerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  /**
   * "hover" executa um ciclo completo com stagger e faz reset automático para "rest".
   * "rest" é o estado estável (escala base + cor base).
   */
  const [phase, setPhase] = useState<"rest" | "hover">("rest")
  const chars = Array.from(text)

  useEffect(() => {
    return () => {
      if (endTimerRef.current) window.clearTimeout(endTimerRef.current)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (shouldReduceMotion) return <span style={{ color }}>{text}</span>

  const startCycle = () => {
    if (endTimerRef.current) window.clearTimeout(endTimerRef.current)
    endTimerRef.current = null
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    rafRef.current = null

    /**
     * Força restart mesmo estando em "hover":
     * alternar para "rest" e voltar a "hover" no frame seguinte garante que os
     * keyframes recomeçam do início.
     */
    setPhase("rest")
    rafRef.current = window.requestAnimationFrame(() => {
      setPhase("hover")
      rafRef.current = null
    })

    /**
     * Mantém o hover ativo até a última letra acabar:
     * total = duration + (n-1)*stagger.
     */
    const holdMs = Math.ceil((duration + Math.max(0, chars.length - 1) * stagger) * 1000)
    endTimerRef.current = window.setTimeout(() => {
      setPhase("rest")
      endTimerRef.current = null
    }, holdMs)
  }

  const onPointerEnter = () => startCycle()

  const onPointerMove = () => {
    if (phase !== "rest") return
    startCycle()
  }

  return (
    <span
      className="inline-flex items-baseline"
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
    >
      {chars.map((c, i) =>
        c === " " ? (
          <span key={`s-${i}`} className="inline-block w-[0.38em]" />
        ) : (
          <motion.span
            key={`${c}-${i}`}
            className="inline-block"
            style={{ color, transformOrigin: "bottom center" }}
            initial={false}
            animate={
              phase === "hover"
                ? {
                    scaleX: [1, 1.18, 0.88, 1.04, 0.98, 1],
                    scaleY: [1, squashScaleY, boingScaleY, 0.92, 1.04, 1],
                    /**
                     * A cor volta cedo (não apenas no fim) para evitar que a cor
                     * de destaque fique “presa” depois do boing terminar.
                     */
                    color: [color, activeColor, color, color, color, color],
                  }
                : {
                    scaleX: 1,
                    scaleY: 1,
                    color,
                  }
            }
            transition={
              phase === "hover"
                ? {
                    scaleX: { duration, times: [0, 0.28, 0.52, 0.72, 0.88, 1], ease: "easeOut", delay: i * stagger },
                    scaleY: { duration, times: [0, 0.28, 0.52, 0.72, 0.88, 1], type: "tween", ease: "easeOut", delay: i * stagger },
                    color:  { duration, times: [0, 0.28, 0.52, 0.72, 0.88, 1],  ease: "easeOut", delay: i * stagger },
                  }
                : {
                    duration: 0.12,
                    ease: "easeOut",
                  }
            }
          >
            {c}
          </motion.span>
        )
      )}
    </span>
  )
}
